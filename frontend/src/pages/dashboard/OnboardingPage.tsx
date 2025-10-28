import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, Circle, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../../components/ui/Button';

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: string;
};

export default function OnboardingPage() {
  const { selectedRestaurantId } = useAuth();
  const { success, error } = useToast();
  const [notes, setNotes] = useState('');

  const { data: steps = [], isLoading } = useQuery<OnboardingStep[]>({
    queryKey: ['onboarding', selectedRestaurantId],
    queryFn: () => api.get('/onboarding'),
    enabled: !!selectedRestaurantId,
  });

  const feedbackMutation = useMutation({
    mutationFn: () =>
      api.post('/feedback', {
        restaurantId: selectedRestaurantId,
        message: notes,
      }),
    onSuccess: () => {
      success('Merci pour votre retour !');
      setNotes('');
    },
    onError: () => error('Impossible d\'envoyer votre retour pour le moment'),
  });

  const currentIndex = steps.findIndex((step) => !step.completed);
  const currentStep = currentIndex === -1 ? steps.at(-1) ?? null : steps[currentIndex];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '2rem' }}>
      <div className="card" style={{ background: 'var(--color-bg-tertiary)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          Parcours d'onboarding
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Suivez les étapes pour configurer Cartelia et lancer votre premier cycle client.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading && <div className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius)' }} />}
          {!isLoading &&
            steps.map((step, index) => (
              <div
                key={step.id}
                className="card"
                style={{
                  background: step.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg)',
                  border: step.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--color-border)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {step.completed ? <CheckCircle size={22} color="var(--color-success)" /> : <Circle size={22} color="var(--color-text-muted)" />}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{index + 1}. {step.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{step.description}</p>
                </div>
                {index === currentIndex && <ChevronRight size={18} color="var(--color-primary)" />}
              </div>
            ))}
        </div>
      </div>

      <div className="card" style={{ background: 'var(--color-bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Étape en cours</p>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{currentStep?.title ?? 'Onboarding complété 🎉'}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text)' }}>{currentStep?.description ?? 'Toutes les étapes sont terminées. Bravo !'}</p>
          {currentStep?.action && (
            <div className="card" style={{ background: 'rgba(147, 23, 253, 0.12)', border: '1px solid rgba(147, 23, 253, 0.3)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Action recommandée</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{currentStep.action}</p>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Partagez vos besoins</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Quels éléments souhaitez-vous prioriser ?"
            rows={5}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setNotes('')}>
            Effacer
          </Button>
          <Button loading={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate()}>
            Envoyer mon feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
