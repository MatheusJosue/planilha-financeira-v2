'use client';

import Link from 'next/link';
import { FiArrowRight, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, formatPercentage } from '@/utils/formatCurrency';
import { ChartCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NoBudgetsEmpty } from '@/components/ui/EmptyState';
import { GlassButton } from '@/components/ui/GlassButton';
import { CATEGORY_EMOJIS } from '@/types';

export function BudgetOverview() {
  const { currentMonth, getAllBudgetStatuses, categoryBudgets } = useFinanceStore();

  const budgetStatuses = getAllBudgetStatuses(currentMonth);

  // Sort by percentage used (highest first)
  const sortedBudgets = [...budgetStatuses].sort(
    (a, b) => b.percentageUsed - a.percentageUsed
  );

  // Get top 4 budgets
  const displayBudgets = sortedBudgets.slice(0, 4);

  // Count alerts
  const alertCount = budgetStatuses.filter(
    (b) => b.isOverBudget || b.isNearLimit
  ).length;

  if (categoryBudgets.length === 0) {
    return (
      <ChartCard
        title="Orçamento por Categoria"
        icon="💰"
        action={
          <Link href="/orcamento">
            <GlassButton variant="glass" size="sm" icon={<FiPlus size={16} />}>
              Definir
            </GlassButton>
          </Link>
        }
      >
        <NoBudgetsEmpty onAdd={() => {}} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Orçamento por Categoria"
      icon="💰"
      description={
        alertCount > 0
          ? `${alertCount} categoria${alertCount > 1 ? 's' : ''} em alerta`
          : 'Tudo sob controle'
      }
      action={
        <Link href="/orcamento">
          <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
            Ver todos
          </GlassButton>
        </Link>
      }
    >
      <div className="d-flex flex-column gap-3">
        {displayBudgets.map((budget) => {
          const variant = budget.isOverBudget
            ? 'danger'
            : budget.isNearLimit
            ? 'warning'
            : 'success';

          return (
            <div
              key={budget.category}
              className="p-3 rounded-3"
              style={{
                background: budget.isOverBudget
                  ? 'rgba(244, 92, 67, 0.1)'
                  : 'var(--glass-bg)',
                border: `1px solid ${
                  budget.isOverBudget
                    ? 'rgba(244, 92, 67, 0.3)'
                    : 'var(--glass-border)'
                }`,
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span>{CATEGORY_EMOJIS[budget.category] || '📦'}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{budget.category}</span>
                  {budget.isOverBudget && (
                    <FiAlertTriangle size={14} color="var(--expense-color)" />
                  )}
                </div>
                <span
                  className="fw-semibold"
                  style={{
                    color: budget.isOverBudget
                      ? 'var(--expense-color)'
                      : 'var(--text-primary)',
                  }}
                >
                  {formatPercentage(Math.min(budget.percentageUsed, 999), 0)}
                </span>
              </div>

              <ProgressBar
                value={budget.spentValue}
                max={budget.budgetValue}
                variant={variant}
                size="sm"
                className="mb-2"
              />

              <div className="d-flex justify-content-between">
                <small style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(budget.spentValue)} gasto
                </small>
                <small
                  style={{
                    color: budget.remainingValue < 0
                      ? 'var(--expense-color)'
                      : 'var(--text-muted)',
                  }}
                >
                  {budget.remainingValue < 0
                    ? `${formatCurrency(Math.abs(budget.remainingValue))} acima`
                    : `${formatCurrency(budget.remainingValue)} restante`}
                </small>
              </div>
            </div>
          );
        })}

        {displayBudgets.length === 0 && (
          <div className="text-center py-4">
            <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
              Nenhum orçamento para este mês
            </p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default BudgetOverview;
