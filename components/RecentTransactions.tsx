'use client';

import Link from 'next/link';
import { FiArrowRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ChartCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/Badge';
import { NoTransactionsEmpty } from '@/components/ui/EmptyState';
import { CATEGORY_EMOJIS } from '@/types';

export function RecentTransactions() {
  const { transactions, currentMonth } = useFinanceStore();

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .filter((t) => t.month === currentMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentTransactions.length === 0) {
    return (
      <ChartCard
        title="Transações Recentes"
        icon="📋"
        action={
          <Link href="/transacoes">
            <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
              Ver todas
            </GlassButton>
          </Link>
        }
      >
        <NoTransactionsEmpty onAdd={() => {}} />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Transações Recentes"
      icon="📋"
      description="Últimas movimentações do mês"
      action={
        <Link href="/transacoes">
          <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={16} />} iconPosition="right">
            Ver todas
          </GlassButton>
        </Link>
      }
    >
      <div className="d-flex flex-column gap-2">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`
              d-flex align-items-center gap-3 p-3 rounded-3
              ${transaction.is_predicted ? 'opacity-75' : ''}
            `}
            style={{
              background: 'var(--glass-bg)',
              border: `1px solid var(--glass-border)`,
              borderLeft: `3px solid ${
                transaction.type === 'income'
                  ? 'var(--income-color)'
                  : 'var(--expense-color)'
              }`,
            }}
          >
            {/* Icon */}
            <div
              className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
              style={{
                width: '40px',
                height: '40px',
                background:
                  transaction.type === 'income'
                    ? 'var(--income-bg)'
                    : 'var(--expense-bg)',
              }}
            >
              {transaction.type === 'income' ? (
                <FiTrendingUp size={18} color="var(--income-color)" />
              ) : (
                <FiTrendingDown size={18} color="var(--expense-color)" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="d-flex align-items-center gap-2">
                <p
                  className="mb-0 fw-medium text-truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {transaction.description}
                </p>
                {transaction.is_predicted && <StatusBadge status="predicted" />}
              </div>
              <div className="d-flex align-items-center gap-2">
                <small style={{ color: 'var(--text-muted)' }}>
                  {CATEGORY_EMOJIS[transaction.category] || '📦'} {transaction.category}
                </small>
                <small style={{ color: 'var(--text-hint)' }}>•</small>
                <small style={{ color: 'var(--text-hint)' }}>
                  {formatDate(transaction.date)}
                </small>
              </div>
            </div>

            {/* Value */}
            <span
              className="fw-bold flex-shrink-0"
              style={{
                color:
                  transaction.type === 'income'
                    ? 'var(--income-color)'
                    : 'var(--expense-color)',
              }}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.value)}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export default RecentTransactions;
