'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiActivity } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMonthShort } from '@/utils/formatDate';
import { ChartCard } from '@/components/ui/GlassCard';
import { NoDataEmpty } from '@/components/ui/EmptyState';

interface BalanceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function BalanceTooltip({ active, payload, label }: BalanceTooltipProps) {
  if (!active || !payload?.length) return null;

  const balance = payload[0].value;
  return (
    <div className="balance-chart-tooltip">
      <span>{label}</span>
      <strong className={balance >= 0 ? 'is-positive' : 'is-negative'}>
        {formatCurrency(balance)}
      </strong>
    </div>
  );
}

export function IncomeVsExpenseChart() {
  const { monthsData, transactions, currentMonth } = useFinanceStore();

  const data = useMemo(() => {
    const allMonths = new Set(Object.keys(monthsData));
    allMonths.add(currentMonth);

    return Array.from(allMonths).sort().slice(-6).map((month) => {
      const monthTransactions = month === currentMonth
        ? transactions
        : monthsData[month]?.transactions || [];
      const income = monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.value, 0);
      const expense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.value, 0);

      return { month: formatMonthShort(month), balance: income - expense };
    });
  }, [monthsData, transactions, currentMonth]);

  if (data.length === 0 || data.every((item) => item.balance === 0)) {
    return (
      <ChartCard title="Evolução do saldo" icon={<FiActivity />} className="balance-evolution-card">
        <NoDataEmpty />
      </ChartCard>
    );
  }

  const firstBalance = data[0]?.balance || 0;
  const lastBalance = data.at(-1)?.balance || 0;
  const trend = lastBalance - firstBalance;

  return (
    <ChartCard
      title="Evolução do saldo"
      icon={<FiActivity />}
      description="Resultado líquido dos últimos meses"
      className="balance-evolution-card"
      action={
        <span className={`balance-trend ${trend >= 0 ? 'is-positive' : 'is-negative'}`}>
          {trend >= 0 ? '↗' : '↘'} {formatCurrency(Math.abs(trend))}
        </span>
      }
    >
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 12, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#667eea" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="var(--glass-border)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<BalanceTooltip />} cursor={{ stroke: 'var(--glass-border)' }} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#7b8ff5"
            strokeWidth={2.5}
            fill="url(#balanceArea)"
            activeDot={{ r: 5, fill: '#7b8ff5', stroke: 'var(--text-primary)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default IncomeVsExpenseChart;
