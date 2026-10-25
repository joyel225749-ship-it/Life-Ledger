import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes      from './routes/auth.js';
import productRoutes   from './routes/products.js';
import uploadRoutes    from './routes/uploads.js';
import repairRoutes    from './routes/repairs.js';
import dashboardRoutes from './routes/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Public health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'LifeLedger API' }));

// API routes
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/uploads',   uploadRoutes);
app.use('/api/repairs',   repairRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong.' });
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection failed:', err.message));
} else {
  console.warn('⚠️  MONGODB_URI is missing. Add it to server/.env');
}

app.listen(port, () => console.log(`🚀 LifeLedger API listening on http://localhost:${port}`));
