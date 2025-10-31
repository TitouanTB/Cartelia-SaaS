import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { queryMistral } from '../lib/mistral';

const router = Router();

const commandMatchers = [
  {
    action: 'create-qr-menu',
    pattern: /cr[eé]er?.*qr.*menu/,
    params: (body: any) => ({ restaurantId: body.restaurantId }),
  },
  {
    action: 'send-email-campaign',
    pattern: /envoyer?.*e-?mail.*inscrits/,
    params: (body: any) => ({ restaurantId: body.restaurantId }),
  },
  {
    action: 'send-whatsapp-campaign',
    pattern: /envoyer?.*whatsapp.*campagne/,
    params: (body: any) => ({ restaurantId: body.restaurantId }),
  },
  {
    action: 'view-review-stats',
    pattern: /voir?.*stats?.*avis/,
    params: (body: any) => ({ restaurantId: body.restaurantId }),
  },
  {
    action: 'add-menu-item',
    pattern: /ajouter?.*plat/,
    params: (body: any) => ({ restaurantId: body.restaurantId }),
  },
];

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { command, restaurantId } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'command is required' });
    }

    for (const matcher of commandMatchers) {
      if (matcher.pattern.test(command.toLowerCase())) {
        return res.json({
          action: matcher.action,
          params: matcher.params(req.body),
        });
      }
    }

    const reply = await queryMistral(command + (restaurantId ? ` (restaurant: ${restaurantId})` : ''));
    res.json({ text: reply });
  } catch (error) {
    console.error('Failed to process copilot command:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
