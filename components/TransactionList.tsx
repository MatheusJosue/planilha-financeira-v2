'use client';

import { useState, useMemo, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiCheck, FiTrendingUp, FiTrendingDown, FiRepeat } from 'react-icons/fi';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, getNextMonth } from '@/utils/formatDate';
import { GlassCard } from '@/components/ui/GlassCard';
import { IconButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/Badge';
import { NoTransactionsEmpty } from '@/components/ui/EmptyState';
import { TransactionForm } from '@/components/TransactionForm';
import { showDeleteConfirm, showConfirm, showSuccess } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS, type Transaction } from '@/types';

interface TransactionListProps {
  search?: string;
  typeFilter?: 'all' | 'income' | 'expense';
  categoryFilter?: string;
  separateByType?: boolean;
  periodFilter?: 'all' | 'period1' | 'period2';
  period1End?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'type' | 'recurring' | 'non_recurring';
}

export function TransactionList({
  search = '',
  typeFilter = 'all',
  categoryFilter = '',
  separateByType = false,
  periodFilter = 'all',
  period1End = 5,
  sortBy = 'date_desc',
}: TransactionListProps) {
  const {
    transactions,
    recurringTransactions,
    currentMonth,
    deleteTransaction,
    togglePaymentStatus,
    convertPredictedToReal,
    addTransaction,
  } = useFinanceStore();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Helper to get day from date string
  const getDayFromDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate();
  };

  // Filter by period helper
  const filterByPeriod = useCallback((t: { date: string }) => {
    if (periodFilter === 'all') return true;
    const day = getDayFromDate(t.date);
    if (periodFilter === 'period1') {
      return day <= period1End;
    } else {
      return day > period1End;
    }
  }, [periodFilter, period1End]);

  const formatDuplicateMonth = (month: string) => {
    const [year, monthNumber] = month.split('-');
    return year && monthNumber ? `${monthNumber}/${year}` : month;
  };

  const isRecurringTransaction = useCallback((transaction: Transaction) => {
    if (transaction.recurring_id || transaction.is_predicted) {
      return true;
    }

    const transactionDay = new Date(`${transaction.date}T00:00:00`).getDate();

    return recurringTransactions.some(
      (recurring) =>
        recurring.is_active &&
        recurring.description === transaction.description &&
        recurring.type === transaction.type &&
        recurring.category === transaction.category &&
        recurring.day_of_month === transactionDay
    );
  }, [recurringTransactions]);

  const filteredTransactions = useMemo(() => {
    const result = (transactions || [])
      .filter((t) => t.month === currentMonth)
      .filter((t) => {
        if (search) {
          const searchLower = search.toLowerCase();
          if (
            !t.description.toLowerCase().includes(searchLower) &&
            !t.category.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }
        if (typeFilter !== 'all' && t.type !== typeFilter) {
          return false;
        }
        if (categoryFilter && t.category !== categoryFilter) {
          return false;
        }
        // Period filter
        if (!filterByPeriod(t)) {
          return false;
        }
        return true;
      });

    return result.sort((a, b) => {
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'type') return a.type.localeCompare(b.type) || new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'recurring' || sortBy === 'non_recurring') {
        const aRecurring = isRecurringTransaction(a) ? 1 : 0;
        const bRecurring = isRecurringTransaction(b) ? 1 : 0;
        const direction = sortBy === 'recurring' ? -1 : 1;
        return (aRecurring - bRecurring) * direction || new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [transactions, currentMonth, search, typeFilter, categoryFilter, filterByPeriod, sortBy, isRecurringTransaction]);

  const incomeTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'income'),
    [filteredTransactions]
  );

  const expenseTransactions = useMemo(
    () => filteredTransactions.filter((t) => t.type === 'expense'),
    [filteredTransactions]
  );

  const handleDelete = async (transaction: Transaction) => {
    const result = await showDeleteConfirm(transaction.description);
    if (result.isConfirmed) {
      await deleteTransaction(transaction.id, transaction.is_predicted);
    }
  };

  const handleMarkPredictedAsPaid = async (transaction: Transaction) => {
    await convertPredictedToReal(transaction.id);
  };

  const handleDuplicateToNextMonth = async (transaction: Transaction) => {
    if (isRecurringTransaction(transaction)) return;

    const nextMonth = getNextMonth(currentMonth);
    const formattedNextMonth = formatDuplicateMonth(nextMonth);
    const result = await showConfirm(
      'Duplicar para próximo mês?',
      `Deseja duplicar "${transaction.description}" para ${formattedNextMonth}?`
    );
    if (result.isConfirmed) {
      // Calculate new date in next month
      const originalDate = new Date(transaction.date);
      const day = originalDate.getDate();
      const [year, month] = nextMonth.split('-').map(Number);
      const newDate = new Date(year, month - 1, Math.min(day, 28)); // Use day 28 max to avoid issues

      await addTransaction({
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        value: transaction.value,
        date: newDate.toISOString().split('T')[0],
      });
      showSuccess(`Transação duplicada para ${formattedNextMonth}!`);
    }
  };

  const renderTransaction = (transaction: Transaction) => {
    const recurring = isRecurringTransaction(transaction);
    const canDuplicate = !recurring;

    return (
    <div
      key={transaction.id}
      className={`
        transaction-row p-3 rounded-3 transition-all
      `}
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid var(--glass-border)`,
        borderLeft: `4px solid ${
          transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'
        }`,
        borderStyle: 'solid',
      }}
    >
      {/* Top Row: Icon + Info + Value (desktop) */}
      <div className="transaction-card-main d-flex align-items-start gap-3">
        {/* Icon - hidden on mobile */}
        <div
          className="d-none d-sm-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
          style={{
            width: '44px',
            height: '44px',
            background: transaction.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
          }}
        >
          {transaction.type === 'income' ? (
            <FiTrendingUp size={20} color="var(--income-color)" />
          ) : (
            <FiTrendingDown size={20} color="var(--expense-color)" />
          )}
        </div>

        {/* Info */}
        <div className="transaction-card-info flex-1 min-w-0">
          <div className="transaction-card-title d-flex align-items-center gap-2 flex-wrap mb-1">
            <p
              className="mb-0 fw-medium"
              style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}
            >
              {transaction.description}
            </p>
            {transaction.is_predicted && <StatusBadge status="pending" />}
            {!transaction.is_predicted && transaction.is_paid && <StatusBadge status="paid" />}
            {!transaction.is_predicted && !transaction.is_paid && <StatusBadge status="pending" />}
            {recurring && <span className="transaction-recurring-tag"><FiRepeat size={11} /> Recorrente</span>}
            {transaction.total_installments && (
              <span
                className="badge"
                style={{
                  background: 'var(--glass-bg)',
                  color: 'var(--text-muted)',
                  fontSize: '0.7rem',
                }}
              >
                {transaction.current_installment}/{transaction.total_installments}
              </span>
            )}
          </div>
          <div className="transaction-card-meta d-flex align-items-center gap-2 flex-wrap">
            <small style={{ color: 'var(--text-muted)' }}>
              {CATEGORY_EMOJIS[transaction.category] || '📦'} {transaction.category}
            </small>
            <small style={{ color: 'var(--text-hint)' }}>•</small>
            <small style={{ color: 'var(--text-hint)' }}>{formatDate(transaction.date)}</small>
          </div>
        </div>

        {/* Value - hidden on mobile, shown on desktop */}
        <span
          className="fw-bold flex-shrink-0 d-none d-md-block"
          style={{
            color: transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
            fontSize: '1.1rem',
          }}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.value)}
        </span>

        {/* Actions - hidden on mobile, shown on desktop */}
        <div className="d-none d-md-flex gap-1 flex-shrink-0">
          {transaction.is_predicted ? (
            <IconButton
              icon={<FiCheck size={16} />}
              variant="glass"
              size="sm"
              onClick={() => handleMarkPredictedAsPaid(transaction)}
              tooltip="Marcar pago"
            />
          ) : (
            <>
              <IconButton
                icon={<FiCheck size={16} />}
                variant={transaction.is_paid ? 'success' : 'glass'}
                size="sm"
                onClick={() => togglePaymentStatus(transaction.id)}
                tooltip={transaction.is_paid ? 'Marcar pendente' : 'Marcar pago'}
              />
              <IconButton
                icon={<FiEdit size={16} />}
                variant="glass"
                size="sm"
                onClick={() => setEditingTransaction(transaction)}
                tooltip="Editar"
              />
            </>
          )}
          {canDuplicate && (
            <IconButton
              icon={<FiRepeat size={16} />}
              variant="primary"
              size="sm"
              onClick={() => handleDuplicateToNextMonth(transaction)}
              tooltip="Duplicar p/ próximo mês"
            />
          )}
          <IconButton
            icon={<FiTrash2 size={16} />}
            variant="danger"
            size="sm"
            onClick={() => handleDelete(transaction)}
            tooltip="Excluir"
          />
        </div>
      </div>

      {/* Bottom Row: Value + Actions (mobile only) */}
      <div className="transaction-card-mobile-footer d-flex d-md-none justify-content-between align-items-center mt-3 pt-2">
        <span
          className="transaction-card-mobile-value fw-bold"
          style={{
            color: transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
            fontSize: '1.1rem',
          }}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.value)}
        </span>

        <div className="transaction-card-mobile-actions d-flex gap-1">
          {transaction.is_predicted ? (
            <IconButton
              icon={<FiCheck size={16} />}
              variant="glass"
              size="sm"
              onClick={() => handleMarkPredictedAsPaid(transaction)}
              tooltip="Marcar pago"
            />
          ) : (
            <>
              <IconButton
                icon={<FiCheck size={16} />}
                variant={transaction.is_paid ? 'success' : 'glass'}
                size="sm"
                onClick={() => togglePaymentStatus(transaction.id)}
                tooltip={transaction.is_paid ? 'Marcar pendente' : 'Marcar pago'}
              />
              <IconButton
                icon={<FiEdit size={16} />}
                variant="glass"
                size="sm"
                onClick={() => setEditingTransaction(transaction)}
                tooltip="Editar"
              />
            </>
          )}
          {canDuplicate && (
            <IconButton
              icon={<FiRepeat size={16} />}
              variant="primary"
              size="sm"
              onClick={() => handleDuplicateToNextMonth(transaction)}
              tooltip="Duplicar p/ próximo mês"
            />
          )}
          <IconButton
            icon={<FiTrash2 size={16} />}
            variant="danger"
            size="sm"
            onClick={() => handleDelete(transaction)}
            tooltip="Excluir"
          />
        </div>
      </div>
    </div>
  );
  };

  if (filteredTransactions.length === 0) {
    return (
      <GlassCard>
        <NoTransactionsEmpty onAdd={() => setShowAddForm(true)} />
        <TransactionForm show={showAddForm} onHide={() => setShowAddForm(false)} />
      </GlassCard>
    );
  }

  if (separateByType) {
    return (
      <>
        {incomeTransactions.length > 0 && <section className="transaction-group transaction-income-group">
          <div className="transaction-group-heading">
            <div><FiTrendingUp /><span>Receitas</span></div>
            <small>{incomeTransactions.length} {incomeTransactions.length === 1 ? 'lançamento' : 'lançamentos'}</small>
          </div>
          <Row className="g-2 transaction-card-grid transaction-income-grid">
            {incomeTransactions.map((transaction) => (
              <Col xs={12} sm={6} xl={4} xxl={3} key={transaction.id}>
                {renderTransaction(transaction)}
              </Col>
            ))}
          </Row>
        </section>}

        {expenseTransactions.length > 0 && <section className="transaction-group transaction-expense-group">
          <div className="transaction-group-heading">
            <div><FiTrendingDown /><span>Despesas</span></div>
            <small>{expenseTransactions.length} {expenseTransactions.length === 1 ? 'lançamento' : 'lançamentos'}</small>
          </div>
          <Row className="g-2 transaction-card-grid transaction-expense-grid">
            {expenseTransactions.map((transaction) => (
              <Col xs={12} sm={6} xl={4} xxl={3} key={transaction.id}>
                {renderTransaction(transaction)}
              </Col>
            ))}
          </Row>
        </section>}

        {/* Edit Modal */}
        <TransactionForm
          show={!!editingTransaction}
          onHide={() => setEditingTransaction(null)}
          transaction={editingTransaction}
        />
      </>
    );
  }

  return (
    <>
      <div className="d-flex flex-column gap-3">
        {filteredTransactions.map(renderTransaction)}
      </div>

      {/* Edit Modal */}
      <TransactionForm
        show={!!editingTransaction}
        onHide={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />
    </>
  );
}

export default TransactionList;
