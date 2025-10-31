import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { generateQRCode } from '../lib/qr';
import { env } from '../config';
import { getScansByType, getScansCount } from '../lib/analytics';

const router = Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, type, targetId } = req.body;

    if (!restaurantId || !type) {
      return res.status(400).json({ error: 'restaurantId and type are required' });
    }

    if (!['menu', 'review', 'register'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be menu, review, or register' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const landingUrl = `${env.PUBLIC_BASE_URL}/${type}/${targetId || restaurantId}`;

    const qrCode = await prisma.qrCode.create({
      data: {
        restaurantId,
        type,
        targetId,
        url: landingUrl,
      },
    });

    res.json({
      qrUrl: `${env.PUBLIC_BASE_URL}/qr/${qrCode.id}`,
      landingUrl,
    });
  } catch (error) {
    console.error('Failed to create QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats/scans', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const total = await getScansCount(restaurantId);
    const byTypeData = await getScansByType(restaurantId);

    res.json({
      total,
      byType: byTypeData.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.type]: curr.count,
        }),
        { menu: 0, review: 0, register: 0 }
      ),
    });
  } catch (error) {
    console.error('Failed to fetch scan stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrBuffer = await generateQRCode(qrCode.url);

    res.setHeader('Content-Type', 'image/png');
    res.send(qrBuffer);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
