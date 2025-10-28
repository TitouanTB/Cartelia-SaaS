import { Mail, MessageCircle, LifeBuoy } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Centre d'aide Cartelia</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Retrouvez ici toutes les ressources pour réussir votre lancement.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <HelpCard
          icon={<LifeBuoy size={20} color="var(--color-primary)" />}
          title="Documentation"
          description="Tutoriels pas à pas pour configurer Cartelia"
          actionLabel="Ouvrir la doc"
        />
        <HelpCard
          icon={<MessageCircle size={20} color="var(--color-success)" />}
          title="Support WhatsApp"
          description="Chattez avec notre équipe en moins de 5 minutes"
          actionLabel="Contacter"
        />
        <HelpCard
          icon={<Mail size={20} color="var(--color-info)" />}
          title="Email"
          description="Envoyez-nous vos questions à support@cartelia.fr"
          actionLabel="Envoyer un email"
        />
      </div>

      <div className="card" style={{ marginTop: '2rem', background: 'var(--color-bg-tertiary)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Feedback beta</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Votre avis est précieux ! Partagez vos idées pour améliorer Cartelia.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert('Merci pour votre feedback !');
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <textarea
            placeholder="Racontez-nous votre expérience..."
            rows={4}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
            }}
          />
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end' }}>
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

type HelpCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
};

function HelpCard({ icon, title, description, actionLabel }: HelpCardProps) {
  return (
    <div className="card" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid rgba(147, 23, 253, 0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {icon}
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{description}</p>
      <button className="btn-secondary" style={{ width: '100%' }}>
        {actionLabel}
      </button>
    </div>
  );
}
