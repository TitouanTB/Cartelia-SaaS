import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/brevo';
import { sendWhatsAppMessage, randomDelay, isWhatsAppPaired } from '../lib/whatsapp';
import { fetchGoogleReviews } from '../lib/gmb';
import { env } from '../config';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const reviews = await prisma.avis.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
      })),
      average: Math.round(avg * 10) / 10,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, via, clientIds } = req.body;

    if (!restaurantId || !via) {
      return res.status(400).json({ error: 'restaurantId and via are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const whereClause: any = { restaurantId };
    if (clientIds && clientIds.length > 0) {
      whereClause.id = { in: clientIds };
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
    });

    let queued = 0;

    for (const client of clients) {
      if (!client.whatsappConsent) {
        continue;
      }

      if (via === 'email' && client.email) {
        await sendTransactionalEmail({
          to: [{ email: client.email, name: client.name }],
          subject: `${restaurant.name} - Donnez-nous votre avis`,
          text: `Bonjour ${client.name},\n\nNous serions ravis d'avoir votre avis sur notre établissement.\n\nMerci!\n${restaurant.name}`,
        });
        queued++;
      } else if (via === 'whatsapp' && client.phone) {
        if (await isWhatsAppPaired(restaurantId)) {
          const message = `Bonjour ${client.name}, nous serions ravis d'avoir votre avis sur notre établissement. ${env.PUBLIC_BASE_URL}/review/${restaurantId}`;
          await sendWhatsAppMessage(restaurantId, client.phone, message);
          await randomDelay();
          queued++;
        }
      }
    }

    res.json({ queued });
  } catch (error) {
    console.error('Failed to request reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const reviews = await prisma.avis.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
    });

    const count = reviews.length;
    const average = count
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    const trend: { date: string; avgRating: number }[] = [];
    const groupedByMonth: Record<string, number[]> = {};

    reviews.forEach(r => {
      const month = r.createdAt.toISOString().slice(0, 7);
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = [];
      }
      groupedByMonth[month].push(r.rating);
    });

    Object.entries(groupedByMonth).forEach(([date, ratings]) => {
      trend.push({
        date,
        avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      });
    });

    res.json({
      count,
      average: Math.round(average * 10) / 10,
      trend,
    });
  } catch (error) {
    console.error('Failed to fetch review stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/import-google', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || !restaurant.googlePlaceId) {
      return res.status(404).json({ error: 'Restaurant or Google Place ID not found' });
    }

    const googleReviews = await fetchGoogleReviews(restaurant.googlePlaceId);

    let imported = 0;
    for (const review of googleReviews) {
      await prisma.avis.create({
        data: {
          restaurantId,
          rating: review.rating,
          text: review.comment || `Avis importé de Google par ${review.reviewer}`,
        },
      });
      imported++;
    }

    res.json({ imported });
  } catch (error) {
    console.error('Failed to import Google reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
