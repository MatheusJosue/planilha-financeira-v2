'use client';

import Link from 'next/link';
import { FiTarget, FiArrowRight, FiPlus } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, formatPercentage } from '@/utils/formatCurrency';
import { ChartCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NoGoalsEmpty } from '@/components/ui/EmptyState';
import { GlassButton } from '@/components/ui/GlassButton';
import { GOAL_ICONS } from '@/types';

export function GoalsOverview() {
  const { goals } = useFinanceStore();

  // Get top 3 active goals
  const activeGoals = goals
    .filter((g) => !g.is_completed)
    .slice(0, 3);

  const completedCount = goals.filter((g) => g.is_completed).length;

  if (goals.length === 0) {
    return (
      <ChartCard
        title="Metas Financeiras"
        icon="🎯"
        action={
          <Link href="/metas">
            <GlassButton variant="glass" size="sm" icon={<FiPlus size={16} />}>
              Nova Meta
            </GlassButton>
          </Link>
        }
      >
        <NoGoalsEmpty onAdd={() => {}} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Metas Financeiras"
      icon="🎯"
      description={`${completedCount} concluída${completedCount !== 1 ? 's' : ''} de ${goals.length}`}
      action={
        <Link href="/metas">
          <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
            Ver todas
          </GlassButton>
        </Link>
      }
    >
      <div className="d-flex flex-column gap-3">
        {activeGoals.map((goal) => {
          const percentage = (goal.current_value / goal.target_value) * 100;
          const variant = percentage >= 100 ? 'success' : percentage >= 70 ? 'primary' : 'warning';

          return (
            <div
              key={goal.id}
              className="p-3 rounded-3"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-2"
                  style={{
                    width: '40px',
                    height: '40px',
                    background: goal.color || 'var(--gradient-primary)',
                    fontSize: '18px',
                  }}
                >
                  {GOAL_ICONS[goal.icon as keyof typeof GOAL_ICONS] || '🎯'}
                </div>
                <div className="flex-1">
                  <p className="mb-0 fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    {goal.name}
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(goal.current_value)} de {formatCurrency(goal.target_value)}
                  </small>
                </div>
                <span
                  className="fw-bold"
                  style={{
                    color: percentage >= 100 ? 'var(--income-color)' : 'var(--text-primary)',
                  }}
                >
                  {formatPercentage(Math.min(percentage, 100), 0)}
                </span>
              </div>
              <ProgressBar
                value={goal.current_value}
                max={goal.target_value}
                variant={variant}
                size="sm"
              />
            </div>
          );
        })}

        {activeGoals.length === 0 && goals.length > 0 && (
          <div className="text-center py-4">
            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
              🎉 Todas as metas foram concluídas!
            </p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default GoalsOverview;
