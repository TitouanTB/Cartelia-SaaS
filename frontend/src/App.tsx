import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import AvisPage from './pages/dashboard/AvisPage';
import MarketingPage from './pages/dashboard/MarketingPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import QRPage from './pages/dashboard/QRPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import HelpPage from './pages/dashboard/HelpPage';
import OnboardingPage from './pages/dashboard/OnboardingPage';
import MenuPublicPage from './pages/public/MenuPublicPage';
import ReviewPublicPage from './pages/public/ReviewPublicPage';
import RegisterPublicPage from './pages/public/RegisterPublicPage';
import WaitlistPage from './pages/public/WaitlistPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <span className="spinner" style={{ width: '48px', height: '48px' }} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <span className="spinner" style={{ width: '48px', height: '48px' }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/menu/:id" element={<MenuPublicPage />} />
      <Route path="/review/:id" element={<ReviewPublicPage />} />
      <Route path="/register/:id" element={<RegisterPublicPage />} />
      <Route path="/waitlist" element={<WaitlistPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="avis" element={<AvisPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="qr" element={<QRPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
