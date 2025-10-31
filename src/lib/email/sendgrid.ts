import { Client } from '@sendgrid/client';
import { MailService, type MailDataRequired } from '@sendgrid/mail';
import { env } from '../../config';
import {
  EmailProvider,
  SendEmailPayload,
  EmailSendResult,
  SendBulkPayload,
  EmailBulkResult,
  ProviderQuota,
} from './provider';

type Restaurant = {
  id: number;
  emailSender?: string | null;
  emailSenderName?: string | null;
  sendgridSubKey?: string | null;
  sendgridSubId?: string | null;
  emailQuotaUsed: number;
  emailQuotaLimit: number;
  emailQuotaResetAt: Date;
};

export type SendGridDomainRecord = {
  type: 'TXT' | 'CNAME' | string;
  host: string;
  data: string;
  ttl: number;
};

export class SendGridSubAccountProvider extends EmailProvider {
  readonly name = 'sendgrid_sub';
  private restaurant: Restaurant;
  private managementClient: Client;

  constructor(restaurant: Restaurant) {
    super();
    this.restaurant = restaurant;
    this.managementClient = new Client();

    if (env.SENDGRID_API_KEY) {
      this.managementClient.setApiKey(env.SENDGRID_API_KEY);
    }
  }

  private getApiKey() {
    if (!this.restaurant.sendgridSubKey) {
      throw new Error('SendGrid sub-account key missing');
    }
    return this.restaurant.sendgridSubKey;
  }

  async send(payload: SendEmailPayload): Promise<EmailSendResult> {
    try {
      const mailService = new MailService();
      mailService.setApiKey(this.getApiKey());

      const msg: MailDataRequired = {
        from: {
          email: this.restaurant.emailSender || `contact+${this.restaurant.id}@${env.SENDGRID_VERIFIED_DOMAIN}`,
          name: this.restaurant.emailSenderName || 'Restaurant',
        },
        to: payload.to.map(recipient => ({ email: recipient.email, name: recipient.name })),
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || payload.text || '',
        replyTo: payload.replyTo,
      };

      const response = await mailService.send(msg);

      return {
        success: true,
        messageId: response[0]?.headers?.['x-message-id'],
      };
    } catch (error) {
      console.error('SendGrid sub-account send failed:', error);
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
      const mailService = new MailService();
      mailService.setApiKey(this.getApiKey());

      const messages: MailDataRequired[] = payload.recipients.map(recipient => ({
        from: {
          email: this.restaurant.emailSender || `contact+${this.restaurant.id}@${env.SENDGRID_VERIFIED_DOMAIN}`,
          name: this.restaurant.emailSenderName || 'Restaurant',
        },
        to: [{ email: recipient.email, name: recipient.name }],
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || payload.text || '',
      }));

      await mailService.send(messages, true);
      result.sent = messages.length;
    } catch (error) {
      console.error('SendGrid sub-account bulk send failed:', error);
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
    if (!env.SENDGRID_API_KEY) {
      return { verified: false, details: { error: 'SendGrid API key missing' } };
    }

    if (!this.restaurant.emailSender) {
      return { verified: false, details: { error: 'Sender email not configured' } };
    }

    const domain = this.restaurant.emailSender.split('@')[1];

    try {
      const [response] = await this.managementClient.request({
        method: 'GET',
        url: `/v3/whitelabel/domains?domain=${encodeURIComponent(domain)}`,
      });

      if (response.statusCode === 200 && Array.isArray(response.body)) {
        const match = response.body.find((item: any) => item.domain === domain);
        if (match) {
          return { verified: match.valid, details: match }; 
        }
      }

      return { verified: false, details: { domain, message: 'No verified domain found' } };
    } catch (error) {
      return {
        verified: false,
        details: { error: error instanceof Error ? error.message : String(error) },
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

  async createSubAccount(payload: {
    restaurantName: string;
    email: string;
    username: string;
  }): Promise<{ apiKey: string; subuserId: string; dnsRecords: SendGridDomainRecord[] }> {
    if (!env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    const [createSubuserResponse] = await this.managementClient.request({
      method: 'POST',
      url: '/v3/subusers',
      body: {
        username: payload.username,
        email: payload.email,
        password: `${payload.username}${Date.now()}!`,
        ips: [],
      },
    });

    if (createSubuserResponse.statusCode >= 400) {
      throw new Error('Failed to create SendGrid subuser');
    }

    const body = createSubuserResponse.body as any;
    const subuserId = String(body?.id ?? body?.subuser_id ?? payload.username);

    const [apiKeyResponse] = await this.managementClient.request({
      method: 'POST',
      url: '/v3/api_keys',
      body: {
        name: `cartelia-sub-${payload.username}`,
        sample: false,
        subuser: payload.username,
        scopes: ['mail.send'],
      },
    });

    if (apiKeyResponse.statusCode >= 400) {
      throw new Error('Failed to create SendGrid API key');
    }

    const apiKeyBody = apiKeyResponse.body as any;
    const apiKey = String(apiKeyBody?.api_key ?? '');

    if (!apiKey) {
      throw new Error('SendGrid API key not returned');
    }

    let dnsRecords: SendGridDomainRecord[] = [];

    const domain = payload.email.split('@')[1];

    if (domain) {
      try {
        const [whitelabelResponse] = await this.managementClient.request({
          method: 'POST',
          url: '/v3/whitelabel/domains',
          body: {
            domain,
            subdomain: 'mail',
            default: false,
          },
        });

        if (whitelabelResponse.statusCode < 400) {
          const whitelabelBody = whitelabelResponse.body as any;
          const dnsArray = whitelabelBody?.dns;
          if (Array.isArray(dnsArray)) {
            dnsRecords = dnsArray.map((record: any) => ({
              type: record.type || 'TXT',
              host: record.host || '',
              data: record.data || '',
              ttl: record.ttl || 3600,
            }));
          }
        }
      } catch (error) {
        console.warn('Failed to create SendGrid domain whitelabel:', error);
      }
    }

    return {
      apiKey,
      subuserId,
      dnsRecords,
    };
  }
}
