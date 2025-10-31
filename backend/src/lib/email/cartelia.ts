import sgMail from '@sendgrid/mail';
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
  emailQuotaUsed: number;
  emailQuotaLimit: number;
  emailQuotaResetAt: Date;
  emailSenderName?: string | null;
};

export class CarteliaProvider extends EmailProvider {
  readonly name = 'cartelia_subdomain';
  private restaurant: Restaurant;

  constructor(restaurant: Restaurant) {
    super();
    this.restaurant = restaurant;

    if (env.SENDGRID_API_KEY) {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
    }
  }

  private getFromAddress(): string {
    return `resto_${this.restaurant.id}@${env.SENDGRID_VERIFIED_DOMAIN || 'noreply.cartelia.app'}`;
  }

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    if (!env.SENDGRID_API_KEY) {
      return {
        success: false,
        error: new Error('SendGrid API key not configured'),
      };
    }

    try {
      const msg = {
        to: payload.to.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
        })),
        from: {
          email: this.getFromAddress(),
          name: this.restaurant.emailSenderName || 'Cartelia',
        },
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || payload.text || '',
        replyTo: payload.replyTo,
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'],
      };
    } catch (error) {
      console.error('Cartelia email send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async sendBulk(payload: SendBulkPayload): Promise<EmailBulkResult> {
    if (!env.SENDGRID_API_KEY) {
      return {
        queued: 0,
        sent: 0,
        failed: payload.recipients.length,
        errors: payload.recipients.map(r => ({
          recipient: r.email,
          error: new Error('SendGrid API key not configured'),
        })),
      };
    }

    const result: EmailBulkResult = {
      queued: payload.recipients.length,
      sent: 0,
      failed: 0,
      errors: [],
    };

    try {
      const messages = payload.recipients.map(recipient => ({
        to: { email: recipient.email, name: recipient.name },
        from: {
          email: this.getFromAddress(),
          name: this.restaurant.emailSenderName || 'Cartelia',
        },
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || payload.text || '',
      }));

      await sgMail.send(messages);

      result.sent = messages.length;
    } catch (error) {
      console.error('Cartelia bulk email failed:', error);
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
    return {
      verified: true,
      details: { subdomain: env.SENDGRID_VERIFIED_DOMAIN || 'noreply.cartelia.app' },
    };
  }

  async getQuota(): Promise<ProviderQuota> {
    return {
      limit: this.restaurant.emailQuotaLimit,
      used: this.restaurant.emailQuotaUsed,
      resetsAt: this.restaurant.emailQuotaResetAt,
    };
  }
}
