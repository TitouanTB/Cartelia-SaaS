import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/Toast';

type RegisterLanding = {
  restaurantName: string;
  restaurantLogo?: string;
  description: string;
};

export default function RegisterPublicPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', whatsappConsent: false });
  const [submitted, setSubmitted] = useState(false);

  const { data: landing } = useQuery<RegisterLanding>({
    queryKey: ['public-register', id],
    queryFn: () => api.get(`/register/${id}`),
    enabled: !!id,
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      api.post('/public/register', {
        restaurantId: Number.parseInt(id!, 10),
        ...form,
      }),
    onSuccess: () => {
      success('Inscription réussie ! Merci 🎉');
      setSubmitted(true);
    },
    onError: () => error('Une erreur est survenue. Réessayez.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div className="gradient-primary" style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', fontSize: '3rem' }}>
            ✓
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Merci !</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Votre inscription a bien été enregistrée. À bientôt au {landing?.restaurantName} !</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', background: 'radial-gradient(circle at top, rgba(147, 23, 253, 0.15), transparent 70%)' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {landing?.restaurantLogo && (
          <img
            src={landing.restaurantLogo}
            alt={landing.restaurantName}
            style={{ width: '100px', height: '100px', borderRadius: 'var(--radius)', objectFit: 'cover', margin: '0 auto 1.5rem', display: 'block' }}
          />
        )}
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>{landing?.restaurantName}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '2rem', textAlign: 'center' }}>{landing?.description ?? 'Inscrivez-vous pour recevoir nos offres'}</p>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jean Dupont"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jean@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
                style={inputStyle}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.whatsappConsent}
                onChange={(e) => setForm((f) => ({ ...f, whatsappConsent: e.target.checked }))}
                style={{ marginTop: '0.25rem' }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>
                J'accepte de recevoir des offres promotionnelles et des demandes d'avis par email et WhatsApp de la part de {landing?.restaurantName ?? 'ce restaurant'}.
              </span>
            </label>
            <Button type="submit" loading={registerMutation.isPending} fullWidth size="lg">
              M'inscrire
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
  fontWeight: 500,
} satisfies React.CSSProperties;

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.95rem',
} satisfies React.CSSProperties;
