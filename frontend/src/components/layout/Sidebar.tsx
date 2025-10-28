import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Megaphone, LineChart, QrCode, Settings, HelpCircle } from 'lucide-react';
import classNames from 'classnames';

const navItems = [
  { label: 'Tableau de bord', to: '/', icon: LayoutDashboard },
  { label: 'Avis', to: '/avis', icon: MessageSquare },
  { label: 'Marketing', to: '/marketing', icon: Megaphone },
  { label: 'Analytics', to: '/analytics', icon: LineChart },
  { label: 'QR & NFC', to: '/qr', icon: QrCode },
  { label: 'Paramètres', to: '/settings', icon: Settings },
  { label: 'Aide', to: '/help', icon: HelpCircle },
];

type SidebarProps = {
  collapsed?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ collapsed, onClose }: SidebarProps) {
  return (
    <aside
      className="scrollbar-thin"
      style={{
        width: collapsed ? '88px' : '280px',
        transition: 'width 0.3s ease',
        background: 'rgba(17, 19, 26, 0.9)',
        borderRight: '1px solid var(--color-border)',
        padding: '1.5rem 1rem',
        position: 'relative',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
        <div
          className="gradient-primary"
          style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'grid', placeItems: 'center', fontWeight: 700 }}
        >
          C
        </div>
        {!collapsed && (
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cartelia</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Le copilote des restaurateurs</p>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                classNames('fade-in', {
                  active: isActive,
                })
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                color: isActive ? 'white' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(147, 23, 253, 0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(147, 23, 253, 0.4)' : '1px solid transparent',
                transition: 'all 0.2s ease',
              })}
              onClick={onClose}
            >
              <Icon size={20} />
              {!collapsed && <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
