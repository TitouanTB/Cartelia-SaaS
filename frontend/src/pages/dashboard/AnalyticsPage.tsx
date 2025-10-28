import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const { selectedRestaurantId } = useAuth();

  const { data: _stats } = useQuery({
    queryKey: ['analytics', selectedRestaurantId],
    queryFn: () => api.get(`/dashboard/stats?restaurantId=${selectedRestaurantId}`),
    enabled: !!selectedRestaurantId,
  });

  const reviewsData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Avis collectés',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgba(147, 23, 253, 1)',
        backgroundColor: 'rgba(147, 23, 253, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'var(--color-text-muted)' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
      x: {
        ticks: { color: 'var(--color-text-muted)' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem' }}>Évolution des avis</h3>
        <div style={{ height: '300px' }}>
          <Line data={reviewsData} options={chartOptions} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>ROI par canal</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ROIBar label="WhatsApp" value={127} color="var(--color-success)" />
            <ROIBar label="Email" value={98} color="var(--color-info)" />
            <ROIBar label="QR Code" value={154} color="var(--color-primary)" />
          </div>
        </div>

        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Scans par lieu</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ScanRow label="Table 1-4" scans={142} />
            <ScanRow label="Table 5-8" scans={108} />
            <ScanRow label="Table 9-12" scans={95} />
            <ScanRow label="Entrée" scans={64} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ROIBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: '8px', background: 'var(--color-bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}

function ScanRow({ label, scans }: { label: string; scans: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '0.9rem' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{scans}</span>
    </div>
  );
}
