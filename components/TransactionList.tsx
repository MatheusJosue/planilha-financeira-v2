'use client';

import { useState, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { FiEdit, FiTrash2, FiCheck, FiTrendingUp, FiTrendingDown, FiCopy, FiRepeat } from 'react-icons/fi';
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
}

export function TransactionList({
  search = '',
  typeFilter = 'all',
  categoryFilter = '',
  separateByType = false,
  periodFilter = 'all',
  period1End = 5,
}: TransactionListProps) {
  const {
    transactions,
    currentMonth,
    deleteTransaction,
    togglePaymentStatus,
    convertPredictedToReal,
    addTransaction,
  } = useFinanceStore();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Helper to get day from date string
  const getDayFromDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate();
  };

  // Filter by period helper
  const filterByPeriod = (t: { date: string }) => {
    if (periodFilter === 'all') return true;
    const day = getDayFromDate(t.date);
    if (periodFilter === 'period1') {
      return day <= period1End;
    } else {
      return day > period1End;
    }
  };

  const filteredTransactions = useMemo(() => {
    return (transactions || [])
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
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth, search, typeFilter, categoryFilter, periodFilter, period1End]);

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

  const handleConfirmPredicted = async (transaction: Transaction) => {
    const result = await showConfirm(
      'Confirmar transação?',
      `Deseja confirmar "${transaction.description}" como realizada?`
    );
    if (result.isConfirmed) {
      await convertPredictedToReal(transaction.id);
    }
  };

  const handleDuplicateToNextMonth = async (transaction: Transaction) => {
    const nextMonth = getNextMonth(currentMonth);
    const result = await showConfirm(
      'Duplicar para próximo mês?',
      `Deseja duplicar "${transaction.description}" para ${nextMonth}?`
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
      showSuccess(`Transação duplicada para ${nextMonth}!`);
    }
  };

  const renderTransaction = (transaction: Transaction) => (
    <div
      key={transaction.id}
      className={`
        p-3 rounded-3 transition-all
        ${transaction.is_predicted ? 'opacity-75' : ''}
      `}
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid var(--glass-border)`,
        borderLeft: `4px solid ${
          transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'
        }`,
        borderStyle: transaction.is_predicted ? 'dashed' : 'solid',
      }}
    >
      {/* Top Row: Icon + Info + Value (desktop) */}
      <div className="d-flex align-items-start gap-3">
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
        <div className="flex-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <p
              className="mb-0 fw-medium"
              style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}
            >
              {transaction.description}
            </p>
            {transaction.is_predicted && <StatusBadge status="predicted" />}
            {!transaction.is_predicted && transaction.is_paid && <StatusBadge status="paid" />}
            {!transaction.is_predicted && !transaction.is_paid && <StatusBadge status="pending" />}
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
          <div className="d-flex align-items-center gap-2 flex-wrap">
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
              variant="success"
              size="sm"
              onClick={() => handleConfirmPredicted(transaction)}
              tooltip="Confirmar"
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
          <IconButton
            icon={<FiRepeat size={16} />}
            variant="primary"
            size="sm"
            onClick={() => handleDuplicateToNextMonth(transaction)}
            tooltip="Duplicar p/ próximo mês"
          />
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
      <div className="d-flex d-md-none justify-content-between align-items-center mt-3 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <span
          className="fw-bold"
          style={{
            color: transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
            fontSize: '1.1rem',
          }}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.value)}
        </span>

        <div className="d-flex gap-1">
          {transaction.is_predicted ? (
            <IconButton
              icon={<FiCheck size={16} />}
              variant="success"
              size="sm"
              onClick={() => handleConfirmPredicted(transaction)}
              tooltip="Confirmar"
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
          <IconButton
            icon={<FiRepeat size={16} />}
            variant="primary"
            size="sm"
            onClick={() => handleDuplicateToNextMonth(transaction)}
            tooltip="Duplicar p/ próximo mês"
          />
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

  if (filteredTransactions.length === 0) {
    return (
      <GlassCard>
        <NoTransactionsEmpty onAdd={() => {}} />
      </GlassCard>
    );
  }

  if (separateByType && incomeTransactions.length > 0 && expenseTransactions.length > 0) {
    return (
      <>
        <Row>
          {/* Income Section */}
          <Col lg={6} className="mb-4">
            <div
              className="p-3 rounded-3 mb-3"
              style={{
                background: 'var(--income-bg)',
                borderLeft: '4px solid var(--income-color)',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiTrendingUp size={20} color="var(--income-color)" />
                <h5 className="mb-0" style={{ color: 'var(--income-color)' }}>
                  Receitas ({incomeTransactions.length})
                </h5>
              </div>
            </div>
            <div className="d-flex flex-column gap-3">
              {incomeTransactions.map(renderTransaction)}
            </div>
          </Col>

          {/* Expense Section */}
          <Col lg={6} className="mb-4">
            <div
              className="p-3 rounded-3 mb-3"
              style={{
                background: 'var(--expense-bg)',
                borderLeft: '4px solid var(--expense-color)',
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FiTrendingDown size={20} color="var(--expense-color)" />
                <h5 className="mb-0" style={{ color: 'var(--expense-color)' }}>
                  Despesas ({expenseTransactions.length})
                </h5>
              </div>
            </div>
            <div className="d-flex flex-column gap-3">
              {expenseTransactions.map(renderTransaction)}
            </div>
          </Col>
        </Row>

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
