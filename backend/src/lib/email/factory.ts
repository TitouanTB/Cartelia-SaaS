import { CarteliaProvider } from './cartelia';
import { GmailProvider } from './gmail';
import { SendGridSubAccountProvider } from './sendgrid';
import { EmailProvider } from './provider';

type Restaurant = {
  id: number;
  emailProvider: string;
  emailSender?: string | null;
  emailSenderName?: string | null;
  sendgridSubKey?: string | null;
  sendgridSubId?: string | null;
  gmailRefreshToken?: string | null;
  gmailEmail?: string | null;
  emailQuotaUsed: number;
  emailQuotaLimit: number;
  emailQuotaResetAt: Date;
};

export function createEmailProvider(restaurant: Restaurant): EmailProvider {
  switch (restaurant.emailProvider) {
    case 'gmail':
      return new GmailProvider(restaurant);

    case 'sendgrid_sub':
      return new SendGridSubAccountProvider(restaurant);

    case 'cartelia_subdomain':
    default:
      return new CarteliaProvider(restaurant);
  }
}
