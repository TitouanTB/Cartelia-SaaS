import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

async function reservationsEnabled(restaurantId: number): Promise<boolean> {
  const toggle = await prisma.featureToggle.findFirst({
    where: {
      restaurantId,
      key: 'reservations',
      enabled: true,
    },
  });

  return Boolean(toggle);
}

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, name, date, guests } = req.body;

    if (!restaurantId || !name || !date || !guests) {
      return res.status(400).json({ error: 'restaurantId, name, date and guests are required' });
    }

    if (!(await reservationsEnabled(restaurantId))) {
      return res.status(403).json({ error: 'Reservations feature is disabled for this restaurant' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        restaurantId,
        name,
        date: new Date(date),
        guests,
        status: 'pending',
      },
    });

    res.json({ id: reservation.id });
  } catch (error) {
    console.error('Failed to create reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    if (!(await reservationsEnabled(restaurantId))) {
      return res.status(403).json({ error: 'Reservations feature is disabled for this restaurant' });
    }

    const reservations = await prisma.reservation.findMany({
      where: { restaurantId },
      orderBy: { date: 'asc' },
    });

    res.json({ reservations });
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notify', authMiddleware, async (req, res) => {
  try {
    const { reservationId, channel } = req.body;

    if (!reservationId || !channel) {
      return res.status(400).json({ error: 'reservationId and channel are required' });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { restaurant: true },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (!(await reservationsEnabled(reservation.restaurantId))) {
      return res.status(403).json({ error: 'Reservations feature is disabled for this restaurant' });
    }

    // Placeholder for notification logic (email/WhatsApp)
    res.json({ ok: true, message: `Notification queued via ${channel}` });
  } catch (error) {
    console.error('Failed to notify reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
