import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Share, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/Toast';

type QRCodeItem = {
  id: number;
  name: string;
  type: 'menu' | 'register' | 'review';
  targetId: number;
  scans: number;
  conversions: number;
  createdAt: string;
};

const types = [
  { id: 'menu', label: 'Menu digital' },
  { id: 'register', label: 'Collecte contacts' },
  { id: 'review', label: 'Collecte avis' },
] as const;

export default function QRPage() {
  const { selectedRestaurantId } = useAuth();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formState, setFormState] = useState({ type: 'menu', label: '', targetId: '' });

  const { data: qrCodes = [] } = useQuery<QRCodeItem[]>({
    queryKey: ['qr', selectedRestaurantId],
    queryFn: () => api.get('/qr'),
    enabled: !!selectedRestaurantId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/qr/create', {
        restaurantId: selectedRestaurantId,
        type: formState.type,
        targetId: Number.parseInt(formState.targetId, 10),
        label: formState.label,
      }),
    onSuccess: () => {
      success('QR créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['qr'] });
      setCreateModalOpen(false);
      setFormState({ type: 'menu', label: '', targetId: '' });
    },
    onError: () => error('Erreur lors de la création du QR'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>QR & NFC</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Suivez les scans et conversions</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} />
          Nouveau QR
        </Button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={headerCellStyle}>Nom</th>
                <th style={headerCellStyle}>Type</th>
                <th style={headerCellStyle}>Scans</th>
                <th style={headerCellStyle}>Conversions</th>
                <th style={headerCellStyle}>Créé le</th>
                <th style={headerCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.map((qr) => (
                <tr key={qr.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={rowCellStyle}>{qr.name}</td>
                  <td style={rowCellStyle}>
                    <span className="badge-neutral" style={{ textTransform: 'capitalize' }}>{qr.type}</span>
                  </td>
                  <td style={rowCellStyle}>{qr.scans}</td>
                  <td style={rowCellStyle}>{qr.conversions}</td>
                  <td style={rowCellStyle}>{new Date(qr.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={rowCellStyle}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost btn-sm">
                        <Download size={14} />
                        Télécharger
                      </button>
                      <button className="btn-ghost btn-sm">
                        <Share size={14} />
                        Partager
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {qrCodes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Aucun QR code créé pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Créer un QR"
        description="Générez un QR relié à vos expériences Cartelia"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
              Créer le QR
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nom</label>
            <input
              value={formState.label}
              onChange={(e) => setFormState((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="QR tables terrasse"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select
              value={formState.type}
              onChange={(e) => setFormState((prev) => ({ ...prev, type: e.target.value }))}
              style={inputStyle}
            >
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ID cible</label>
            <input
              value={formState.targetId}
              onChange={(e) => setFormState((prev) => ({ ...prev, targetId: e.target.value }))}
              placeholder="1"
              style={inputStyle}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              ID de menu, campagne ou landing selon le type
            </p>
          </div>
        </div>
      </Modal>
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
