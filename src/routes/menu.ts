import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { uploadFile } from '../lib/storage';
import { generateMenuPDF } from '../lib/pdf';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    if (!restaurantId || !items) {
      return res.status(400).json({ error: 'restaurantId and items are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    const menu = await prisma.menu.create({
      data: {
        restaurantId,
        items: parsedItems,
      },
    });

    res.json({ id: menu.id });
  } catch (error) {
    console.error('Failed to create menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'items are required' });
    }

    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

    const menu = await prisma.menu.update({
      where: { id: parseInt(req.params.id) },
      data: { items: parsedItems },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to update menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { restaurant: true },
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json({
      id: menu.id,
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

router.post('/:id/upload-image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const timestamp = Date.now();
    const filename = `menu-${menu.id}-${timestamp}.${req.file.mimetype.split('/')[1]}`;

    const publicUrl = await uploadFile(
      'menu-images',
      filename,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ publicUrl });
  } catch (error) {
    console.error('Failed to upload image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { restaurant: true },
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const pdfBuffer = generateMenuPDF(menu);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="menu-${menu.restaurant.name}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
