'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  className = '',
  hover = true,
  gradient = 'none',
  padding = 'md',
  onClick,
  style,
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const gradientClasses = {
    none: '',
    primary: 'border-t-4 border-t-[#667eea]',
    success: 'border-t-4 border-t-[#38ef7d]',
    danger: 'border-t-4 border-t-[#f45c43]',
    warning: 'border-t-4 border-t-[#f5af19]',
    info: 'border-t-4 border-t-[#4facfe]',
  };

  return (
    <div
      className={`
        glass-card-static
        ${hover ? 'glass-card' : ''}
        ${paddingClasses[padding]}
        ${gradientClasses[gradient]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

// Summary Card variant
interface SummaryCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  variant?: 'balance' | 'income' | 'expense' | 'default';
  className?: string;
}

export function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  variant = 'default',
  className = '',
}: SummaryCardProps) {
  const variantClasses = {
    default: 'summary-card',
    balance: 'summary-card summary-card-balance',
    income: 'summary-card summary-card-income',
    expense: 'summary-card summary-card-expense',
  };

  const valueColors = {
    default: 'text-gradient',
    balance: 'text-gradient',
    income: 'text-gradient-success',
    expense: 'text-gradient-danger',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl opacity-80">{icon}</div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {title}
        </span>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${valueColors[variant]}`}>
        {value}
      </div>
      {subtitle && (
        <div className="text-xs mt-2" style={{ color: 'var(--text-hint)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Chart Card variant
interface ChartCardProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({
  title,
  icon,
  description,
  children,
  className = '',
  action,
}: ChartCardProps) {
  return (
    <div className={`chart-container ${className}`}>
      <div className="chart-header justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-xl">{icon}</div>}
          <div>
            <h3 className="chart-title">{title}</h3>
            {description && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default GlassCard;
