'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2]',
    success: 'bg-gradient-to-r from-[#11998e] to-[#38ef7d]',
    warning: 'bg-gradient-to-r from-[#f5af19] to-[#f093fb]',
    danger: 'bg-gradient-to-r from-[#eb3349] to-[#f45c43]',
    info: 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe]',
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeClasses[size]}`}
        style={{ background: 'var(--glass-bg)' }}
      >
        <div
          className={`
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            rounded-full
            transition-all duration-500 ease-out
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular Progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'info';
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showValue = true,
  label,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: '#667eea',
    success: '#38ef7d',
    warning: '#f5af19',
    danger: '#f45c43',
    info: '#4facfe',
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--glass-bg)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${colors[variant]}40)`,
          }}
        />
      </svg>
      {showValue && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="text-lg font-bold">{percentage.toFixed(0)}%</span>
        </div>
      )}
      {label && (
        <span
          className="mt-2 text-sm text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
