import { Router } from 'express';
import { google } from 'googleapis';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { env } from '../config';
import { createEmailProvider } from '../lib/email/factory';
import { SendGridSubAccountProvider } from '../lib/email/sendgrid';
import { renderTemplate } from '../lib/email/templates';

const router = Router();

// Setup email provider
router.post('/setup', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, option, domain, gmailCode } = req.body;

    if (!restaurantId || !option) {
      return res.status(400).json({ error: 'restaurantId and option are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    let updateData: any = {
      emailProvider: option,
    };

    switch (option) {
      case 'cartelia_subdomain': {
        const sender = `resto_${restaurantId}@${env.SENDGRID_VERIFIED_DOMAIN}`;
        updateData.emailSender = sender;
        updateData.emailVerified = true;
        updateData.emailQuotaLimit = 300;

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: updateData,
        });

        return res.json({
          success: true,
          sender,
          verificationPending: false,
        });
      }

      case 'gmail': {
        if (!gmailCode) {
          return res.status(400).json({ error: 'gmailCode is required for Gmail setup' });
        }

        if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
          return res.status(500).json({ error: 'Google OAuth not configured' });
        }

        const oauth2Client = new google.auth.OAuth2(
          env.GOOGLE_OAUTH_CLIENT_ID,
          env.GOOGLE_OAUTH_CLIENT_SECRET,
          env.GOOGLE_OAUTH_REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(gmailCode);
        oauth2Client.setCredentials(tokens);

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });

        updateData.gmailRefreshToken = tokens.refresh_token;
        updateData.gmailEmail = profile.data.emailAddress;
        updateData.emailSender = profile.data.emailAddress;
        updateData.emailVerified = true;
        updateData.emailQuotaLimit = 500;

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: updateData,
        });

        return res.json({
          success: true,
          sender: profile.data.emailAddress,
          verificationPending: false,
        });
      }

      case 'sendgrid_sub': {
        if (!domain) {
          return res.status(400).json({ error: 'domain is required for custom domain setup' });
        }

        if (!env.SENDGRID_API_KEY) {
          return res.status(500).json({ error: 'SendGrid not configured' });
        }

        const username = `resto_${restaurantId}`;
        const email = `contact@${domain}`;

        const provider = new SendGridSubAccountProvider(restaurant);
        const { apiKey, subuserId, dnsRecords } = await provider.createSubAccount({
          restaurantName: restaurant.name,
          email,
          username,
        });

        updateData.sendgridSubKey = apiKey;
        updateData.sendgridSubId = subuserId;
        updateData.emailSender = email;
        updateData.emailVerified = false;
        updateData.emailQuotaLimit = 10000;

        await prisma.restaurant.update({
          where: { id: restaurantId },
          data: updateData,
        });

        return res.json({
          success: true,
          sender: email,
          verificationPending: true,
          dnsRecords,
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid option' });
    }
  } catch (error) {
    console.error('Failed to setup email provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email provider status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const restaurantId = parseInt(req.query.restaurantId as string);

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({
      provider: restaurant.emailProvider,
      sender: restaurant.emailSender,
      verified: restaurant.emailVerified,
      quotaUsed: restaurant.emailQuotaUsed,
      quotaLimit: restaurant.emailQuotaLimit,
      quotaResetAt: restaurant.emailQuotaResetAt,
    });
  } catch (error) {
    console.error('Failed to fetch email status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify domain for SendGrid custom domain
router.post('/verify-domain', authMiddleware, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'restaurantId is required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.emailProvider !== 'sendgrid_sub') {
      return res.status(400).json({ error: 'Domain verification only applies to SendGrid custom domains' });
    }

    const provider = new SendGridSubAccountProvider(restaurant);
    const { verified, details } = await provider.verify();

    if (verified) {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { emailVerified: true },
      });
    }

    res.json({ verified, details });
  } catch (error) {
    console.error('Failed to verify domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email (internal API used by campaigns, avis, etc.)
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, to, subject, html, text, template, variables } = req.body;

    if (!restaurantId || !to || !subject) {
      return res.status(400).json({ error: 'restaurantId, to, and subject are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check quota
    const now = new Date();
    const resetNeeded = now > restaurant.emailQuotaResetAt;

    if (resetNeeded) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          emailQuotaUsed: 0,
          emailQuotaResetAt: tomorrow,
        },
      });
    } else if (restaurant.emailQuotaUsed >= restaurant.emailQuotaLimit) {
      return res.status(429).json({
        error: 'Email quota exceeded',
        quotaResetAt: restaurant.emailQuotaResetAt,
      });
    }

    // Prepare email content
    let emailContent: { subject: string; html?: string; text?: string } = {
      subject,
      html,
      text,
    };

    if (template) {
      emailContent = renderTemplate(template as any, variables ?? {});
    }

    // Send email
    const provider = createEmailProvider(restaurant);
    const result = await provider.send({
      to: Array.isArray(to) ? to : [to],
      ...emailContent,
    });

    // Log send
    await prisma.emailLog.create({
      data: {
        restaurantId,
        provider: restaurant.emailProvider,
        recipient: Array.isArray(to) ? to[0].email : to.email,
        subject: emailContent.subject,
        status: result.success ? 'sent' : 'failed',
        error: result.error?.message,
      },
    });

    // Increment quota
    if (result.success) {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: { emailQuotaUsed: { increment: 1 } },
      });
    }

    res.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error?.message,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send bulk emails for campaigns
router.post('/send-bulk', authMiddleware, async (req, res) => {
  try {
    const { restaurantId, recipients, subject, html, text } = req.body;

    if (!restaurantId || !recipients || !subject) {
      return res.status(400).json({ error: 'restaurantId, recipients, and subject are required' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check quota
    const now = new Date();
    const resetNeeded = now > restaurant.emailQuotaResetAt;

    if (resetNeeded) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          emailQuotaUsed: 0,
          emailQuotaResetAt: tomorrow,
        },
      });
    }

    const availableQuota = restaurant.emailQuotaLimit - restaurant.emailQuotaUsed;
    const toSend = Math.min(recipients.length, availableQuota);

    if (toSend === 0) {
      return res.status(429).json({
        error: 'Email quota exceeded',
        quotaResetAt: restaurant.emailQuotaResetAt,
      });
    }

    // Send emails
    const provider = createEmailProvider(restaurant);
    const result = await provider.sendBulk({
      recipients: recipients.slice(0, toSend),
      subject,
      html,
      text,
    });

    // Log each send
    for (const recipient of recipients.slice(0, toSend)) {
      const failed = result.errors.find(e => e.recipient === recipient.email);
      await prisma.emailLog.create({
        data: {
          restaurantId,
          provider: restaurant.emailProvider,
          recipient: recipient.email,
          subject,
          status: failed ? 'failed' : 'sent',
          error: failed?.error.message,
        },
      });
    }

    // Increment quota
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { emailQuotaUsed: { increment: result.sent } },
    });

    res.json({
      queued: result.queued,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Failed to send bulk emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Provide Gmail OAuth URL (for frontend popup)
router.get('/oauth/google/url', authMiddleware, (_req, res) => {
  try {
    if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URI
    );

    const scopes = ['https://www.googleapis.com/auth/gmail.send'];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    res.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate Google OAuth URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initiate Gmail OAuth
router.get('/oauth/google', authMiddleware, (_req, res) => {
  res.status(400).json({ error: 'Use /email/oauth/google/url to initiate OAuth' });
});

// Gmail OAuth callback
router.get('/oauth/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error || !code) {
      return res.redirect(`${env.PUBLIC_BASE_URL}/dashboard/settings?error=gmail_auth_failed`);
    }

    // Return the code to the frontend for processing via /setup
    res.redirect(`${env.PUBLIC_BASE_URL}/dashboard/settings?gmailCode=${code}`);
  } catch (error) {
    console.error('Failed to handle Google OAuth callback:', error);
    res.redirect(`${env.PUBLIC_BASE_URL}/dashboard/settings?error=gmail_auth_failed`);
  }
});

export default router;
