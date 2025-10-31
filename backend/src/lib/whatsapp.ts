import { Client, LocalAuth } from 'whatsapp-web.js';
import { uploadFile, downloadFile } from './storage';

const clients = new Map<number, Client>();
const qrCallbacks = new Map<number, (qr: string) => void>();

export function getWhatsAppClient(restaurantId: number): Client {
  if (!clients.has(restaurantId)) {
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `restaurant-${restaurantId}`,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    client.on('qr', (qr: string) => {
      console.log(`QR code for restaurant ${restaurantId}`);
      const callback = qrCallbacks.get(restaurantId);
      if (callback) {
        callback(qr);
      }
    });

    client.on('ready', async () => {
      console.log(`WhatsApp client ready for restaurant ${restaurantId}`);
      try {
        const sessionPath = `whatsapp-sessions/${restaurantId}.json`;
        const sessionData = await client.getState();
        await uploadFile(
          'whatsapp-sessions',
          sessionPath,
          Buffer.from(JSON.stringify({ state: sessionData })),
          'application/json'
        );
      } catch (error) {
        console.error(`Failed to persist session for restaurant ${restaurantId}:`, error);
      }
    });

    client.on('disconnected', () => {
      console.log(`WhatsApp client disconnected for restaurant ${restaurantId}`);
      clients.delete(restaurantId);
    });

    clients.set(restaurantId, client);
  }

  return clients.get(restaurantId)!;
}

export async function initializeWhatsAppClient(restaurantId: number): Promise<void> {
  const client = getWhatsAppClient(restaurantId);

  try {
    const sessionPath = `whatsapp-sessions/${restaurantId}.json`;
    const sessionData = await downloadFile('whatsapp-sessions', sessionPath);

    if (sessionData) {
      console.log(`Restoring session for restaurant ${restaurantId}`);
    }
  } catch (error) {
    console.log(`No existing session found for restaurant ${restaurantId}`);
  }

  if (!client.info) {
    await client.initialize();
  }
}

export async function getWhatsAppQR(
  restaurantId: number,
  callback: (qr: string) => void
): Promise<void> {
  qrCallbacks.set(restaurantId, callback);
  await initializeWhatsAppClient(restaurantId);
}

export async function isWhatsAppPaired(restaurantId: number): Promise<boolean> {
  const client = clients.get(restaurantId);
  if (!client) {
    return false;
  }

  try {
    const state = await client.getState();
    return state === 'CONNECTED';
  } catch {
    return false;
  }
}

export async function sendWhatsAppMessage(
  restaurantId: number,
  phoneNumber: string,
  message: string
): Promise<void> {
  const client = getWhatsAppClient(restaurantId);

  const isPaired = await isWhatsAppPaired(restaurantId);
  if (!isPaired) {
    throw new Error('WhatsApp client not paired. Please scan the QR code first.');
  }

  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const chatId = `${formattedPhone}@c.us`;

  await client.sendMessage(chatId, message);
}

export function randomDelay(): Promise<void> {
  const delay = Math.random() * 10000 + 5000;
  return new Promise(resolve => setTimeout(resolve, delay));
}
