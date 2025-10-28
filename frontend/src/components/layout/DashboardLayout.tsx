import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import CopilotPanel from '../modules/CopilotPanel';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../Toast';

const breadcrumbs: Record<string, string> = {
  '/': 'Tableau de bord',
  '/avis': 'Avis',
  '/marketing': 'Marketing',
  '/analytics': 'Analytics',
  '/qr': 'QR & NFC',
  '/settings': 'Paramètres',
  '/help': 'Aide',
};

export default function DashboardLayout() {
  const { selectedRestaurant } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { info } = useToast();

  const title = breadcrumbs[location.pathname] ?? 'Cartelia';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: collapsed ? '88px 1fr' : '280px 1fr', height: '100%' }}>
      <Sidebar collapsed={collapsed} />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'radial-gradient(circle at top left, rgba(147, 23, 253, 0.08), transparent 60%)' }}>
        <Header
          onMenuToggle={() => {
            setCollapsed((prev) => !prev);
          }}
        />

        <main
          className="scrollbar-thin"
          style={{
            flex: 1,
            padding: '2rem',
            overflowY: 'auto',
            background: 'linear-gradient(180deg, rgba(17, 19, 26, 0.9) 0%, rgba(17, 19, 26, 0.98) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                {selectedRestaurant ? `Bienvenue, ${selectedRestaurant.name}` : 'Bienvenue sur Cartelia'}
              </p>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>{title}</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn-secondary"
                onClick={() => navigate('/onboarding')}
                style={{
                  padding: '0.75rem 1.35rem',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid rgba(147, 23, 253, 0.2)',
                }}
              >
                <Sparkles size={18} color="var(--color-primary)" />
                Parcours onboarding
              </button>
              <button
                className="btn-primary"
                onClick={() => info('Utilisez le bouton + pour créer une campagne, un QR code ou ajouter un menu.')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} />
                Nouvelle action
              </button>
              <button
                className="btn-secondary"
                onClick={() => setCopilotOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <MessageCircle size={18} />
                Copilot
              </button>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      <CopilotPanel open={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
