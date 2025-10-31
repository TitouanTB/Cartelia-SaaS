import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const [scans, signups, reviews, campaignsSent] = await Promise.all([
      prisma.scan.count({ where: { restaurantId } }),
      prisma.client.count({ where: { restaurantId } }),
      prisma.avis.count({ where: { restaurantId } }),
      prisma.campaignSend.count({
        where: {
          campaign: { restaurantId },
        },
      }),
    ]);

    const recentScans = await prisma.scan.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });

    const scansByDay: Record<string, number> = {};
    recentScans.forEach(scan => {
      const date = scan.createdAt.toISOString().split('T')[0];
      scansByDay[date] = (scansByDay[date] || 0) + 1;
    });

    res.json({
      scans,
      signups,
      reviews,
      campaignsSent,
      recentActivity: Object.entries(scansByDay).map(([date, count]) => ({
        date,
        count,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
