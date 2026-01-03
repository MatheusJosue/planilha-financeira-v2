'use client';

import { useState, useMemo, useEffect } from 'react';
import { Row, Col, InputGroup, Form } from 'react-bootstrap';
import { FiPlus, FiSearch, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionList } from '@/components/TransactionList';
import { TransactionForm } from '@/components/TransactionForm';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton, FloatingActionButton } from '@/components/ui/GlassButton';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';

export default function TransacoesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'period1' | 'period2'>('all');

  const { categories, transactions, currentMonth, userSettings, loadUserSettings } = useFinanceStore();

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  const periodEnabled = userSettings?.period_separation_enabled || false;
  const period1End = userSettings?.period_1_end || 5;

  // Helper to get day from date string
  const getDayFromDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate();
  };

  // Filter transactions by period
  const filterByPeriod = (t: { date: string }) => {
    if (!periodEnabled || periodFilter === 'all') return true;
    const day = getDayFromDate(t.date);
    if (periodFilter === 'period1') {
      return day <= period1End;
    } else {
      return day > period1End;
    }
  };

  // Calculate totals for current month (including predicted)
  const monthlyTotals = useMemo(() => {
    const monthTransactions = (transactions || []).filter(
      (t) => t.month === currentMonth && filterByPeriod(t)
    );

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0);

    return { income, expense, balance: income - expense };
  }, [transactions, currentMonth, periodFilter, periodEnabled, period1End]);

  // Calculate totals per period (when enabled)
  const periodTotals = useMemo(() => {
    if (!periodEnabled) return null;

    const monthTransactions = (transactions || []).filter((t) => t.month === currentMonth);

    const period1Transactions = monthTransactions.filter((t) => getDayFromDate(t.date) <= period1End);
    const period2Transactions = monthTransactions.filter((t) => getDayFromDate(t.date) > period1End);

    const calcTotals = (txs: typeof monthTransactions) => ({
      income: txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.value, 0),
      expense: txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.value, 0),
      get balance() { return this.income - this.expense; },
    });

    return {
      period1: calcTotals(period1Transactions),
      period2: calcTotals(period2Transactions),
    };
  }, [transactions, currentMonth, periodEnabled, period1End]);

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  return (
    <PageLayout
      title="Transações"
      subtitle="Gerencie suas receitas e despesas"
      action={
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>
          Nova Transação
        </GlassButton>
      }
    >
      <MonthSelector />

      {/* Period Summary Cards (when enabled) */}
      {periodEnabled && periodTotals && periodFilter === 'all' && (
        <Row className="mb-4 g-3">
          <Col md={6}>
            <GlassCard
              className="p-3"
              style={{
                borderLeft: '4px solid var(--income-color)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0 d-flex align-items-center" style={{ color: 'var(--income-color)' }}>
                  <FiCalendar className="me-2" />
                  Período 1 (Dia 1-{period1End})
                </h6>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Receitas</small>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--income-color)' }}>
                    {formatCurrency(periodTotals.period1.income)}
                  </p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Despesas</small>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--expense-color)' }}>
                    {formatCurrency(periodTotals.period1.expense)}
                  </p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Saldo</small>
                  <p
                    className="mb-0 fw-bold"
                    style={{
                      color: periodTotals.period1.balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)',
                    }}
                  >
                    {formatCurrency(periodTotals.period1.balance)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Col>
          <Col md={6}>
            <GlassCard
              className="p-3"
              style={{
                borderLeft: '4px solid var(--accent-blue)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
                  <FiCalendar className="me-2" />
                  Período 2 (Dia {period1End + 1}-fim)
                </h6>
              </div>
              <div className="d-flex justify-content-between">
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Receitas</small>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--income-color)' }}>
                    {formatCurrency(periodTotals.period2.income)}
                  </p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Despesas</small>
                  <p className="mb-0 fw-bold" style={{ color: 'var(--expense-color)' }}>
                    {formatCurrency(periodTotals.period2.expense)}
                  </p>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)' }}>Saldo</small>
                  <p
                    className="mb-0 fw-bold"
                    style={{
                      color: periodTotals.period2.balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)',
                    }}
                  >
                    {formatCurrency(periodTotals.period2.balance)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Col>
        </Row>
      )}

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <GlassCard className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--income-bg)',
                }}
              >
                <FiTrendingUp size={24} color="var(--income-color)" />
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>
                  Receitas {periodFilter !== 'all' ? `(${periodFilter === 'period1' ? 'P1' : 'P2'})` : ''}
                </small>
                <h4 className="mb-0" style={{ color: 'var(--income-color)' }}>
                  {formatCurrency(monthlyTotals.income)}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
        <Col md={4}>
          <GlassCard className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--expense-bg)',
                }}
              >
                <FiTrendingDown size={24} color="var(--expense-color)" />
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>
                  Despesas {periodFilter !== 'all' ? `(${periodFilter === 'period1' ? 'P1' : 'P2'})` : ''}
                </small>
                <h4 className="mb-0" style={{ color: 'var(--expense-color)' }}>
                  {formatCurrency(monthlyTotals.expense)}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
        <Col md={4}>
          <GlassCard className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '48px',
                  height: '48px',
                  background:
                    monthlyTotals.balance >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)',
                }}
              >
                <FiDollarSign
                  size={24}
                  color={
                    monthlyTotals.balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)'
                  }
                />
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>
                  Saldo {periodFilter !== 'all' ? `(${periodFilter === 'period1' ? 'P1' : 'P2'})` : ''}
                </small>
                <h4
                  className="mb-0"
                  style={{
                    color:
                      monthlyTotals.balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)',
                  }}
                >
                  {formatCurrency(monthlyTotals.balance)}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Filters */}
      <div
        className="p-3 rounded-3 mb-4"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <Row className="g-3">
          <Col md={periodEnabled ? 3 : 4}>
            <InputGroup>
              <InputGroup.Text style={inputStyle}>
                <FiSearch color="var(--text-muted)" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Buscar transação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, borderLeft: 'none' }}
              />
            </InputGroup>
          </Col>
          <Col md={periodEnabled ? 3 : 4}>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              style={inputStyle}
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </Form.Select>
          </Col>
          <Col md={periodEnabled ? 3 : 4}>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">Todas as categorias</option>
              {(categories || []).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Col>
          {periodEnabled && (
            <Col md={3}>
              <Form.Select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as 'all' | 'period1' | 'period2')}
                style={inputStyle}
              >
                <option value="all">Todos os períodos</option>
                <option value="period1">📅 Período 1 (Dia 1-{period1End})</option>
                <option value="period2">📅 Período 2 (Dia {period1End + 1}-fim)</option>
              </Form.Select>
            </Col>
          )}
        </Row>
      </div>

      {/* Transaction List */}
      <TransactionList
        search={search}
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        separateByType={typeFilter === 'all'}
        periodFilter={periodEnabled ? periodFilter : 'all'}
        period1End={period1End}
      />

      {/* FAB */}
      <FloatingActionButton
        icon={<FiPlus size={24} />}
        onClick={() => setShowForm(true)}
      />

      {/* Form Modal */}
      <TransactionForm show={showForm} onHide={() => setShowForm(false)} />
    </PageLayout>
  );
}
