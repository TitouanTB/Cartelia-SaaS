import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/Toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, status } = useAuth();
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Connexion réussie');
      navigate('/');
    } catch (err) {
      showError((err as Error).message || 'Erreur de connexion');
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
      <div className="card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Bienvenue sur Cartelia</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
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

          <Button type="submit" loading={loading} fullWidth size="lg">
            Se connecter
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Pas encore de compte ?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
