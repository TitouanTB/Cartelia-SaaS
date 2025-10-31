export type SendEmailPayload = {
  to: { email: string; name?: string }[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: { email: string; name?: string };
};

export type SendBulkRecipient = {
  email: string;
  name?: string;
  variables?: Record<string, unknown>;
};

export type SendBulkPayload = {
  recipients: SendBulkRecipient[];
  subject: string;
  html?: string;
  text?: string;
};

export type ProviderQuota = {
  limit: number;
  used: number;
  resetsAt: Date;
};

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export interface EmailBulkResult {
  queued: number;
  sent: number;
  failed: number;
  errors: { recipient: string; error: Error }[];
}

export abstract class EmailProvider {
  abstract readonly name: string;

  async send(_payload: SendEmailPayload): Promise<EmailSendResult> {
    throw new Error('Not implemented');
  }

  async sendBulk(_payload: SendBulkPayload): Promise<EmailBulkResult> {
    throw new Error('Not implemented');
  }

  async verify(): Promise<{ verified: boolean; details?: unknown }> {
    throw new Error('Not implemented');
  }

  async getQuota(): Promise<ProviderQuota> {
    throw new Error('Not implemented');
  }
}
