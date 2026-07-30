'use client';

import { useMemo } from 'react';
import { FiArrowRight, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, formatCurrencyWithSign } from '@/utils/formatCurrency';
import { formatMonth, getNextMonth } from '@/utils/formatDate';

export function DashboardForecast() {
  const { transactions, currentMonth, monthsData, generatePredictedTransactions } = useFinanceStore();
  const nextMonth = useMemo(() => getNextMonth(currentMonth), [currentMonth]);

  const thisMonth = useMemo(() => {
    const realizedIncome = transactions.filter((t) => t.type === 'income' && t.is_paid).reduce((sum, t) => sum + t.value, 0);
    const realizedExpense = transactions.filter((t) => t.type === 'expense' && t.is_paid).reduce((sum, t) => sum + t.value, 0);
    const pendingIncome = transactions.filter((t) => t.type === 'income' && !t.is_paid).reduce((sum, t) => sum + t.value, 0);
    const pendingExpense = transactions.filter((t) => t.type === 'expense' && !t.is_paid).reduce((sum, t) => sum + t.value, 0);

    return {
      realizedBalance: realizedIncome - realizedExpense,
      projectedBalance: realizedIncome + pendingIncome - realizedExpense - pendingExpense,
      pendingExpense,
    };
  }, [transactions]);

  const nextMonthStats = useMemo(() => {
    const predicted = generatePredictedTransactions(1).filter((transaction) => transaction.month === nextMonth);
    const cached = (monthsData[nextMonth]?.transactions || []).filter((transaction) => !transaction.is_predicted);
    const all = [...cached, ...predicted];
    const income = all.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.value, 0);
    const expense = all.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.value, 0);
    return { income, expense, balance: income - expense };
  }, [generatePredictedTransactions, monthsData, nextMonth]);

  const delta = nextMonthStats.balance - thisMonth.projectedBalance;

  return (
    <div className="forecast-panel">
      <div className="forecast-panel-header">
        <div className="forecast-panel-icon"><FiTrendingUp /></div>
        <div><span>Projeção</span><h3>Próximos passos</h3></div>
      </div>

      <div className="forecast-timeline">
        <article className="forecast-period is-current">
          <div className="forecast-period-title"><FiCalendar /><span>{formatMonth(currentMonth)}</span></div>
          <strong className={thisMonth.projectedBalance >= 0 ? 'is-positive' : 'is-negative'}>{formatCurrency(thisMonth.projectedBalance)}</strong>
          <small>Saldo previsto</small>
          <div className="forecast-meta"><span>Realizado</span><b>{formatCurrency(thisMonth.realizedBalance)}</b></div>
          <div className="forecast-meta"><span>A pagar</span><b className="is-negative">{formatCurrency(thisMonth.pendingExpense)}</b></div>
        </article>

        <div className="forecast-connector"><FiArrowRight /></div>

        <article className="forecast-period">
          <div className="forecast-period-title"><FiCalendar /><span>{formatMonth(nextMonth)}</span></div>
          <strong className={nextMonthStats.balance >= 0 ? 'is-positive' : 'is-negative'}>{formatCurrency(nextMonthStats.balance)}</strong>
          <small>Saldo estimado</small>
          <div className="forecast-meta"><span>Receitas</span><b className="is-positive">{formatCurrency(nextMonthStats.income)}</b></div>
          <div className="forecast-meta"><span>Variação</span><b>{formatCurrencyWithSign(delta)}</b></div>
        </article>
      </div>
    </div>
  );
}

export default DashboardForecast;
