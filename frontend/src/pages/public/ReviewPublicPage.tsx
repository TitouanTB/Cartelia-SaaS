import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

type ReviewLanding = {
  restaurantName: string;
  restaurantLogo?: string;
  googleReviewLink: string;
  whatsappLink: string;
  message: string;
};

export default function ReviewPublicPage() {
  const { id } = useParams<{ id: string }>();

  const { data: reviewLanding, isLoading } = useQuery<ReviewLanding>({
    queryKey: ['public-review', id],
    queryFn: () => api.get(`/review/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="skeleton" style={{ width: '100%', height: '100vh' }} />;
  }

  if (!reviewLanding) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <p>Page indisponible</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', background: 'radial-gradient(circle at top, rgba(147, 23, 253, 0.15), transparent 70%)' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        {reviewLanding.restaurantLogo && (
          <img
            src={reviewLanding.restaurantLogo}
            alt={reviewLanding.restaurantName}
            style={{ width: '120px', height: '120px', borderRadius: 'var(--radius)', objectFit: 'cover', margin: '0 auto 1.5rem' }}
          />
        )}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>{reviewLanding.restaurantName}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>{reviewLanding.message}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a
            href={reviewLanding.googleReviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            Laisser un avis Google
          </a>
          <a
            href={reviewLanding.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-lg"
            style={{ width: '100%' }}
          >
            Laisser un avis WhatsApp
          </a>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2rem' }}>
          Merci pour votre soutien ! Vos retours nous aident à nous améliorer 💜
        </p>
      </div>
    </div>
  );
}
