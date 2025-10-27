import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { restaurantId, feature, comment } = req.body;

    if (!feature) {
      return res.status(400).json({ error: 'feature is required' });
    }

    await prisma.feedback.create({
      data: {
        restaurantId: restaurantId || null,
        feature,
        comment,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to create feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
