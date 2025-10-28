import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, status } = useAuth();
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      showError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      success('Compte créé avec succès. Vérifiez votre email.');
      navigate('/');
    } catch (err) {
      showError((err as Error).message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'authenticated') {
    navigate('/');
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(147, 23, 253, 0.12), transparent 70%)',
        padding: '2rem',
      }}
    >
      <div className="card fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="gradient-primary"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '0 auto 1.5rem',
            }}
          >
            C
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Créer un compte Cartelia</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Accédez aux outils marketing pour votre restaurant</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Email professionnel
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@restaurant.com"
              style={{
                width: '100%',
                padding: '0.875rem 1.125rem',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.875rem 1.125rem',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Confirmez le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.875rem 1.125rem',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <Button type="submit" loading={loading} fullWidth size="lg">
            Créer un compte
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Déjà inscrit ?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
