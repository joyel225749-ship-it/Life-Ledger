/**
 * Dashboard aggregation endpoint.
 * Returns summary statistics for the authenticated user's products.
 */
import { Router } from 'express';
import Product   from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId   = new mongoose.Types.ObjectId(req.userId);
    const now      = new Date();
    const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in45days = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

    const [stats] = await Product.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalProducts:       { $sum: 1 },
          totalPurchaseCost:   { $sum: '$purchasePrice' },
          totalRepairCost:     { $sum: '$repairCostTotal' },
          activeWarranties: {
            $sum: { $cond: [{ $and: [{ $ifNull: ['$warrantyEndDate', false] }, { $gte: ['$warrantyEndDate', now] }] }, 1, 0] }
          },
          expiringWarranties30: {
            $sum: {
              $cond: [{
                $and: [
                  { $ifNull: ['$warrantyEndDate', false] },
                  { $gte: ['$warrantyEndDate', now] },
                  { $lte: ['$warrantyEndDate', in30days] }
                ]
              }, 1, 0]
            }
          },
          expiringWarranties45: {
            $sum: {
              $cond: [{
                $and: [
                  { $ifNull: ['$warrantyEndDate', false] },
                  { $gte: ['$warrantyEndDate', now] },
                  { $lte: ['$warrantyEndDate', in45days] }
                ]
              }, 1, 0]
            }
          },
          expiredWarranties: {
            $sum: {
              $cond: [{ $and: [{ $ifNull: ['$warrantyEndDate', false] }, { $lt: ['$warrantyEndDate', now] }] }, 1, 0]
            }
          },
          returnsExpiringSoon: {
            $sum: {
              $cond: [{
                $and: [
                  { $ifNull: ['$returnDeadline', false] },
                  { $gte: ['$returnDeadline', now] },
                  { $lte: ['$returnDeadline', in30days] }
                ]
              }, 1, 0]
            }
          },
        }
      }
    ]);

    // Recent 5 products
    const recentProducts = await Product.find({ owner: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name brand category purchasePrice purchaseDate warrantyEndDate returnDeadline repairCostTotal');

    // Upcoming deadlines (warranty or return, within 45 days)
    const upcomingDeadlines = await Product.find({
      owner: userId,
      $or: [
        { warrantyEndDate: { $gte: now, $lte: in45days } },
        { returnDeadline:  { $gte: now, $lte: in45days } },
      ]
    })
      .sort({ warrantyEndDate: 1 })
      .limit(10)
      .select('name brand warrantyEndDate returnDeadline purchasePrice');

    res.json({
      stats: stats || {
        totalProducts: 0, totalPurchaseCost: 0, totalRepairCost: 0,
        activeWarranties: 0, expiringWarranties30: 0, expiringWarranties45: 0,
        expiredWarranties: 0, returnsExpiringSoon: 0,
      },
      recentProducts,
      upcomingDeadlines,
    });
  } catch (err) { next(err); }
});

export default router;
