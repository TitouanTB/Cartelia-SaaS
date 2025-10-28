import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Smartphone } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import { Button } from '../../components/ui/Button';

type WhatsAppStatus = {
  connected: boolean;
  phoneNumber?: string;
};

export default function SettingsPage() {
  const { selectedRestaurantId, selectedRestaurant } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [brandingForm, setBrandingForm] = useState({
    name: selectedRestaurant?.name ?? '',
    primaryColor: selectedRestaurant?.primaryColor ?? '#9317FD',
  });

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

  const updateBrandingMutation = useMutation({
    mutationFn: () => api.post(`/restaurant/update`, { id: selectedRestaurantId, ...brandingForm }),
    onSuccess: () => {
      success('Paramètres enregistrés');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: () => error('Erreur lors de l\'enregistrement'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '720px' }}>
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
