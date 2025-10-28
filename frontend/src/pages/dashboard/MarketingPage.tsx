import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Play, Pause, Users, MessageCircle, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export type Campaign = {
  id: number;
  name: string;
  channel: 'email' | 'whatsapp';
  audienceSize: number;
  sends: number;
  ctr: number;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
};

type CampaignFormState = {
  name: string;
  channel: 'email' | 'whatsapp';
  audience: string;
  message: string;
  scheduledAt: string | null;
};

const defaultCampaignState: CampaignFormState = {
  name: '',
  channel: 'whatsapp',
  audience: 'consented',
  message: '',
  scheduledAt: null,
};

export default function MarketingPage() {
  const { selectedRestaurantId } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formState, setFormState] = useState<CampaignFormState>(defaultCampaignState);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ['campaigns', selectedRestaurantId],
    queryFn: () => api.get(`/campaigns?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  const createCampaignMutation = useMutation({
    mutationFn: () =>
      api.post('/campaigns/create', {
        restaurantId: selectedRestaurantId,
        type: formState.channel,
        audience: formState.audience,
        message: formState.message,
        name: formState.name,
        scheduledAt: formState.scheduledAt,
      }),
    onSuccess: () => {
      success('Campagne créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setWizardOpen(false);
      setStep(0);
      setFormState(defaultCampaignState);
    },
    onError: () => error('Erreur lors de la création de la campagne'),
  });

  const sendCampaignMutation = useMutation({
    mutationFn: (campaignId: number) =>
      api.post('/campaigns/send', {
        campaignId,
        restaurantId: selectedRestaurantId,
        segment: 'consented',
        limit: 50,
      }),
    onSuccess: () => {
      success('Campagne envoyée');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: () => error('Erreur lors de l\'envoi de la campagne'),
  });

  const kpis = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status !== 'sent').length;
    const avgOpenRate = campaigns.length
      ? Math.round(
          (campaigns.reduce((acc, c) => acc + c.ctr, 0) / campaigns.length) * 100
        ) / 100
      : 0;

    return {
      total,
      active,
      avgOpenRate,
    };
  }, [campaigns]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <KPI label="Campagnes actives" value={kpis.active} icon={Play} color="var(--color-success)" />
        <KPI label="Campagnes totales" value={kpis.total} icon={Megaphone} color="var(--color-primary)" />
        <KPI label="Taux d'ouverture moyen" value={`${kpis.avgOpenRate}%`} icon={Users} color="var(--color-warning)" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Campagnes marketing</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Pilotez vos campagnes email et WhatsApp</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setPreviewOpen(true)}>
            Modèles
          </Button>
          <Button onClick={() => setWizardOpen(true)}>Nouvelle campagne</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={headerCellStyle}>Nom</th>
                <th style={headerCellStyle}>Canal</th>
                <th style={headerCellStyle}>Audience</th>
                <th style={headerCellStyle}>Envois</th>
                <th style={headerCellStyle}>CTR</th>
                <th style={headerCellStyle}>Statut</th>
                <th style={headerCellStyle}>Créée le</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={rowCellStyle}>{campaign.name}</td>
                  <td style={rowCellStyle}>
                    <span className="badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {campaign.channel === 'email' ? <Mail size={14} /> : <MessageCircle size={14} />}
                      <span style={{ marginLeft: '0.35rem' }}>{campaign.channel}</span>
                    </span>
                  </td>
                  <td style={rowCellStyle}>{campaign.audienceSize}</td>
                  <td style={rowCellStyle}>{campaign.sends}</td>
                  <td style={rowCellStyle}>{campaign.ctr}%</td>
                  <td style={rowCellStyle}>
                    <span
                      className={
                        campaign.status === 'sent'
                          ? 'badge-success'
                          : campaign.status === 'scheduled'
                          ? 'badge-warning'
                          : 'badge-info'
                      }
                      style={{ textTransform: 'capitalize' }}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td style={rowCellStyle}>{new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={rowCellStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => sendCampaignMutation.mutate(campaign.id)}
                      >
                        <Play size={14} />
                        Envoyer
                      </button>
                      <button className="btn-ghost btn-sm">
                        <Pause size={14} />
                        Pause
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Aucune campagne pour le moment. Créez votre première campagne !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CampaignWizard
        open={wizardOpen}
        step={step}
        formState={formState}
        onCancel={() => {
          setWizardOpen(false);
          setStep(0);
          setFormState(defaultCampaignState);
        }}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => s + 1)}
        onChange={setFormState}
        onSubmit={() => createCampaignMutation.mutate()}
        loading={createCampaignMutation.isPending}
      />

      <TemplateModal open={previewOpen} onClose={() => setPreviewOpen(false)} onUseTemplate={(template) => {
        setFormState((prev) => ({ ...prev, ...template }));
        setPreviewOpen(false);
        setWizardOpen(true);
      }} />
    </div>
  );
}

function KPI({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ size: number; color?: string }>; color: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</p>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: `${color}20`,
          display: 'grid',
          placeItems: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</p>
    </div>
  );
}

const headerCellStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.85rem',
  fontWeight: 600,
} satisfies React.CSSProperties;

const rowCellStyle = {
  padding: '1rem',
  fontSize: '0.9rem',
} satisfies React.CSSProperties;

type CampaignWizardProps = {
  open: boolean;
  step: number;
  formState: CampaignFormState;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onChange: (state: CampaignFormState) => void;
  loading: boolean;
};

function CampaignWizard({ open, step, formState, onCancel, onBack, onNext, onSubmit, onChange, loading }: CampaignWizardProps) {
  const steps = ['Audience', 'Message', 'Planification'];

  const canNext = () => {
    if (step === 0) return !!formState.name && !!formState.channel;
    if (step === 1) return !!formState.message;
    return true;
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Créer une campagne"
      description={steps
        .map((label, index) => `${index === step ? '▶️' : '•'} ${label}`)
        .join('  ')}
      width="640px"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          {step > 0 && (
            <Button variant="ghost" onClick={onBack}>
              Retour
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={onNext} disabled={!canNext()}>
              Étape suivante
            </Button>
          ) : (
            <Button loading={loading} onClick={onSubmit} disabled={!canNext()}>
              Lancer la campagne
            </Button>
          )}
        </>
      }
    >
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nom de la campagne</label>
            <input
              value={formState.name}
              onChange={(e) => onChange({ ...formState, name: e.target.value })}
              placeholder="Relance clients samedi"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Canal</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <SelectableCard
                selected={formState.channel === 'whatsapp'}
                onClick={() => onChange({ ...formState, channel: 'whatsapp' })}
                title="WhatsApp"
                description="Messages rapides et personnalisés"
                icon={<MessageCircle size={20} />}
              />
              <SelectableCard
                selected={formState.channel === 'email'}
                onClick={() => onChange({ ...formState, channel: 'email' })}
                title="Email"
                description="Campagnes newsletter"
                icon={<Mail size={20} />}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Audience</label>
            <select
              value={formState.audience}
              onChange={(e) => onChange({ ...formState, audience: e.target.value })}
              style={inputStyle}
            >
              <option value="consented">Clients consentis</option>
              <option value="vip">VIP</option>
              <option value="lapsed">Clients inactifs</option>
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              value={formState.message}
              onChange={(e) => onChange({ ...formState, message: e.target.value })}
              placeholder="Bonjour {{prenom}}, profitez de..."
              rows={6}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Astuce IA : Ajoutez [offre] pour personnaliser automatiquement.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Planification</label>
            <input
              type="datetime-local"
              value={formState.scheduledAt ?? ''}
              onChange={(e) => onChange({ ...formState, scheduledAt: e.target.value })}
              style={inputStyle}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Laissez vide pour envoyer immédiatement.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

type SelectableCardProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function SelectableCard({ selected, onClick, title, description, icon }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        border: selected ? '1px solid rgba(147, 23, 253, 0.6)' : '1px solid var(--color-border)',
        background: selected ? 'rgba(147, 23, 253, 0.12)' : 'var(--color-bg-tertiary)',
        textAlign: 'left',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(147, 23, 253, 0.2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{description}</p>
        </div>
      </div>
    </button>
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

type TemplateModalProps = {
  open: boolean;
  onClose: () => void;
  onUseTemplate: (template: Partial<CampaignFormState>) => void;
};

const templates = [
  {
    name: 'Réactivation clients',
    message: 'Bonjour {{prenom}}, cela fait un moment! Découvrez notre nouvelle carte ce weekend avec -10% 🎉',
    channel: 'whatsapp',
  },
  {
    name: 'Promo brunch',
    message: 'Bonjour {{prenom}}, brunch à volonté dimanche! Réservez votre table ici 👉 {{lien}}',
    channel: 'email',
  },
  {
    name: 'Avis Google',
    message: 'Merci pour votre visite {{prenom}}! Laissez-nous un avis Google et recevez un café offert ☕',
    channel: 'whatsapp',
  },
] as const;

function TemplateModal({ open, onClose, onUseTemplate }: TemplateModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bibliothèque de modèles"
      description="Choisissez un modèle à personnaliser"
      width="640px"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {templates.map((template) => (
          <div key={template.name} className="card" style={{ background: 'var(--color-bg-tertiary)', border: '1px solid rgba(147, 23, 253, 0.2)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{template.name}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{template.message}</p>
            <Button
              variant="secondary"
              onClick={() =>
                onUseTemplate({
                  name: template.name,
                  channel: template.channel,
                  message: template.message,
                } as Partial<CampaignFormState>)
              }
            >
              Utiliser ce modèle
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
