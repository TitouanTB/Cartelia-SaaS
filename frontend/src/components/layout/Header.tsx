import { useState } from 'react';
import { Menu, Search, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import classNames from 'classnames';

type HeaderProps = {
  onMenuToggle?: () => void;
};

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, restaurants, selectedRestaurant, selectedRestaurantId, setRestaurant, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);

  return (
    <header
      style={{
        height: '72px',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(17, 19, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-ghost" onClick={onMenuToggle} style={{ padding: '0.5rem', display: 'none' }}>
          <Menu size={24} />
        </button>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            style={{
              width: '320px',
              padding: '0.7rem 1rem 0.7rem 2.75rem',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {restaurants.length > 1 && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn-ghost"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onClick={() => setShowRestaurantMenu(!showRestaurantMenu)}
            >
              {selectedRestaurant?.logo && (
                <img
                  src={selectedRestaurant.logo}
                  alt={selectedRestaurant.name}
                  style={{ width: '24px', height: '24px', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{selectedRestaurant?.name ?? 'Restaurant'}</span>
              <ChevronDown size={16} />
            </button>

            {showRestaurantMenu && (
              <div
                className="card fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  minWidth: '240px',
                  padding: '0.5rem',
                  zIndex: 1000,
                }}
              >
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    className={classNames('btn-ghost', {
                      active: restaurant.id === selectedRestaurantId,
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderRadius: '12px',
                      background: restaurant.id === selectedRestaurantId ? 'rgba(147, 23, 253, 0.1)' : 'transparent',
                      color: restaurant.id === selectedRestaurantId ? 'var(--color-primary)' : 'inherit',
                    }}
                    onClick={() => {
                      setRestaurant(restaurant.id);
                      setShowRestaurantMenu(false);
                    }}
                  >
                    {restaurant.logo && (
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{restaurant.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          className="btn-ghost"
          style={{
            padding: '0.6rem',
            position: 'relative',
            borderRadius: 'var(--radius)',
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-error)',
            }}
          />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="btn-ghost"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'var(--color-primary)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {user?.email?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span style={{ fontSize: '0.9rem' }}>{user?.email?.split('@')[0] ?? 'User'}</span>
            <ChevronDown size={16} />
          </button>

          {showUserMenu && (
            <div
              className="card fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                minWidth: '200px',
                padding: '0.5rem',
                zIndex: 1000,
              }}
            >
              <button
                className="btn-ghost"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: '12px',
                }}
                onClick={() => {
                  setShowUserMenu(false);
                }}
              >
                <User size={18} />
                <span style={{ fontSize: '0.9rem' }}>Profil</span>
              </button>
              <button
                className="btn-ghost"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: '12px',
                  color: 'var(--color-error)',
                }}
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
              >
                <LogOut size={18} />
                <span style={{ fontSize: '0.9rem' }}>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
