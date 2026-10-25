import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { requireAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router  = Router();
const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const maxMb = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 8));
const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`)
});

const upload = multer({
  storage,
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    allowedMime.has(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error('Only JPG, PNG, WEBP, and PDF files are accepted.'), { status: 400 }))
});

// POST /api/uploads/receipt  — upload a receipt file
router.post('/receipt', requireAuth, upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a receipt file first.' });
  res.status(201).json({
    message: 'File uploaded successfully.',
    fileName: req.file.filename,
    // Return only the filename; the client uses the /api/uploads/file/:name route to fetch it
  });
});

// POST /api/uploads/photo  — upload a product photo
router.post('/photo', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a photo file first.' });
  res.status(201).json({
    message: 'Photo uploaded successfully.',
    fileName: req.file.filename,
  });
});

/**
 * GET /api/uploads/file/:filename
 * Serve a file only if the requesting user owns a product that references it.
 * This prevents unauthorized access to private documents.
 */
router.get('/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    // Sanitise — no path traversal
    if (!/^[\w.\-]+$/.test(filename)) return res.status(400).json({ message: 'Invalid filename.' });

    // Ownership check: user must own a product that references this file
    const product = await Product.findOne({
      owner: req.userId,
      $or: [{ receiptPath: filename }, { photoPath: filename }],
    });
    if (!product) return res.status(403).json({ message: 'Access denied.' });

    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found.' });

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Could not serve file.' });
  }
});

export default router;
