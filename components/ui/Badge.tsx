'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  icon,
  className = '',
}: BadgeProps) {
  const variantBackgrounds: Record<Exclude<BadgeProps['variant'], undefined>, string> = {
    primary: 'var(--gradient-primary)',
    success: 'var(--gradient-success)',
    danger: 'var(--gradient-danger)',
    warning: 'var(--gradient-warning)',
    info: 'var(--gradient-info)',
    glass: 'var(--glass-bg)',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const style: React.CSSProperties =
    variant === 'glass'
      ? { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }
      : { background: variantBackgrounds[variant], color: 'white' };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        ${sizeClasses[size]}
        ${pill ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={style}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status Badge for transactions
interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'predicted';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const statusConfig = {
    paid: { label: 'Pago', variant: 'success' as const },
    pending: { label: 'Pendente', variant: 'warning' as const },
    predicted: { label: 'Previsto', variant: 'info' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} pill>
      {config.label}
    </Badge>
  );
}

// Type Badge for transactions
interface TypeBadgeProps {
  type: 'income' | 'expense';
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  return (
    <Badge variant={type === 'income' ? 'success' : 'danger'} size={size} pill>
      {type === 'income' ? 'Receita' : 'Despesa'}
    </Badge>
  );
}

export default Badge;
