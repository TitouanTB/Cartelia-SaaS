import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.email) {
      return res.status(404).json({ error: 'User email missing from token' });
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      restaurants: [
        {
          id: user.restaurant.id,
          name: user.restaurant.name,
          logo: user.restaurant.logo,
        },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
