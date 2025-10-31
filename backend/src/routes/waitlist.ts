import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    await prisma.waitlist.upsert({
      where: { email },
      update: { phone },
      create: { email, phone },
    });

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to register waitlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
