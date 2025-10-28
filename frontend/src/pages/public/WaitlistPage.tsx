import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/Toast';

export default function WaitlistPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [form, setForm] = useState({ email: '', phone: '' });

  const waitlistMutation = useMutation({
    mutationFn: () => api.post('/waitlist', form),
    onSuccess: () => {
      success('Merci ! Vous êtes sur la liste d\'attente.');
      setForm({ email: '', phone: '' });
      navigate('/login');
    },
    onError: () => error('Une erreur est survenue. Réessayez.'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    waitlistMutation.mutate();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(147, 23, 253, 0.15), transparent 60%)', padding: '3rem 1.5rem' }}>
      <header style={{ maxWidth: '1080px', margin: '0 auto', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="gradient-primary" style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
            C
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Cartelia</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Copilote marketing pour restaurants</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Connexion
          </Button>
          <Button onClick={() => navigate('/signup')}>Demander un accès</Button>
        </div>
      </header>

      <main style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700 }}>
            Le copilote qui réactive vos clients et remplit votre restaurant
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
            <li>✓ Collecte automatique d'avis Google & WhatsApp</li>
            <li>✓ Campagnes segmentées en 3 clics</li>
            <li>✓ QR codes intelligents pour menus & inscriptions</li>
            <li>✓ Analyses ROI en temps réel</li>
          </ul>
          <div className="card" style={{ background: 'var(--color-bg-tertiary)' }}>
            <p style={{ marginBottom: '1rem', fontWeight: 600 }}>Rejoignez la beta (30 restaurants sélectionnés)</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email professionnel"
                style={inputStyle}
              />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Téléphone"
                style={inputStyle}
              />
              <Button type="submit" loading={waitlistMutation.isPending} fullWidth>
                Rejoindre la liste d'attente
              </Button>
            </form>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              En vous inscrivant, vous acceptez de recevoir des communications liées au lancement de Cartelia.
            </p>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid rgba(147, 23, 253, 0.2)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Comment ça marche ?</h3>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <li><strong>1.</strong> Connectez WhatsApp et Google en 5 minutes.</li>
            <li><strong>2.</strong> Cartelia collecte les avis et contacts automatiquement.</li>
            <li><strong>3.</strong> Lancez des campagnes ciblées avec notre Copilot IA.</li>
            <li><strong>4.</strong> Suivez le ROI et les réservations en direct.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.95rem',
} satisfies React.CSSProperties;
