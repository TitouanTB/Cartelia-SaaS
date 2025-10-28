import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    const toast = { id, type, message };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (message) => showToast('success', message),
    error: (message) => showToast('error', message),
    info: (message) => showToast('info', message),
    warning: (message) => showToast('warning', message),
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const Icon = iconMap[toast.type];

  return (
    <div
      className="card fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '320px',
        maxWidth: '420px',
        padding: '1rem',
        borderLeft: '4px solid',
        borderLeftColor:
          toast.type === 'success'
            ? 'var(--color-success)'
            : toast.type === 'error'
            ? 'var(--color-error)'
            : toast.type === 'warning'
            ? 'var(--color-warning)'
            : 'var(--color-info)',
      }}
    >
      <Icon
        size={20}
        color={
          toast.type === 'success'
            ? 'var(--color-success)'
            : toast.type === 'error'
            ? 'var(--color-error)'
            : toast.type === 'warning'
            ? 'var(--color-warning)'
            : 'var(--color-info)'
        }
      />
      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-text)' }}>
        {toast.message}
      </div>
      <button onClick={onClose} style={{ padding: '0.25rem', opacity: 0.6 }}>
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
