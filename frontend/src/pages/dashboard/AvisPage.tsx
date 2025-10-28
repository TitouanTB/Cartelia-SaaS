import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, MessageCircle, Send, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

type Review = {
  id: number;
  rating: number;
  comment: string;
  clientName: string;
  source: string;
  createdAt: string;
  replied: boolean;
};

export default function AvisPage() {
  const { selectedRestaurantId } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews', selectedRestaurantId],
    queryFn: () => api.get(`/avis?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  const replyMutation = useMutation({
    mutationFn: (data: { reviewId: number; reply: string }) => api.post('/avis/reply', data),
    onSuccess: () => {
      success('Réponse envoyée avec succès');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setReplyModalOpen(false);
      setReplyText('');
    },
    onError: () => error('Erreur lors de l\'envoi de la réponse'),
  });

  const requestMutation = useMutation({
    mutationFn: (data: { restaurantId: number; via: string }) =>
      api.post('/avis/request', { ...data, clientIds: [] }),
    onSuccess: () => {
      success('Demandes d\'avis envoyées');
      setRequestModalOpen(false);
    },
    onError: () => error('Erreur lors de l\'envoi des demandes'),
  });

  if (isLoading) {
    return <div className="card skeleton" style={{ height: '400px' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Tous les avis</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{reviews.length} avis collectés</p>
        </div>
        <Button onClick={() => setRequestModalOpen(true)}>
          <Plus size={18} />
          Demander des avis
        </Button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Client</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Note</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Commentaire</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{review.clientName}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? 'var(--color-warning)' : 'none'} color="var(--color-warning)" />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>{review.comment}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge-neutral">{review.source}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {!review.replied && (
                      <button
                        className="btn-ghost btn-sm"
                        onClick={() => {
                          setSelectedReview(review);
                          setReplyModalOpen(true);
                        }}
                      >
                        <MessageCircle size={14} />
                        Répondre
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Aucun avis pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title="Répondre à l'avis"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReplyModalOpen(false)}>
              Annuler
            </Button>
            <Button
              loading={replyMutation.isPending}
              onClick={() => {
                if (selectedReview && replyText) {
                  replyMutation.mutate({ reviewId: selectedReview.id, reply: replyText });
                }
              }}
            >
              <Send size={16} />
              Envoyer la réponse
            </Button>
          </>
        }
      >
        {selectedReview && (
          <div>
            <div className="card" style={{ marginBottom: '1rem', background: 'var(--color-bg-tertiary)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{selectedReview.clientName}</p>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < selectedReview.rating ? 'var(--color-warning)' : 'none'} color="var(--color-warning)" />
                ))}
              </div>
              <p style={{ fontSize: '0.9rem' }}>{selectedReview.comment}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                resize: 'vertical',
              }}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Demander des avis"
        description="Envoyez des demandes d'avis à vos clients"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRequestModalOpen(false)}>
              Annuler
            </Button>
            <Button
              loading={requestMutation.isPending}
              onClick={() => {
                if (selectedRestaurantId) {
                  requestMutation.mutate({ restaurantId: selectedRestaurantId, via: 'email' });
                }
              }}
            >
              Envoyer les demandes
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Les demandes seront envoyées par email à tous vos clients ayant donné leur consentement.
        </p>
      </Modal>
    </div>
  );
}
