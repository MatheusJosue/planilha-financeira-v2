'use client';

import Link from 'next/link';
import { FiArrowDownLeft, FiArrowRight, FiArrowUpRight } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ChartCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { NoTransactionsEmpty } from '@/components/ui/EmptyState';
import { CATEGORY_EMOJIS } from '@/types';

interface RecentTransactionsProps {
  onAdd?: () => void;
}

export function RecentTransactions({ onAdd = () => {} }: RecentTransactionsProps) {
  const { transactions, currentMonth } = useFinanceStore();

  const recentTransactions = transactions
    .filter((transaction) => transaction.month === currentMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ChartCard
      title="Transações recentes"
      description="Últimas movimentações registradas no mês"
      className="recent-transactions-card"
      action={
        <Link href="/transacoes" className="text-decoration-none">
          <GlassButton variant="glass" size="sm" icon={<FiArrowRight size={15} />} iconPosition="right">
            Ver todas
          </GlassButton>
        </Link>
      }
    >
      {recentTransactions.length === 0 ? (
        <NoTransactionsEmpty onAdd={onAdd} />
      ) : (
        <div className="recent-transactions-list">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            const status = transaction.is_predicted
              ? 'Prevista'
              : transaction.is_paid
                ? null
                : 'Pendente';

            return (
              <div key={transaction.id} className="recent-transaction-row">
                <div className={`recent-transaction-indicator ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                </div>

                <div className="recent-transaction-copy">
                  <div className="recent-transaction-title">
                    <strong>{transaction.description}</strong>
                    {status && (
                      <span className={`recent-transaction-status ${transaction.is_predicted ? 'predicted' : 'pending'}`}>
                        {status}
                      </span>
                    )}
                  </div>
                  <div className="recent-transaction-meta">
                    <span>{CATEGORY_EMOJIS[transaction.category] || '📦'} {transaction.category}</span>
                    <i />
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>

                <strong className={`recent-transaction-value ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? '+' : '−'} {formatCurrency(transaction.value)}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}

export default RecentTransactions;
