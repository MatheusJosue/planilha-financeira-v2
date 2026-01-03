'use client';

import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRepeat,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiPause,
  FiPlay,
} from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton, IconButton } from '@/components/ui/GlassButton';
import { StatusBadge } from '@/components/ui/Badge';
import { RecurringTransactionForm } from '@/components/RecurringTransactionForm';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { showDeleteConfirm, showConfirm } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS, type RecurringTransaction } from '@/types';

export default function RecorrentesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  const {
    recurringTransactions,
    loadRecurringTransactions,
    deleteRecurringTransaction,
    updateRecurringTransaction,
  } = useFinanceStore();

  useEffect(() => {
    loadRecurringTransactions();
  }, [loadRecurringTransactions]);

  const handleDelete = async (recurring: RecurringTransaction) => {
    const result = await showDeleteConfirm(recurring.description);
    if (result.isConfirmed) {
      await deleteRecurringTransaction(recurring.id);
    }
  };

  const handleToggleActive = async (recurring: RecurringTransaction) => {
    const action = recurring.is_active ? 'pausar' : 'ativar';
    const result = await showConfirm(
      `${recurring.is_active ? 'Pausar' : 'Ativar'} recorrência?`,
      `Deseja ${action} "${recurring.description}"?`
    );
    if (result.isConfirmed) {
      await updateRecurringTransaction(recurring.id, { is_active: !recurring.is_active });
    }
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecurring(null);
  };

  const getRecurrenceLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixed: 'Valor Fixo',
      installment: 'Parcelado',
      variable: 'Variável',
      variable_by_income: 'Variável (% da renda)',
    };
    return labels[type] || type;
  };

  const incomeRecurrings = recurringTransactions.filter((r) => r.type === 'income');
  const expenseRecurrings = recurringTransactions.filter((r) => r.type === 'expense');

  const totalMonthlyIncome = incomeRecurrings
    .filter((r) => r.is_active)
    .reduce((sum, r) => sum + r.value, 0);

  const totalMonthlyExpense = expenseRecurrings
    .filter((r) => r.is_active)
    .reduce((sum, r) => sum + r.value, 0);

  const renderRecurring = (recurring: RecurringTransaction) => (
    <div
      key={recurring.id}
      className="p-3 rounded-3 mb-2"
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid var(--glass-border)`,
        borderLeft: `4px solid ${recurring.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}`,
        opacity: recurring.is_active ? 1 : 0.6,
      }}
    >
      {/* Top Row */}
      <div className="d-flex align-items-start gap-3">
        {/* Icon */}
        <div
          className="d-none d-sm-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
          style={{
            width: '44px',
            height: '44px',
            background: recurring.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
          }}
        >
          {recurring.type === 'income' ? (
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
              {recurring.description}
            </p>
            {!recurring.is_active && (
              <span
                className="badge"
                style={{ background: 'var(--text-muted)', color: 'white', fontSize: '0.7rem' }}
              >
                Pausado
              </span>
            )}
            {recurring.recurrence_type === 'installment' && recurring.total_installments && (
              <span
                className="badge"
                style={{ background: 'var(--glass-bg)', color: 'var(--text-muted)', fontSize: '0.7rem' }}
              >
                {recurring.total_installments}x
              </span>
            )}
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <small style={{ color: 'var(--text-muted)' }}>
              {CATEGORY_EMOJIS[recurring.category] || '📦'} {recurring.category}
            </small>
            <small style={{ color: 'var(--text-hint)' }}>•</small>
            <small className="d-inline-flex align-items-center" style={{ color: 'var(--text-hint)' }}>
              <FiCalendar size={12} className="me-1" />
              Dia {recurring.day_of_month}
            </small>
            <small style={{ color: 'var(--text-hint)' }}>•</small>
            <small style={{ color: 'var(--text-hint)' }}>
              {getRecurrenceLabel(recurring.recurrence_type)}
            </small>
          </div>
        </div>

        {/* Value - desktop */}
        <span
          className="fw-bold flex-shrink-0 d-none d-md-block"
          style={{
            color: recurring.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
            fontSize: '1.1rem',
          }}
        >
          {recurring.type === 'income' ? '+' : '-'}
          {formatCurrency(recurring.value)}
        </span>

        {/* Actions - desktop */}
        <div className="d-none d-md-flex gap-1 flex-shrink-0">
          <IconButton
            icon={recurring.is_active ? <FiPause size={16} /> : <FiPlay size={16} />}
            variant="glass"
            size="sm"
            onClick={() => handleToggleActive(recurring)}
            tooltip={recurring.is_active ? 'Pausar' : 'Ativar'}
          />
          <IconButton
            icon={<FiEdit size={16} />}
            variant="glass"
            size="sm"
            onClick={() => handleEdit(recurring)}
            tooltip="Editar"
          />
          <IconButton
            icon={<FiTrash2 size={16} />}
            variant="danger"
            size="sm"
            onClick={() => handleDelete(recurring)}
            tooltip="Excluir"
          />
        </div>
      </div>

      {/* Bottom Row - mobile */}
      <div
        className="d-flex d-md-none justify-content-between align-items-center mt-3 pt-2"
        style={{ borderTop: '1px solid var(--glass-border)' }}
      >
        <span
          className="fw-bold"
          style={{
            color: recurring.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
            fontSize: '1.1rem',
          }}
        >
          {recurring.type === 'income' ? '+' : '-'}
          {formatCurrency(recurring.value)}
        </span>

        <div className="d-flex gap-1">
          <IconButton
            icon={recurring.is_active ? <FiPause size={16} /> : <FiPlay size={16} />}
            variant="glass"
            size="sm"
            onClick={() => handleToggleActive(recurring)}
            tooltip={recurring.is_active ? 'Pausar' : 'Ativar'}
          />
          <IconButton
            icon={<FiEdit size={16} />}
            variant="glass"
            size="sm"
            onClick={() => handleEdit(recurring)}
            tooltip="Editar"
          />
          <IconButton
            icon={<FiTrash2 size={16} />}
            variant="danger"
            size="sm"
            onClick={() => handleDelete(recurring)}
            tooltip="Excluir"
          />
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Transações Recorrentes"
      subtitle="Gerencie suas receitas e despesas fixas"
      action={
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>
          Nova Recorrência
        </GlassButton>
      }
    >
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
                <small style={{ color: 'var(--text-muted)' }}>Receitas Mensais</small>
                <h4 className="mb-0" style={{ color: 'var(--income-color)' }}>
                  {formatCurrency(totalMonthlyIncome)}
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
                <small style={{ color: 'var(--text-muted)' }}>Despesas Mensais</small>
                <h4 className="mb-0" style={{ color: 'var(--expense-color)' }}>
                  {formatCurrency(totalMonthlyExpense)}
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
                  background: 'var(--glass-bg)',
                }}
              >
                <FiRepeat size={24} color="var(--accent-blue)" />
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Total Recorrências</small>
                <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>
                  {recurringTransactions.length}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Recurring Lists */}
      {recurringTransactions.length === 0 ? (
        <GlassCard className="text-center p-5">
          <FiRepeat size={48} color="var(--text-muted)" className="mb-3" />
          <h5 style={{ color: 'var(--text-primary)' }}>Nenhuma recorrência cadastrada</h5>
          <p style={{ color: 'var(--text-muted)' }}>
            Adicione transações recorrentes para automatizar suas finanças
          </p>
          <GlassButton variant="primary" icon={<FiPlus />} onClick={() => setShowForm(true)}>
            Criar Recorrência
          </GlassButton>
        </GlassCard>
      ) : (
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
                  Receitas Recorrentes ({incomeRecurrings.length})
                </h5>
              </div>
            </div>
            {incomeRecurrings.length > 0 ? (
              incomeRecurrings.map(renderRecurring)
            ) : (
              <p style={{ color: 'var(--text-muted)' }} className="text-center py-3">
                Nenhuma receita recorrente
              </p>
            )}
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
                  Despesas Recorrentes ({expenseRecurrings.length})
                </h5>
              </div>
            </div>
            {expenseRecurrings.length > 0 ? (
              expenseRecurrings.map(renderRecurring)
            ) : (
              <p style={{ color: 'var(--text-muted)' }} className="text-center py-3">
                Nenhuma despesa recorrente
              </p>
            )}
          </Col>
        </Row>
      )}

      {/* Form Modal */}
      <RecurringTransactionForm
        show={showForm}
        onHide={handleCloseForm}
        recurring={editingRecurring}
      />
    </PageLayout>
  );
}
