type TemplateName =
  | 'welcome'
  | 'review-request'
  | 'campaign-default'
  | 'reservation-confirmation';

type TemplateRenderer = (variables: Record<string, any>) => { subject: string; html: string; text: string };

const templates: Record<TemplateName, TemplateRenderer> = {
  welcome: ({ restaurant }) => ({
    subject: `${restaurant?.name ?? 'Bienvenue'} sur Cartelia`,
    text: `Bienvenue ${restaurant?.name ?? ''} ! Nous sommes ravis de vous compter parmi les restaurateurs Cartelia.`,
    html: `<p>Bienvenue <strong>${restaurant?.name ?? ''}</strong> !</p><p>Nous sommes ravis de vous compter parmi les restaurateurs Cartelia.</p>`,
  }),
  'review-request': ({ client, restaurant, reviewLink }) => ({
    subject: `${restaurant?.name ?? 'Votre restaurant'} - Votre avis compte !`,
    text: `Bonjour ${client?.name ?? ''}, nous serions ravis d'avoir votre avis sur ${restaurant?.name ?? 'notre établissement'}. ${reviewLink ?? ''}`,
    html: `
      <p>Bonjour ${client?.name ?? ''},</p>
      <p>Nous serions ravis d'avoir votre avis sur <strong>${restaurant?.name ?? 'notre établissement'}</strong>.</p>
      <p><a href="${reviewLink ?? '#'}">Laisser un avis</a></p>
      <p>Merci de votre visite !</p>
    `,
  }),
  'campaign-default': ({ restaurant, message }) => ({
    subject: `${restaurant?.name ?? 'Votre restaurant'} a un message pour vous`,
    text: message ?? '',
    html: `<p>${message ?? ''}</p>`,
  }),
  'reservation-confirmation': ({ restaurant, reservation }) => ({
    subject: `${restaurant?.name ?? 'Votre restaurant'} - Confirmation de réservation`,
    text: `Bonjour ${reservation?.name ?? ''}, votre réservation du ${reservation?.date ?? ''} pour ${reservation?.guests ?? ''} personnes est confirmée.`,
    html: `
      <p>Bonjour ${reservation?.name ?? ''},</p>
      <p>Votre réservation du <strong>${reservation?.date ?? ''}</strong> pour <strong>${reservation?.guests ?? ''}</strong> personnes est confirmée.</p>
      <p>À très vite !</p>
    `,
  }),
};

export function renderTemplate(name: TemplateName, variables: Record<string, any>) {
  const template = templates[name];
  if (!template) {
    throw new Error(`Template ${name} not found`);
  }
  return template(variables);
}
