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

function SkeletonHero() {
  return <div className="page-skeleton-hero"><div><Skeleton width={150} height={10} className="mb-3" /><Skeleton width={260} height={42} className="mb-3" /><Skeleton width="min(440px, 80vw)" height={14} /></div><div className="d-flex gap-2"><Skeleton width={180} height={42} variant="rounded" /><Skeleton width={145} height={42} variant="rounded" /></div></div>;
}

function SkeletonPulse({ stats = 3 }: { stats?: number }) {
  return <div className="page-skeleton-pulse"><div className="d-flex align-items-center gap-3"><Skeleton width={50} height={50} variant="rounded" /><div><Skeleton width={120} height={10} className="mb-2" /><Skeleton width={190} height={30} /></div></div><div className="page-skeleton-pulse-stats">{Array.from({ length: stats }).map((_, index) => <div key={index}><Skeleton width={70} height={9} className="mb-2" /><Skeleton width={105} height={20} /></div>)}</div></div>;
}

function SkeletonToolbar() {
  return <div className="page-skeleton-toolbar"><div><Skeleton width={90} height={9} className="mb-2" /><Skeleton width={180} height={20} /></div><div className="d-flex gap-2 flex-wrap justify-content-end"><Skeleton width={210} height={42} variant="rounded" /><Skeleton width={150} height={42} variant="rounded" /><Skeleton width={150} height={42} variant="rounded" /></div></div>;
}

function SkeletonGrid({ count = 8, compact = false }: { count?: number; compact?: boolean }) {
  return <div className="page-skeleton-grid">{Array.from({ length: count }).map((_, index) => <div className="page-skeleton-card" key={index}><div className="d-flex align-items-center gap-3"><Skeleton width={38} height={38} variant="rounded" /><div className="flex-grow-1"><Skeleton width="70%" height={13} className="mb-2" /><Skeleton width="45%" height={9} /></div><Skeleton width={62} height={16} /></div>{!compact && <><Skeleton width="100%" height={6} variant="rounded" className="my-3" /><div className="d-flex justify-content-between"><Skeleton width={80} height={12} /><Skeleton width={70} height={12} /></div></>}</div>)}</div>;
}

export function PageSkeleton({ pathname }: { pathname: string }) {
  const records = pathname.startsWith('/transacoes') || pathname.startsWith('/recorrentes');
  const settings = pathname.startsWith('/configuracoes');
  return <main className="main-content page-skeleton"><div className="container-fluid px-3 px-lg-4"><SkeletonHero />{!settings && <SkeletonPulse stats={pathname === '/' ? 3 : 2} />}{settings ? <div className="page-skeleton-settings"><Skeleton width={220} height={24} className="mb-4" />{Array.from({ length: 5 }).map((_, index) => <div key={index} className="mb-4"><Skeleton width={130} height={11} className="mb-2" /><Skeleton width="100%" height={44} variant="rounded" /></div>)}</div> : <div className="page-skeleton-section"><SkeletonToolbar /><SkeletonGrid count={pathname === '/' ? 6 : 8} compact={records} /></div>}</div></main>;
}

export default Skeleton;
