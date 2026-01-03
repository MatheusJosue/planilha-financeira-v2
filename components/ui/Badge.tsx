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
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white',
    success: 'bg-gradient-to-r from-[#11998e] to-[#38ef7d] text-white',
    danger: 'bg-gradient-to-r from-[#eb3349] to-[#f45c43] text-white',
    warning: 'bg-gradient-to-r from-[#f5af19] to-[#f093fb] text-white',
    info: 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white',
    glass: 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pill ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
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
