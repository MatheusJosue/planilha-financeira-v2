'use client';

import { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { SummaryCard } from '@/components/ui/GlassCard';

export function SummaryCards() {
  const { transactions, currentMonth } = useFinanceStore();

  const stats = useMemo(() => {
    // All transactions for the month (including predicted/recurring)
    const monthTransactions = transactions.filter((t) => t.month === currentMonth);

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = income - expense;

    return {
      income,
      expense,
      balance,
    };
  }, [transactions, currentMonth]);

  return (
    <Row className="g-4 mb-4">
      <Col xs={12} md={4}>
        <SummaryCard
          icon={<FiDollarSign size={24} />}
          title="Saldo"
          value={formatCurrency(stats.balance)}
          subtitle="Saldo do mês"
          variant="balance"
        />
      </Col>

      <Col xs={12} md={4}>
        <SummaryCard
          icon={<FiTrendingUp size={24} />}
          title="Receitas"
          value={formatCurrency(stats.income)}
          subtitle="Total de receitas"
          variant="income"
        />
      </Col>

      <Col xs={12} md={4}>
        <SummaryCard
          icon={<FiTrendingDown size={24} />}
          title="Despesas"
          value={formatCurrency(stats.expense)}
          subtitle="Total de despesas"
          variant="expense"
        />
      </Col>
    </Row>
  );
}

export default SummaryCards;
