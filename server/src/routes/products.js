import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const allowed = ['name','category','brand','serialNumber','purchaseDate','purchasePrice','store','returnDeadline','warrantyEndDate','warrantyProvider','notes'];
    const data = Object.fromEntries(allowed.filter(k => req.body?.[k] !== undefined).map(k => [k, req.body[k]]));
    if (!data.name || !data.purchaseDate || data.purchasePrice === undefined) {
      return res.status(400).json({ message: 'Name, purchase date, and purchase price are required.' });
    }
    const product = await Product.create({ ...data, owner: req.userId });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name','category','brand','serialNumber','purchaseDate','purchasePrice','store','returnDeadline','warrantyEndDate','warrantyProvider','notes'];
    const updates = Object.fromEntries(allowed.filter(k => req.body?.[k] !== undefined).map(k => [k, req.body[k]]));
    const product = await Product.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) { next(err); }
});

export default router;
