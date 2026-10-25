/**
 * Repair log routes — all operations are scoped to the authenticated user.
 * Every repair is linked to a product that the caller owns.
 */
import { Router } from 'express';
import RepairLog from '../models/RepairLog.js';
import Product   from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/repairs?productId=<id>  — list repairs for one product
router.get('/', async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: 'productId query parameter is required.' });
    // Verify caller owns the product
    const product = await Product.findOne({ _id: productId, owner: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const logs = await RepairLog.find({ product: productId, owner: req.userId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) { next(err); }
});

// POST /api/repairs — add a repair log
router.post('/', async (req, res, next) => {
  try {
    const { productId, date, description, cost, shop, notes } = req.body || {};
    if (!productId || !date || !description || cost === undefined) {
      return res.status(400).json({ message: 'productId, date, description, and cost are required.' });
    }
    // Verify caller owns the product
    const product = await Product.findOne({ _id: productId, owner: req.userId });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const log = await RepairLog.create({
      product: productId,
      owner: req.userId,
      date,
      description: description.trim(),
      cost: Number(cost),
      shop: shop?.trim(),
      notes: notes?.trim(),
    });

    // Keep the denormalised repairCostTotal on the Product in sync
    const total = await RepairLog.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, sum: { $sum: '$cost' } } },
    ]);
    product.repairCostTotal = total[0]?.sum ?? 0;
    await product.save();

    res.status(201).json(log);
  } catch (err) { next(err); }
});

// PATCH /api/repairs/:id — update a repair log
router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['date', 'description', 'cost', 'shop', 'notes'];
    const updates = Object.fromEntries(
      allowed.filter(k => req.body?.[k] !== undefined).map(k => [k, req.body[k]])
    );
    const log = await RepairLog.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ message: 'Repair log not found.' });

    // Recalculate total
    const total = await RepairLog.aggregate([
      { $match: { product: log.product } },
      { $group: { _id: null, sum: { $sum: '$cost' } } },
    ]);
    await Product.findByIdAndUpdate(log.product, { repairCostTotal: total[0]?.sum ?? 0 });

    res.json(log);
  } catch (err) { next(err); }
});

// DELETE /api/repairs/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const log = await RepairLog.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!log) return res.status(404).json({ message: 'Repair log not found.' });

    const total = await RepairLog.aggregate([
      { $match: { product: log.product } },
      { $group: { _id: null, sum: { $sum: '$cost' } } },
    ]);
    await Product.findByIdAndUpdate(log.product, { repairCostTotal: total[0]?.sum ?? 0 });

    res.json({ message: 'Repair log deleted.' });
  } catch (err) { next(err); }
});

export default router;
