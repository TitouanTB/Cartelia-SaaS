import Brevo from 'sib-api-v3-sdk';
import { env } from '../config';

const apiInstance = new Brevo.TransactionalEmailsApi();

if (env.BREVO_API_KEY) {
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
}

export interface SendEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  text: string;
  html?: string;
}

export async function sendTransactionalEmail(options: SendEmailOptions) {
  if (!env.BREVO_API_KEY) {
    console.info('Brevo API key not configured. Skipping email send.');
    return { skipped: true };
  }

  const email: Brevo.SendSmtpEmail = {
    sender: { email: 'no-reply@cartelia.app', name: 'Cartelia' },
    to: options.to,
    subject: options.subject,
    textContent: options.text,
    htmlContent: options.html ?? `<p>${options.text}</p>`,
  };

  return apiInstance.sendTransacEmail(email);
}
