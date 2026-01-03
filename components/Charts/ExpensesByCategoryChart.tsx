'use client';

import { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, formatPercentage } from '@/utils/formatCurrency';
import { ChartCard } from '@/components/ui/GlassCard';
import { NoDataEmpty } from '@/components/ui/EmptyState';
import { CATEGORY_EMOJIS } from '@/types';

const COLORS = [
  '#667eea',
  '#f45c43',
  '#38ef7d',
  '#4facfe',
  '#f5af19',
  '#f093fb',
  '#11998e',
  '#eb3349',
  '#764ba2',
  '#2193b0',
  '#9d50bb',
  '#00f2fe',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        className="glass-card-static p-3"
        style={{ minWidth: '150px' }}
      >
        <p className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {data.name}
        </p>
        <p className="mb-1" style={{ color: 'var(--expense-color)' }}>
          {formatCurrency(data.value)}
        </p>
        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
          {formatPercentage(data.payload.percent * 100)} do total
        </p>
      </div>
    );
  }
  return null;
};

export function ExpensesByCategoryChart() {
  const { transactions, currentMonth } = useFinanceStore();

  const data = useMemo(() => {
    // Include all expenses (both real and predicted)
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && t.month === currentMonth
    );

    const byCategory: Record<string, number> = {};
    expenses.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.value;
    });

    return Object.entries(byCategory)
      .map(([name, value]) => ({
        name,
        value,
        emoji: CATEGORY_EMOJIS[name] || '📦',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <ChartCard title="Despesas por Categoria" icon="📊">
        <NoDataEmpty />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Despesas por Categoria"
      icon="📊"
      description="Distribuição de gastos do mês"
    >
      <Row>
        <Col md={6}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col md={6}>
          <div
            className="d-flex flex-column gap-2"
            style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}
          >
            {data.map((item, index) => (
              <div
                key={item.name}
                className="d-flex align-items-center justify-content-between p-2 rounded"
                style={{ background: 'var(--glass-bg)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded"
                    style={{
                      width: '12px',
                      height: '12px',
                      background: COLORS[index % COLORS.length],
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.emoji} {item.name}
                  </span>
                </div>
                <div className="text-end">
                  <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(item.value)}
                  </span>
                  <small className="d-block" style={{ color: 'var(--text-muted)' }}>
                    {formatPercentage((item.value / total) * 100)}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </ChartCard>
  );
}

export default ExpensesByCategoryChart;
