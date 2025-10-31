import { env } from '../config';

export async function queryMistral(prompt: string): Promise<string> {
  if (!env.HUGGINGFACE_MISTRAL_ENDPOINT) {
    return fallbackResponse(prompt);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(env.HUGGINGFACE_MISTRAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.HUGGINGFACE_API_TOKEN && {
          Authorization: `Bearer ${env.HUGGINGFACE_API_TOKEN}`,
        }),
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('Mistral API failed, using fallback');
      return fallbackResponse(prompt);
    }

    const data: any = await response.json();
    return data[0]?.generated_text || fallbackResponse(prompt);
  } catch (error) {
    clearTimeout(timeout);
    console.warn('Mistral API timeout or error, using fallback:', error);
    return fallbackResponse(prompt);
  }
}

function fallbackResponse(command: string): string {
  const lower = command.toLowerCase();

  if (lower.includes('qr') && lower.includes('menu')) {
    return 'Pour créer un QR code menu, utilisez le tableau de bord et cliquez sur "QR Codes" puis "Créer QR Menu".';
  }

  if (lower.includes('email') || lower.includes('e-mail')) {
    return 'Pour envoyer un email, allez dans "Campagnes" puis créez une nouvelle campagne email et cliquez sur "Envoyer".';
  }

  if (lower.includes('whatsapp') || lower.includes('wa')) {
    return 'Pour envoyer une campagne WhatsApp, créez d\'abord une campagne de type WhatsApp, puis cliquez sur "Envoyer". Assurez-vous que vos clients ont donné leur consentement.';
  }

  if (lower.includes('avis') || lower.includes('review')) {
    return 'Pour voir vos statistiques d\'avis, allez dans la section "Avis" du tableau de bord.';
  }

  if (lower.includes('plat') || lower.includes('menu')) {
    return 'Pour ajouter un plat au menu, allez dans "Menus" et cliquez sur "Ajouter un plat".';
  }

  return 'Je peux vous aider avec: créer des QR codes, envoyer des emails/WhatsApp, voir les stats d\'avis, gérer le menu. Que souhaitez-vous faire?';
}
