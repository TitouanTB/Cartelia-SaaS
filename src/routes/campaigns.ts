import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { sendTransactionalEmail } from '../lib/brevo';
import {
  sendWhatsAppMessage,
  randomDelay,
  isWhatsAppPaired,
  getWhatsAppQR,
} from '../lib/whatsapp';
import { generateQRDataURL } from '../lib/qr';

const router = Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, type, message, templateName } = req.body;

    if (!restaurantId || !type || !message) {
      return res.status(400).json({ error: 'restaurantId, type, and message are required' });
    }

    if (!['email', 'whatsapp'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be email or whatsapp' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        restaurantId,
        type,
        message,
        status: 'draft',
      },
    });

    res.json({ id: campaign.id });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        sends: true,
      },
    });

    res.json({
      campaigns: campaigns.map(c => ({
        id: c.id,
        type: c.type,
        message: c.message.substring(0, 100) + '...',
        status: c.status,
        createdAt: c.createdAt,
        sendCount: c.sends.length,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { campaignId, restaurantId, segment, limit } = req.body;

    if (!campaignId || !restaurantId) {
      return res.status(400).json({ error: 'campaignId and restaurantId are required' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const whereClause: any = {
      restaurantId,
      whatsappConsent: true,
    };

    if (campaign.type === 'whatsapp') {
      whereClause.phone = { not: null };
    } else if (campaign.type === 'email') {
      whereClause.email = { not: null };
    }

    if (segment === 'consented') {
      whereClause.whatsappConsent = true;
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      take: Math.min(limit || 50, 50),
    });

    let scheduled = 0;

    for (const client of clients) {
      if (scheduled >= 50) {
        break;
      }

      try {
        if (campaign.type === 'email' && client.email) {
          await sendTransactionalEmail({
            to: [{ email: client.email, name: client.name }],
            subject: 'Message de votre restaurant',
            text: campaign.message,
          });

          await prisma.campaignSend.create({
            data: {
              campaignId,
              clientId: client.id,
              channel: 'email',
              status: 'sent',
            },
          });

          scheduled++;
        } else if (campaign.type === 'whatsapp' && client.phone) {
          if (await isWhatsAppPaired(restaurantId)) {
            await sendWhatsAppMessage(restaurantId, client.phone, campaign.message);

            await prisma.campaignSend.create({
              data: {
                campaignId,
                clientId: client.id,
                channel: 'whatsapp',
                status: 'sent',
              },
            });

            scheduled++;
            await randomDelay();
          }
        }
      } catch (error: any) {
        await prisma.campaignSend.create({
          data: {
            campaignId,
            clientId: client.id,
            channel: campaign.type,
            status: 'failed',
            error: error.message,
          },
        });
      }
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'sent' },
    });

    res.json({ scheduled });
  } catch (error) {
    console.error('Failed to send campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/integrations/whatsapp/status', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    const paired = await isWhatsAppPaired(restaurantId);

    res.json({ paired });
  } catch (error) {
    console.error('Failed to check WhatsApp status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/integrations/whatsapp/qr', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId query param is required' });
    }

    let qrData = '';

    await getWhatsAppQR(restaurantId, async qr => {
      qrData = await generateQRDataURL(qr);
    });

    setTimeout(() => {
      if (qrData) {
        res.json({ qr: qrData });
      } else {
        res.json({ qr: null, message: 'Already paired or QR not generated yet' });
      }
    }, 2000);
  } catch (error) {
    console.error('Failed to get WhatsApp QR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
