import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../lib/email/service';
import { sendWhatsAppMessage, isWhatsAppPaired } from '../lib/whatsapp';
import { env } from '../config';

cron.schedule('0 10 * * *', async () => {
  console.log('[EmailFollowupJob] Running daily follow-up job');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const beforeYesterday = new Date(yesterday);
  beforeYesterday.setDate(beforeYesterday.getDate() - 1);

  const clients = await prisma.client.findMany({
    where: {
      createdAt: {
        gte: beforeYesterday,
        lt: yesterday,
      },
    },
    include: {
      restaurant: true,
    },
  });

  for (const client of clients) {
    try {
      if (!client.restaurant) {
        continue;
      }

      const hasReview = await prisma.avis.findFirst({
        where: {
          restaurantId: client.restaurantId,
          createdAt: {
            gte: beforeYesterday,
            lt: yesterday,
          },
        },
      });

      if (hasReview) {
        continue;
      }

      if (client.email) {
        await sendEmail({
          restaurantId: client.restaurantId,
          to: [{ email: client.email, name: client.name }],
          subject: `${client.restaurant.name} - Votre avis compte !`,
          template: 'review-request',
          variables: {
            client,
            restaurant: client.restaurant,
            reviewLink: `${env.PUBLIC_BASE_URL}/review/${client.restaurantId}`,
          },
        });
      }

      if (client.whatsappConsent && client.phone && (await isWhatsAppPaired(client.restaurantId))) {
        const message = `Bonjour ${client.name}, nous serions ravis d'avoir votre avis sur ${client.restaurant.name}. ${env.PUBLIC_BASE_URL}/review/${client.restaurantId}`;
        await sendWhatsAppMessage(client.restaurantId, client.phone, message);
      }
    } catch (error) {
      console.error('[EmailFollowupJob] Failed to process client follow-up', error);
    }
  }
});
