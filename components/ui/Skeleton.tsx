'use client';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  className?: string;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rectangular',
  className = '',
  animation = 'shimmer',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton',
    none: '',
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        background: animation === 'shimmer' ? undefined : 'var(--glass-bg)',
      }}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card-static p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="60%" height={16} />
      </div>
      <Skeleton variant="text" width="40%" height={32} className="mb-2" />
      <Skeleton variant="text" width="80%" height={12} />
    </div>
  );
}

// Transaction Skeleton
export function TransactionSkeleton() {
  return (
    <div className="transaction-row">
      <Skeleton variant="circular" width={36} height={36} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={16} className="mb-1" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
      <Skeleton variant="text" width={80} height={20} />
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="chart-container">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="40%" height={20} />
      </div>
      <Skeleton variant="rounded" width="100%" height={height} />
    </div>
  );
}

// Summary Cards Skeleton
export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <SummaryCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <ChartSkeleton height={200} />
    </div>
  );
}

export default Skeleton;
