'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import {
  FiAlertTriangle,
  FiArrowDownRight,
  FiArrowUpRight,
  FiCalendar,
  FiEdit,
  FiPause,
  FiPlay,
  FiPlus,
  FiRepeat,
  FiTrash2,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton, IconButton } from '@/components/ui/GlassButton';
import { RecurringTransactionForm } from '@/components/RecurringTransactionForm';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { showDeleteConfirm, showConfirm } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS, type RecurringTransaction } from '@/types';

type TypeFilter = 'all' | 'income' | 'expense';
type StatusFilter = 'all' | 'active' | 'paused';
type NecessityFilter = 'all' | 'essential' | 'non_essential';
type SortOption = 'day' | 'value_desc' | 'value_asc' | 'active';

export default function RecorrentesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [necessityFilter, setNecessityFilter] = useState<NecessityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('day');
  const { recurringTransactions, loadRecurringTransactions, deleteRecurringTransaction, updateRecurringTransaction } = useFinanceStore();

  useEffect(() => {
    loadRecurringTransactions();
  }, [loadRecurringTransactions]);

  const hasEnded = useCallback((recurring: RecurringTransaction) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (recurring.end_date) {
      const endDate = new Date(`${recurring.end_date}T23:59:59`);
      if (endDate < today) return true;
    }

    if (recurring.recurrence_type === 'installment' && recurring.total_installments) {
      const startDate = new Date(`${recurring.start_date}T00:00:00`);
      const lastInstallment = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + recurring.total_installments - 1,
        1
      );
      const lastDayOfMonth = new Date(
        lastInstallment.getFullYear(),
        lastInstallment.getMonth() + 1,
        0
      ).getDate();
      lastInstallment.setDate(Math.min(recurring.day_of_month, lastDayOfMonth));
      if (lastInstallment < today) return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const endedActiveExpenses = recurringTransactions.filter(
      (recurring) => recurring.type === 'expense' && recurring.is_active && hasEnded(recurring)
    );

    endedActiveExpenses.forEach((recurring) => {
      void updateRecurringTransaction(recurring.id, { is_active: false });
    });
  }, [recurringTransactions, hasEnded, updateRecurringTransaction]);

  const handleDelete = async (recurring: RecurringTransaction) => {
    const result = await showDeleteConfirm(recurring.description);
    if (result.isConfirmed) await deleteRecurringTransaction(recurring.id);
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    const result = await showConfirm(
      `${recurring.is_active ? 'Pausar' : 'Ativar'} recorrência?`,
      `Deseja ${recurring.is_active ? 'pausar' : 'ativar'} "${recurring.description}"?`
    );
    if (result.isConfirmed) {
      await updateRecurringTransaction(recurring.id, { is_active: !recurring.is_active });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecurring(null);
  };

  const filteredRecurrings = useMemo(() => {
    return recurringTransactions
      .filter((recurring) => typeFilter === 'all' || recurring.type === typeFilter)
      .filter((recurring) => {
        const effectivelyActive = recurring.is_active && !hasEnded(recurring);
        return statusFilter === 'all' || (statusFilter === 'active' ? effectivelyActive : !effectivelyActive);
      })
      .filter((recurring) => necessityFilter === 'all' || recurring.type === 'income' || (necessityFilter === 'essential' ? recurring.is_essential : !recurring.is_essential))
      .sort((a, b) => {
        if (sortBy === 'value_desc') return b.value - a.value;
        if (sortBy === 'value_asc') return a.value - b.value;
        if (sortBy === 'active') return Number(b.is_active) - Number(a.is_active) || a.day_of_month - b.day_of_month;
        return a.day_of_month - b.day_of_month;
      });
  }, [recurringTransactions, typeFilter, statusFilter, necessityFilter, sortBy, hasEnded]);

  const incomeRecurrings = filteredRecurrings.filter((recurring) => recurring.type === 'income');
  const expenseRecurrings = filteredRecurrings.filter((recurring) => recurring.type === 'expense');
  const activeExpenseRecurrings = expenseRecurrings.filter((recurring) => recurring.is_active && !hasEnded(recurring));
  const endedExpenseRecurrings = expenseRecurrings.filter((recurring) => hasEnded(recurring));
  const pausedExpenseRecurrings = expenseRecurrings.filter((recurring) => !recurring.is_active && !hasEnded(recurring));
  const activeRecurrings = recurringTransactions.filter((recurring) => recurring.is_active && !hasEnded(recurring));
  const monthlyIncome = activeRecurrings.filter((recurring) => recurring.type === 'income').reduce((sum, recurring) => sum + recurring.value, 0);
  const monthlyExpense = activeRecurrings.filter((recurring) => recurring.type === 'expense').reduce((sum, recurring) => sum + recurring.value, 0);
  const nonEssentialTotal = activeRecurrings
    .filter((recurring) => recurring.type === 'expense' && !recurring.is_essential)
    .reduce((sum, recurring) => sum + recurring.value, 0);

  const recurrenceLabel = (type: RecurringTransaction['recurrence_type']) => ({
    fixed: 'Fixo',
    installment: 'Parcelado',
    variable: 'Variável',
    variable_by_income: '% da renda',
  }[type] || type);

  const renderRecurring = (recurring: RecurringTransaction) => {
    const ended = hasEnded(recurring);
    return (
    <div className={`recurring-card ${recurring.type} ${!recurring.is_active ? 'is-paused' : ''} ${ended ? 'is-ended' : ''}`}>
      <div className="recurring-card-top">
        <div className="recurring-card-icon">
          {recurring.type === 'income' ? <FiTrendingUp /> : <FiTrendingDown />}
        </div>
        <div className="recurring-card-copy">
          <div className="recurring-card-title">
            <strong>{recurring.description}</strong>
            {!recurring.is_active && !ended && <span className="recurring-tag paused">Pausado</span>}
            {ended && <span className="recurring-tag ended">Encerrado</span>}
            {recurring.type === 'expense' && !recurring.is_essential && <span className="recurring-tag warning">Supérfluo</span>}
          </div>
          <div className="recurring-card-meta">
            <span>{CATEGORY_EMOJIS[recurring.category] || '📦'} {recurring.category}</span>
            <i />
            <span><FiCalendar /> Dia {recurring.day_of_month}</span>
            <i />
            <span>{recurrenceLabel(recurring.recurrence_type)}</span>
          </div>
        </div>
        <strong className="recurring-card-value">
          {recurring.type === 'income' ? '+' : '−'} {formatCurrency(recurring.value)}
        </strong>
      </div>
      <div className="recurring-card-actions">
        <IconButton icon={recurring.is_active ? <FiPause size={14} /> : <FiPlay size={14} />} variant="glass" size="sm" onClick={() => handleToggleActive(recurring)} tooltip={recurring.is_active ? 'Pausar' : 'Ativar'} />
        <IconButton icon={<FiEdit size={14} />} variant="glass" size="sm" onClick={() => { setEditingRecurring(recurring); setShowForm(true); }} tooltip="Editar" />
        <IconButton icon={<FiTrash2 size={14} />} variant="danger" size="sm" onClick={() => handleDelete(recurring)} tooltip="Excluir" />
      </div>
    </div>
  );
  };

  const inputStyle: React.CSSProperties = { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' };

  return (
    <PageLayout className="recurrings-page">
      <section className="dashboard-hero recurrings-hero mb-4">
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">Automação financeira</span>
          <h1>Recorrências</h1>
          <p>Organize compromissos fixos e antecipe o impacto de cada mês.</p>
        </div>
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>Nova recorrência</GlassButton>
        <div className="dashboard-hero-orb dashboard-hero-orb-one" />
        <div className="dashboard-hero-orb dashboard-hero-orb-two" />
      </section>

      <section className="financial-pulse recurrings-pulse mb-4">
        <div className="financial-pulse-main">
          <div className="financial-pulse-icon"><FiRepeat /></div>
          <div>
            <span className="financial-pulse-label">Impacto mensal recorrente</span>
            <strong className={monthlyIncome - monthlyExpense >= 0 ? 'is-positive' : 'is-negative'}>{formatCurrency(monthlyIncome - monthlyExpense)}</strong>
            <small>{activeRecurrings.length} de {recurringTransactions.length} recorrências ativas</small>
          </div>
        </div>
        <div className="financial-pulse-details recurrings-pulse-details">
          <div className="financial-flow-item income"><div className="financial-flow-icon"><FiArrowDownRight /></div><div><span>Receitas</span><strong>{formatCurrency(monthlyIncome)}</strong></div></div>
          <div className="financial-flow-item expense"><div className="financial-flow-icon"><FiArrowUpRight /></div><div><span>Despesas</span><strong>{formatCurrency(monthlyExpense)}</strong></div></div>
          <div className="financial-flow-item warning"><div className="financial-flow-icon"><FiAlertTriangle /></div><div><span>Supérfluos</span><strong>{formatCurrency(nonEssentialTotal)}</strong></div></div>
        </div>
      </section>

      <section className="recurrings-workspace">
        <div className="recurrings-toolbar">
          <div className="transactions-toolbar-heading"><span>Organização</span><strong>Todos os compromissos</strong></div>
          <Row className="g-2 recurrings-filters">
            <Col xs={6} lg="auto"><Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)} style={inputStyle}><option value="all">Entradas e saídas</option><option value="income">Receitas</option><option value="expense">Despesas</option></Form.Select></Col>
            <Col xs={6} lg="auto"><Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} style={inputStyle}><option value="all">Todos os status</option><option value="active">Ativos</option><option value="paused">Pausados</option></Form.Select></Col>
            <Col xs={6} lg="auto"><Form.Select value={necessityFilter} onChange={(event) => setNecessityFilter(event.target.value as NecessityFilter)} style={inputStyle}><option value="all">Toda necessidade</option><option value="essential">Essenciais</option><option value="non_essential">Supérfluos</option></Form.Select></Col>
            <Col xs={6} lg="auto"><Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} style={inputStyle}><option value="day">Ordenar por dia</option><option value="value_desc">Maior valor</option><option value="value_asc">Menor valor</option><option value="active">Ativos primeiro</option></Form.Select></Col>
          </Row>
        </div>

        {filteredRecurrings.length === 0 ? (
          <GlassCard className="text-center p-5"><FiRepeat size={40} color="var(--text-muted)" className="mb-3" /><h5>Nenhuma recorrência encontrada</h5><p style={{ color: 'var(--text-muted)' }}>Ajuste os filtros ou crie uma nova recorrência.</p><GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>Criar recorrência</GlassButton></GlassCard>
        ) : (
          <>
            {incomeRecurrings.length > 0 && <section className="recurring-group income"><div className="transaction-group-heading"><div><FiTrendingUp /><span>Receitas recorrentes</span></div><small>{incomeRecurrings.length}</small></div><Row className="g-2 recurring-card-grid">{incomeRecurrings.map((recurring) => <Col xs={12} sm={6} xl={4} xxl={3} key={recurring.id}>{renderRecurring(recurring)}</Col>)}</Row></section>}
            {activeExpenseRecurrings.length > 0 && <section className="recurring-group expense"><div className="transaction-group-heading"><div><FiTrendingDown /><span>Despesas ativas</span></div><small>{activeExpenseRecurrings.length}</small></div><Row className="g-2 recurring-card-grid">{activeExpenseRecurrings.map((recurring) => <Col xs={12} sm={6} xl={4} xxl={3} key={recurring.id}>{renderRecurring(recurring)}</Col>)}</Row></section>}
            {pausedExpenseRecurrings.length > 0 && <section className="recurring-group paused"><div className="transaction-group-heading"><div><FiPause /><span>Despesas pausadas</span></div><small>{pausedExpenseRecurrings.length}</small></div><Row className="g-2 recurring-card-grid">{pausedExpenseRecurrings.map((recurring) => <Col xs={12} sm={6} xl={4} xxl={3} key={recurring.id}>{renderRecurring(recurring)}</Col>)}</Row></section>}
            {endedExpenseRecurrings.length > 0 && <section className="recurring-group ended"><div className="transaction-group-heading"><div><FiCalendar /><span>Despesas encerradas</span></div><small>{endedExpenseRecurrings.length}</small></div><Row className="g-2 recurring-card-grid">{endedExpenseRecurrings.map((recurring) => <Col xs={12} sm={6} xl={4} xxl={3} key={recurring.id}>{renderRecurring(recurring)}</Col>)}</Row></section>}
          </>
        )}
      </section>

      <RecurringTransactionForm show={showForm} onHide={closeForm} recurring={editingRecurring} />
    </PageLayout>
  );
}
