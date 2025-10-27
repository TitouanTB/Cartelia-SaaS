declare module 'whatsapp-web.js' {
  import { EventEmitter } from 'events';

  export interface ClientOptions {
    authStrategy?: any;
    puppeteer?: {
      headless?: boolean;
      args?: string[];
    };
  }

  export class Client extends EventEmitter {
    constructor(options?: ClientOptions);
    initialize(): Promise<void>;
    getState(): Promise<string>;
    sendMessage(chatId: string, content: string): Promise<void>;
    info?: any;
  }

  export class LocalAuth {
    constructor(options?: { clientId: string });
  }
}
