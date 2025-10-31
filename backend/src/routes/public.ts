import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { trackScan } from '../lib/analytics';

const router = Router();

router.get('/menu/:id', async (req, res) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { restaurant: true },
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    await trackScan(menu.restaurantId, 'menu');

    res.json({
      restaurant: {
        name: menu.restaurant.name,
        logo: menu.restaurant.logo,
      },
      items: menu.items,
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/review/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    await trackScan(restaurantId, 'review');

    res.json({
      restaurant: {
        name: restaurant.name,
        logo: restaurant.logo,
      },
      googleReviewLink: `https://search.google.com/local/writereview?placeid=${restaurantId}`,
      whatsappLink: `https://wa.me/33123456789?text=Bonjour%20${encodeURIComponent(restaurant.name)}`,
    });
  } catch (error) {
    console.error('Failed to fetch review page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/register/:id', async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.id);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    await trackScan(restaurantId, 'register');

    res.json({
      restaurant: {
        name: restaurant.name,
        logo: restaurant.logo,
      },
      fields: [
        { name: 'name', label: 'Nom', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'phone', label: 'Téléphone', type: 'tel', required: false },
        {
          name: 'whatsappConsent',
          label: "J'accepte de recevoir des messages WhatsApp",
          type: 'checkbox',
          required: false,
        },
      ],
    });
  } catch (error) {
    console.error('Failed to fetch register page:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/public/register', async (req, res) => {
  try {
    const { restaurantId, name, email, phone, whatsappConsent } = req.body;

    if (!restaurantId || !name) {
      return res.status(400).json({ error: 'restaurantId and name are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    await prisma.client.create({
      data: {
        restaurantId,
        name,
        email,
        phone,
        whatsappConsent: whatsappConsent || false,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to register client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
