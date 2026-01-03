'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMonthShort } from '@/utils/formatDate';
import { ChartCard } from '@/components/ui/GlassCard';
import { NoDataEmpty } from '@/components/ui/EmptyState';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-static p-3" style={{ minWidth: '160px' }}>
        <p className="fw-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="mb-1 d-flex justify-content-between"
            style={{ color: entry.color }}
          >
            <span>{entry.name}:</span>
            <span className="fw-semibold">{formatCurrency(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function IncomeVsExpenseChart() {
  const { monthsData, transactions, currentMonth } = useFinanceStore();

  const data = useMemo(() => {
    // Get all months including current month
    const allMonths = new Set(Object.keys(monthsData));
    allMonths.add(currentMonth);

    const months = Array.from(allMonths).sort().slice(-6); // Last 6 months

    return months.map((month) => {
      // Use transactions state for current month, monthsData for others
      // Include all transactions (real and predicted)
      let monthTransactions: typeof transactions = [];
      if (month === currentMonth) {
        monthTransactions = transactions;
      } else {
        monthTransactions = monthsData[month]?.transactions || [];
      }

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);

      return {
        month: formatMonthShort(month),
        Receitas: income,
        Despesas: expense,
      };
    });
  }, [monthsData, transactions, currentMonth]);

  if (data.length === 0 || data.every((d) => d.Receitas === 0 && d.Despesas === 0)) {
    return (
      <ChartCard title="Receitas vs Despesas" icon="📈">
        <NoDataEmpty />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Receitas vs Despesas"
      icon="📈"
      description="Comparativo dos últimos meses"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={8}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38ef7d" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#11998e" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f45c43" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#eb3349" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--glass-border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--glass-border)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--glass-border)' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-bg)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
            )}
          />
          <Bar
            dataKey="Receitas"
            fill="url(#colorReceitas)"
            radius={[8, 8, 0, 0]}
            maxBarSize={50}
          />
          <Bar
            dataKey="Despesas"
            fill="url(#colorDespesas)"
            radius={[8, 8, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default IncomeVsExpenseChart;
