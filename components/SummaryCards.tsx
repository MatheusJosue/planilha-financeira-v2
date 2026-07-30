'use client';

import { useMemo } from 'react';
import { FiArrowDownRight, FiArrowUpRight, FiDollarSign } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';

export function SummaryCards() {
  const { transactions, currentMonth } = useFinanceStore();

  const stats = useMemo(() => {
    const monthTransactions = transactions.filter((transaction) => transaction.month === currentMonth);
    const income = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.value, 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    return { income, expense, balance: income - expense };
  }, [transactions, currentMonth]);

  const expenseRatio = stats.income > 0
    ? Math.min((stats.expense / stats.income) * 100, 100)
    : stats.expense > 0 ? 100 : 0;

  return (
    <section className="financial-pulse mb-5">
      <div className="financial-pulse-main">
        <div className="financial-pulse-icon"><FiDollarSign /></div>
        <div>
          <span className="financial-pulse-label">Saldo previsto do mês</span>
          <strong className={stats.balance >= 0 ? 'is-positive' : 'is-negative'}>
            {formatCurrency(stats.balance)}
          </strong>
          <small>{stats.balance >= 0 ? 'Seu mês está projetado no positivo' : 'Suas despesas superam as receitas'}</small>
        </div>
      </div>

      <div className="financial-pulse-details">
        <div className="financial-flow-item income">
          <div className="financial-flow-icon"><FiArrowDownRight /></div>
          <div><span>Entradas</span><strong>{formatCurrency(stats.income)}</strong></div>
        </div>
        <div className="financial-flow-item expense">
          <div className="financial-flow-icon"><FiArrowUpRight /></div>
          <div><span>Saídas</span><strong>{formatCurrency(stats.expense)}</strong></div>
        </div>
        <div className="financial-commitment">
          <div><span>Renda comprometida</span><strong>{expenseRatio.toFixed(0)}%</strong></div>
          <div className="financial-commitment-track">
            <span style={{ width: `${expenseRatio}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SummaryCards;
