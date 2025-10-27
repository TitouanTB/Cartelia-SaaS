declare module 'sib-api-v3-sdk' {
  export class TransactionalEmailsApi {
    setApiKey(key: any, value: string): void;
    sendTransacEmail(email: SendSmtpEmail): Promise<any>;
  }

  export interface SendSmtpEmail {
    sender: { email: string; name?: string };
    to: { email: string; name?: string }[];
    subject: string;
    textContent?: string;
    htmlContent?: string;
  }

  export const TransactionalEmailsApiApiKeys: {
    apiKey: any;
  };
}
