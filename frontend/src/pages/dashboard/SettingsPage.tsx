import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Smartphone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui/Button';

type WhatsAppStatus = {
  connected: boolean;
  phoneNumber?: string;
};

type EmailStatus = {
  provider: string;
  sender?: string | null;
  verified: boolean;
  quotaUsed: number;
  quotaLimit: number;
  quotaResetAt: string;
};

type DnsRecord = {
  type: string;
  host: string;
  data: string;
  ttl?: number;
};

type EmailSetupResponse = {
  success: boolean;
  sender: string;
  verificationPending: boolean;
  dnsRecords?: DnsRecord[];
};

export default function SettingsPage() {
  const { selectedRestaurantId, selectedRestaurant } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [brandingForm, setBrandingForm] = useState({
    name: selectedRestaurant?.name ?? '',
    primaryColor: selectedRestaurant?.primaryColor ?? '#9317FD',
  });
  const [emailProvider, setEmailProvider] = useState<string>('cartelia_subdomain');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[] | null>(null);

  const { data: whatsappStatus } = useQuery<WhatsAppStatus>({
    queryKey: ['whatsapp-status', selectedRestaurantId],
    queryFn: () => api.get(`/campaigns/integrations/whatsapp/status?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  const { data: whatsappQR } = useQuery<{ qrCodeUrl: string }>({
    queryKey: ['whatsapp-qr', selectedRestaurantId],
    queryFn: () => api.get(`/campaigns/integrations/whatsapp/qr?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId && !whatsappStatus?.connected,
  });

  const { data: emailStatus, refetch: refetchEmailStatus } = useQuery<EmailStatus>({
    queryKey: ['email-status', selectedRestaurantId],
    queryFn: () => api.get(`/email/status?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  useEffect(() => {
    if (emailStatus) {
      setEmailProvider(emailStatus.provider);
      if (emailStatus.provider === 'sendgrid_sub' && emailStatus.sender) {
        const [, domain] = emailStatus.sender.split('@');
        if (domain) {
          setCustomDomain(domain);
        }
      }
    }
  }, [emailStatus]);

  const updateBrandingMutation = useMutation({
    mutationFn: () => api.post(`/restaurant/update`, { id: selectedRestaurantId, ...brandingForm }),
    onSuccess: () => {
      success('Paramètres enregistrés');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: () => error('Erreur lors de l\'enregistrement'),
  });

  const setupEmailMutation = useMutation({
    mutationFn: (payload: { option: string; domain?: string; gmailCode?: string }) =>
      api.post<EmailSetupResponse>('/email/setup', { restaurantId: selectedRestaurantId, ...payload }),
    onSuccess: (data) => {
      success('Configuration email enregistrée');
      setDnsRecords(data.dnsRecords || null);
      refetchEmailStatus();
    },
    onError: () => error('Erreur lors de la configuration email'),
  });

  const verifyDomainMutation = useMutation({
    mutationFn: () => api.post('/email/verify-domain', { restaurantId: selectedRestaurantId }),
    onSuccess: (data: any) => {
      if (data.verified) {
        success('Domaine vérifié avec succès');
        refetchEmailStatus();
      } else {
        error('Domaine non vérifié. Vérifiez les enregistrements DNS.');
      }
    },
    onError: () => error('Erreur lors de la vérification'),
  });

  const handleSaveEmailConfig = async () => {
    if (emailProvider === 'sendgrid_sub' && !customDomain) {
      error('Veuillez saisir un domaine personnalisé');
      return;
    }

    if (emailProvider === 'gmail') {
      const { url } = await api.get<{ url: string }>('/email/oauth/google/url');
      window.open(url, 'Gmail OAuth', 'width=600,height=600');
      return;
    }

    setupEmailMutation.mutate({
      option: emailProvider,
      domain: customDomain || undefined,
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmailCode = params.get('gmailCode');

    if (gmailCode) {
      setupEmailMutation.mutate({
        option: 'gmail',
        gmailCode,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '720px' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={20} />
          Configuration Email
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>
              Choisissez votre méthode d'envoi d'emails
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label
                style={{
                  padding: '1rem',
                  border: `2px solid ${emailProvider === 'cartelia_subdomain' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: emailProvider === 'cartelia_subdomain' ? 'rgba(147, 23, 253, 0.05)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  value="cartelia_subdomain"
                  checked={emailProvider === 'cartelia_subdomain'}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>Cartelia (recommandé)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                  resto@noreply.cartelia.app – Prêt en 1 clic • 300 emails/jour
                </p>
              </label>

              <label
                style={{
                  padding: '1rem',
                  border: `2px solid ${emailProvider === 'gmail' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: emailProvider === 'gmail' ? 'rgba(147, 23, 253, 0.05)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  value="gmail"
                  checked={emailProvider === 'gmail'}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>Mon Gmail</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                  monresto@gmail.com – Rapide mais risque spam • 500 emails/jour
                </p>
              </label>

              <label
                style={{
                  padding: '1rem',
                  border: `2px solid ${emailProvider === 'sendgrid_sub' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: emailProvider === 'sendgrid_sub' ? 'rgba(147, 23, 253, 0.05)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  value="sendgrid_sub"
                  checked={emailProvider === 'sendgrid_sub'}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                <strong>Mon domaine (professionnel)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                  contact@monresto.fr – Meilleure délivrabilité • Illimité
                </p>
              </label>
            </div>
          </div>

          {emailProvider === 'sendgrid_sub' && (
            <div>
              <label style={labelStyle}>Votre domaine</label>
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="monresto.fr"
                style={inputStyle}
              />
            </div>
          )}

          {dnsRecords && dnsRecords.length > 0 && (
            <div className="card" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                Ajoutez ces enregistrements DNS chez votre registrar :
              </p>
              {dnsRecords.map((record, i) => (
                <div key={i} style={{ marginBottom: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  <strong>{record.type}</strong> {record.host} = {record.data}
                </div>
              ))}
              <Button
                onClick={() => verifyDomainMutation.mutate()}
                loading={verifyDomainMutation.isPending}
                style={{ marginTop: '1rem' }}
              >
                Vérifier
              </Button>
            </div>
          )}

          <Button loading={setupEmailMutation.isPending} onClick={handleSaveEmailConfig}>
            <Save size={16} />
            {emailProvider === 'gmail' ? 'Connecter Gmail' : 'Enregistrer'}
          </Button>

          {emailStatus && (
            <div className="card" style={{ background: 'var(--color-bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {emailStatus.verified ? (
                  <CheckCircle size={18} color="var(--color-success)" />
                ) : (
                  <AlertCircle size={18} color="var(--color-warning)" />
                )}
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {emailStatus.verified ? 'Vérifié' : 'En attente de vérification'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                Expéditeur : <strong>{emailStatus.sender}</strong>
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                Quota : {emailStatus.quotaUsed} / {emailStatus.quotaLimit} emails aujourd'hui
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Intégrations</h3>

        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={18} color="var(--color-success)" />
            WhatsApp Business
          </h4>
          {whatsappStatus?.connected ? (
            <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ fontSize: '0.9rem' }}>✓ Connecté au {whatsappStatus.phoneNumber}</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Scannez ce QR avec WhatsApp pour connecter votre compte
              </p>
              {whatsappQR?.qrCodeUrl ? (
                <img
                  src={whatsappQR.qrCodeUrl}
                  alt="WhatsApp QR"
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              ) : (
                <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: 'var(--radius)' }} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Branding</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nom du restaurant</label>
            <input
              value={brandingForm.name}
              onChange={(e) => setBrandingForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Le Petit Bistrot"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Couleur principale</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="color"
                value={brandingForm.primaryColor}
                onChange={(e) => setBrandingForm((prev) => ({ ...prev, primaryColor: e.target.value }))}
                style={{
                  width: '80px',
                  height: '50px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              />
              <input
                value={brandingForm.primaryColor}
                onChange={(e) => setBrandingForm((prev) => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#9317FD"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>
          <Button loading={updateBrandingMutation.isPending} onClick={() => updateBrandingMutation.mutate()}>
            <Save size={16} />
            Enregistrer
          </Button>
        </div>
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
