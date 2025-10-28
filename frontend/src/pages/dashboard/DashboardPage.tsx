import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, DollarSign, Star, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

type DashboardStats = {
  reviews: { total: number; average: number; trend: number };
  reactivated: { count: number; trend: number };
  revenue: { amount: number; trend: number };
  roi: { percentage: number; trend: number };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
  }>;
  copilotSuggestions: Array<{
    title: string;
    description: string;
    action: string;
  }>;
};

export default function DashboardPage() {
  const { selectedRestaurantId } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', selectedRestaurantId],
    queryFn: () => api.get(`/dashboard/stats?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card skeleton" style={{ height: '140px' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <KPICard
          icon={Star}
          label="Avis collectés"
          value={stats?.reviews.total ?? 0}
          subtitle={`Note moyenne: ${stats?.reviews.average.toFixed(1) ?? '0'}/5`}
          trend={stats?.reviews.trend ?? 0}
          color="var(--color-warning)"
        />
        <KPICard
          icon={Users}
          label="Clients réactivés"
          value={stats?.reactivated.count ?? 0}
          subtitle="Ce mois-ci"
          trend={stats?.reactivated.trend ?? 0}
          color="var(--color-primary)"
        />
        <KPICard
          icon={DollarSign}
          label="Revenus générés"
          value={`${stats?.revenue.amount ?? 0}€`}
          subtitle="Estimé ce mois"
          trend={stats?.revenue.trend ?? 0}
          color="var(--color-success)"
        />
        <KPICard
          icon={TrendingUp}
          label="ROI Campagnes"
          value={`${stats?.roi.percentage ?? 0}%`}
          subtitle="Moyenne globale"
          trend={stats?.roi.trend ?? 0}
          color="var(--color-info)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem' }}>Suggestions Copilot</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.copilotSuggestions?.length ? (
              stats.copilotSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="card"
                  style={{
                    padding: '1rem',
                    background: 'var(--color-bg-tertiary)',
                    border: '1px solid rgba(147, 23, 253, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>{suggestion.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>{suggestion.description}</p>
                  <button className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', border: '1px solid var(--color-border)' }}>
                    {suggestion.action}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Aucune suggestion pour le moment</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem' }}>Activité récente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.recentActivity?.length ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{activity.message}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(activity.timestamp).toLocaleString('fr-FR')}</p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, subtitle, trend, color }: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  trend: number;
  color: string;
}) {
  return (
    <div className="card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: `${color}20`,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon size={24} color={color} />
        </div>
        <div
          className={trend >= 0 ? 'badge-success' : 'badge-error'}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>{label}</p>
      <p style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{subtitle}</p>
    </div>
  );
}
