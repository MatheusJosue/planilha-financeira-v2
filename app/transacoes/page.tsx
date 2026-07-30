'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { FiArrowDownRight, FiArrowUpRight, FiCopy, FiDollarSign, FiPlus, FiSearch } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionList } from '@/components/TransactionList';
import { TransactionForm } from '@/components/TransactionForm';
import { FloatingActionButton, GlassButton } from '@/components/ui/GlassButton';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatMonth, getNextMonth } from '@/utils/formatDate';
import { showConfirm, showInfo } from '@/lib/sweetalert';

type TransactionTypeFilter = 'all' | 'income' | 'expense';
type PeriodFilter = 'all' | 'period1' | 'period2';
type TransactionSort = 'date_desc' | 'date_asc' | 'type' | 'recurring' | 'non_recurring';

export default function TransacoesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [sortBy, setSortBy] = useState<TransactionSort>('date_desc');
  const [duplicating, setDuplicating] = useState(false);
  const {
    categories,
    transactions,
    recurringTransactions,
    currentMonth,
    userSettings,
    loadUserSettings,
    duplicateNonRecurringTransactionsToNextMonth,
  } = useFinanceStore();

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  const periodEnabled = userSettings?.period_separation_enabled || false;
  const period1End = userSettings?.period_1_end || 5;

  const filterByPeriod = useCallback((date: string) => {
    if (!periodEnabled || periodFilter === 'all') return true;
    const day = new Date(`${date}T00:00:00`).getDate();
    return periodFilter === 'period1' ? day <= period1End : day > period1End;
  }, [periodEnabled, periodFilter, period1End]);

  const monthlyTotals = useMemo(() => {
    const selectedTransactions = transactions.filter(
      (transaction) => transaction.month === currentMonth && filterByPeriod(transaction.date)
    );
    const income = selectedTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.value, 0);
    const expense = selectedTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    return { income, expense, balance: income - expense, count: selectedTransactions.length };
  }, [transactions, currentMonth, filterByPeriod]);

  const periodLabel = periodFilter === 'period1'
    ? `Dias 1–${period1End}`
    : periodFilter === 'period2'
      ? `Dias ${period1End + 1}–fim`
      : 'Mês completo';

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  const handleDuplicateMonth = async () => {
    const eligibleTransactions = transactions.filter((transaction) => {
      if (transaction.month !== currentMonth || transaction.is_predicted || transaction.recurring_id) return false;
      const day = new Date(`${transaction.date}T00:00:00`).getDate();
      return !recurringTransactions.some((recurring) =>
        recurring.description === transaction.description &&
        recurring.type === transaction.type &&
        recurring.category === transaction.category &&
        recurring.day_of_month === day
      );
    });

    if (eligibleTransactions.length === 0) {
      await showInfo('Nada para duplicar', 'Não há transações não recorrentes neste mês.');
      return;
    }

    const nextMonth = getNextMonth(currentMonth);
    const result = await showConfirm(
      `Duplicar ${eligibleTransactions.length} transações?`,
      `Receitas e despesas não recorrentes serão copiadas para ${formatMonth(nextMonth)} como pendentes.`,
      'Duplicar mês'
    );
    if (!result.isConfirmed) return;

    setDuplicating(true);
    try {
      await duplicateNonRecurringTransactionsToNextMonth();
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <PageLayout className="transactions-page">
      <section className="dashboard-hero transactions-hero mb-4">
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">Movimentações</span>
          <h1>Transações</h1>
          <p>Registre, acompanhe e organize tudo que entra e sai da sua conta.</p>
        </div>
        <div className="dashboard-hero-actions">
          <div className="dashboard-month-selector"><MonthSelector /></div>
          <GlassButton variant="glass" icon={<FiCopy />} onClick={handleDuplicateMonth} loading={duplicating}>
            Duplicar mês
          </GlassButton>
          <GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>
            Nova transação
          </GlassButton>
        </div>
        <div className="dashboard-hero-orb dashboard-hero-orb-one" />
        <div className="dashboard-hero-orb dashboard-hero-orb-two" />
      </section>

      <section className="financial-pulse transactions-pulse mb-4">
        <div className="financial-pulse-main">
          <div className="financial-pulse-icon"><FiDollarSign /></div>
          <div>
            <span className="financial-pulse-label">Saldo · {periodLabel}</span>
            <strong className={monthlyTotals.balance >= 0 ? 'is-positive' : 'is-negative'}>
              {formatCurrency(monthlyTotals.balance)}
            </strong>
            <small>{monthlyTotals.count} {monthlyTotals.count === 1 ? 'movimentação' : 'movimentações'} no período</small>
          </div>
        </div>
        <div className="financial-pulse-details transactions-pulse-details">
          <div className="financial-flow-item income">
            <div className="financial-flow-icon"><FiArrowDownRight /></div>
            <div><span>Entradas</span><strong>{formatCurrency(monthlyTotals.income)}</strong></div>
          </div>
          <div className="financial-flow-item expense">
            <div className="financial-flow-icon"><FiArrowUpRight /></div>
            <div><span>Saídas</span><strong>{formatCurrency(monthlyTotals.expense)}</strong></div>
          </div>
        </div>
      </section>

      <section className="transactions-workspace">
        <div className="transactions-toolbar">
          <div className="transactions-toolbar-heading">
            <span>Histórico</span>
            <strong>Todos os lançamentos</strong>
          </div>
          <Row className="g-2 transactions-filters">
            <Col xs={12} lg>
              <InputGroup>
                <InputGroup.Text style={inputStyle}><FiSearch color="var(--text-muted)" /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por descrição ou categoria"
                  aria-label="Buscar transação"
                  className="input-glass"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ ...inputStyle, borderLeft: 'none' }}
                />
              </InputGroup>
            </Col>
            <Col xs={6} lg="auto">
              <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TransactionTypeFilter)} style={inputStyle}>
                <option value="all">Todos os tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </Form.Select>
            </Col>
            <Col xs={6} lg="auto">
              <Form.Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={inputStyle}>
                <option value="">Categorias</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </Form.Select>
            </Col>
            {periodEnabled && (
              <Col xs={12} lg="auto">
                <Form.Select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)} style={inputStyle}>
                  <option value="all">Mês completo</option>
                  <option value="period1">Dias 1–{period1End}</option>
                  <option value="period2">Dias {period1End + 1}–fim</option>
                </Form.Select>
              </Col>
            )}
            <Col xs={12} lg="auto">
              <Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value as TransactionSort)} style={inputStyle}>
                <option value="date_desc">Mais recentes</option>
                <option value="date_asc">Mais antigas</option>
                <option value="type">Por tipo</option>
                <option value="recurring">Recorrentes primeiro</option>
                <option value="non_recurring">Não recorrentes primeiro</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        <TransactionList
          search={search}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          separateByType
          sortBy={sortBy}
          periodFilter={periodEnabled ? periodFilter : 'all'}
          period1End={period1End}
        />
      </section>

      <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => setShowForm(true)} />
      <TransactionForm show={showForm} onHide={() => setShowForm(false)} />
    </PageLayout>
  );
}
