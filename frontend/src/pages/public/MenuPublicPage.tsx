import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

type Menu = {
  restaurantName: string;
  restaurantLogo?: string;
  items: MenuItem[];
};

export default function MenuPublicPage() {
  const { id } = useParams<{ id: string }>();

  const { data: menu, isLoading } = useQuery<Menu>({
    queryKey: ['public-menu', id],
    queryFn: () => api.get(`/menu/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="skeleton" style={{ width: '100%', height: '100vh' }} />;
  }

  if (!menu) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Menu introuvable</p>
      </div>
    );
  }

  const categories = [...new Set(menu.items.map((item) => item.category))];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          {menu.restaurantLogo && (
            <img
              src={menu.restaurantLogo}
              alt={menu.restaurantName}
              style={{ width: '120px', height: '120px', borderRadius: 'var(--radius)', objectFit: 'cover', margin: '0 auto 1.5rem' }}
            />
          )}
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{menu.restaurantName}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Notre carte</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {categories.map((category) => (
            <div key={category}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
                {category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {menu.items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.name}</h3>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{item.price}€</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
