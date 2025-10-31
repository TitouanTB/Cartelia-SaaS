import { prisma } from '../prisma';
import { createEmailProvider } from './factory';
import { renderTemplate } from './templates';
import { EmailBulkResult, EmailSendResult } from './provider';

export type EmailRecipient = { email: string; name?: string };

export async function resetQuotaIfNeeded(restaurantId: number) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const now = new Date();

  if (now > restaurant.emailQuotaResetAt) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        emailQuotaUsed: 0,
        emailQuotaResetAt: tomorrow,
      },
    });
  }

  return restaurant;
}

export async function sendEmail(options: {
  restaurantId: number;
  to: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
}): Promise<EmailSendResult> {
  const restaurant = await resetQuotaIfNeeded(options.restaurantId);

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  if (restaurant.emailQuotaUsed >= restaurant.emailQuotaLimit) {
    throw Object.assign(new Error('Email quota exceeded'), {
      code: 'EMAIL_QUOTA_EXCEEDED',
      quotaResetAt: restaurant.emailQuotaResetAt,
    });
  }

  let payload = {
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  if (options.template) {
    payload = renderTemplate(options.template as any, options.variables ?? {});
  }

  const provider = createEmailProvider(restaurant);
  const result = await provider.send({
    to: options.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  await prisma.emailLog.create({
    data: {
      restaurantId: options.restaurantId,
      provider: restaurant.emailProvider,
      recipient: options.to[0]?.email ?? 'unknown',
      subject: payload.subject,
      status: result.success ? 'sent' : 'failed',
      error: result.error?.message,
    },
  });

  if (result.success) {
    await prisma.restaurant.update({
      where: { id: options.restaurantId },
      data: { emailQuotaUsed: { increment: 1 } },
    });
  }

  return result;
}

export async function sendBulkEmails(options: {
  restaurantId: number;
  recipients: EmailRecipient[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
}): Promise<EmailBulkResult> {
  const restaurant = await resetQuotaIfNeeded(options.restaurantId);

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const availableQuota = restaurant.emailQuotaLimit - restaurant.emailQuotaUsed;
  if (availableQuota <= 0) {
    throw Object.assign(new Error('Email quota exceeded'), {
      code: 'EMAIL_QUOTA_EXCEEDED',
      quotaResetAt: restaurant.emailQuotaResetAt,
    });
  }

  const recipients = options.recipients.slice(0, availableQuota);

  let payload = {
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  if (options.template) {
    payload = renderTemplate(options.template as any, options.variables ?? {});
  }

  const provider = createEmailProvider(restaurant);

  const result = await provider.sendBulk({
    recipients,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  for (const recipient of recipients) {
    const failed = result.errors.find(e => e.recipient === recipient.email);
    await prisma.emailLog.create({
      data: {
        restaurantId: options.restaurantId,
        provider: restaurant.emailProvider,
        recipient: recipient.email,
        subject: payload.subject,
        status: failed ? 'failed' : 'sent',
        error: failed?.error.message,
      },
    });
  }

  if (result.sent > 0) {
    await prisma.restaurant.update({
      where: { id: options.restaurantId },
      data: { emailQuotaUsed: { increment: result.sent } },
    });
  }

  return result;
}
