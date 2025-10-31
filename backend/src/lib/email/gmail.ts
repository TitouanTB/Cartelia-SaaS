import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { google } from 'googleapis';
import { env } from '../../config';
import {
  EmailProvider,
  SendEmailPayload,
  SendBulkPayload,
  EmailSendResult,
  EmailBulkResult,
  ProviderQuota,
} from './provider';

type Restaurant = {
  id: number;
  gmailRefreshToken?: string | null;
  gmailEmail?: string | null;
  emailQuotaUsed: number;
  emailQuotaLimit: number;
  emailQuotaResetAt: Date;
  emailSenderName?: string | null;
};

export class GmailProvider extends EmailProvider {
  readonly name = 'gmail';
  private restaurant: Restaurant;

  constructor(restaurant: Restaurant) {
    super();
    this.restaurant = restaurant;
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.restaurant.gmailRefreshToken) {
      return null;
    }

    if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_OAUTH_CLIENT_ID,
      env.GOOGLE_OAUTH_CLIENT_SECRET,
      env.GOOGLE_OAUTH_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: this.restaurant.gmailRefreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials.access_token || null;
    } catch (error) {
      console.error('Failed to refresh Gmail access token:', error);
      return null;
    }
  }

  private async getTransporter() {
    const accessToken = await this.getAccessToken();

    if (!accessToken || !this.restaurant.gmailEmail) {
      throw new Error('Gmail not properly configured');
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: this.restaurant.gmailEmail,
        clientId: env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        refreshToken: this.restaurant.gmailRefreshToken || '',
        accessToken,
      },
    } as any);
  }

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: {
          name: this.restaurant.emailSenderName || 'Restaurant',
          address: this.restaurant.gmailEmail!,
        },
        to: payload.to.map(r => ({
          name: r.name || '',
          address: r.email,
        })),
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || payload.text || '',
        replyTo: payload.replyTo ? {
          name: payload.replyTo.name || '',
          address: payload.replyTo.email,
        } : undefined,
      };

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Gmail send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async sendBulk(payload: SendBulkPayload): Promise<EmailBulkResult> {
    const result: EmailBulkResult = {
      queued: payload.recipients.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    try {
      const transporter = await this.getTransporter();

      for (const recipient of payload.recipients) {
        try {
          const mailOptions = {
            from: {
              name: this.restaurant.emailSenderName || 'Restaurant',
              address: this.restaurant.gmailEmail!,
            },
            to: {
              name: recipient.name || '',
              address: recipient.email,
            },
            subject: payload.subject,
            text: payload.text || '',
            html: payload.html || payload.text || '',
          };

          await transporter.sendMail(mailOptions);
          result.sent++;

          // Gmail API has rate limits: add delay between sends
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          result.failed++;
          result.errors.push({
            recipient: recipient.email,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    } catch (error) {
      console.error('Gmail bulk send failed:', error);
      result.failed = payload.recipients.length;
      payload.recipients.forEach(recipient => {
        result.errors.push({
          recipient: recipient.email,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
    }

    return result;
  }

  async verify(): Promise<{ verified: boolean; details?: unknown }> {
    try {
      const accessToken = await this.getAccessToken();
      return {
        verified: !!accessToken && !!this.restaurant.gmailEmail,
        details: { email: this.restaurant.gmailEmail },
      };
    } catch (error) {
      return {
        verified: false,
        details: { error: String(error) },
      };
    }
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      limit: this.restaurant.emailQuotaLimit,
      used: this.restaurant.emailQuotaUsed,
      resetsAt: this.restaurant.emailQuotaResetAt,
    };
  }
}
