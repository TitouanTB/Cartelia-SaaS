import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  width?: string | number;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Modal({ open, title, description, onClose, width = '520px', children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 17, 21, 0.88)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 2000,
        padding: '2rem',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="card fade-in" style={{ width: '100%', maxWidth: width, padding: '2rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.6 }}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
        {title && <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h2>}
        {description && <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{description}</p>}
        <div style={{ marginBottom: footer ? '2rem' : 0 }}>{children}</div>
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>{footer}</div>}
      </div>
    </div>
  );
}
