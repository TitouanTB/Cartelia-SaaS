import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, (_req, res) => {
  res.json({
    version: 'v1',
    steps: [
      {
        id: 'setup-profile',
        title: 'Complétez le profil de votre restaurant',
        description: 'Ajoutez votre logo, vos horaires et vos informations clés.',
      },
      {
        id: 'create-menu',
        title: 'Créez votre premier menu digital',
        description: 'Ajoutez vos plats et catégories pour générer un QR code.',
      },
      {
        id: 'invite-team',
        title: 'Invitez votre équipe',
        description: 'Ajoutez les responsables marketing ou managers pour suivre les avis.',
      },
      {
        id: 'connect-whatsapp',
        title: 'Connectez WhatsApp',
        description: 'Scannez le QR code pour activer l’envoi automatique de messages.',
      },
    ],
  });
});

export default router;
