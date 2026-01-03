'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'glass' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    glass: 'btn-glass',
    primary: 'btn-gradient',
    success: 'btn-gradient-success',
    danger: 'btn-gradient-danger',
    warning: 'btn-gradient bg-gradient-warning',
    info: 'btn-gradient bg-gradient-info',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-250
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}

// Icon Button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'glass' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({
  icon,
  variant = 'glass',
  size = 'md',
  tooltip,
  className = '',
  style,
  ...props
}: IconButtonProps) {
  const variantClasses = {
    glass: 'btn-glass',
    primary: 'btn-gradient',
    success: 'btn-gradient-success',
    danger: 'btn-gradient-danger',
  };

  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '0.875rem' },
    md: { width: '40px', height: '40px', fontSize: '1rem' },
    lg: { width: '48px', height: '48px', fontSize: '1.125rem' },
  };

  // Glass variant should use text-primary color, others use white
  const iconColor = variant === 'glass' ? 'var(--text-primary)' : 'white';

  return (
    <button
      className={`${variantClasses[variant]} ${className}`}
      title={tooltip}
      style={{
        ...sizeStyles[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        transition: 'all 250ms ease',
        padding: 0,
        color: iconColor,
        ...style,
      }}
      {...props}
    >
      {icon}
    </button>
  );
}

// Floating Action Button
interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButton({
  icon,
  position = 'bottom-right',
  className = '',
  ...props
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  };

  return (
    <button
      className={`
        fab
        fixed ${positionClasses[position]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

export default GlassButton;
