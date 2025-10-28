import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, children, variant = 'primary', size = 'md', loading, fullWidth, disabled, ...props },
  ref
) {
  const classes = classNames('btn', className, {
    'btn-primary': variant === 'primary',
    'btn-secondary': variant === 'secondary',
    'btn-ghost': variant === 'ghost',
    'btn-sm': size === 'sm',
    'btn-lg': size === 'lg',
  });

  const styles: CSSProperties = {
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.6 : 1,
    pointerEvents: disabled || loading ? 'none' : 'auto',
  };

  return (
    <button
      ref={ref}
      className={classes}
      style={styles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner" /> : children}
    </button>
  );
});
