'use client';

import { useState, useMemo } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiPieChart, FiAlertTriangle } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton, IconButton, FloatingActionButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/Modal';
import { SelectField } from '@/components/ui/SelectField';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { NoBudgetsEmpty } from '@/components/ui/EmptyState';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, parseCurrency } from '@/utils/formatCurrency';
import { showDeleteConfirm, showWarning } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS, type CategoryBudget } from '@/types';

interface FormData {
  category: string;
  budget_value: string;
}

const initialFormData: FormData = {
  category: '',
  budget_value: '',
};

export default function OrcamentoPage() {
  const {
    categoryBudgets: budgets,
    categories,
    transactions,
    currentMonth,
    setBudget,
    deleteBudget,
  } = useFinanceStore();

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  // Calculate spending per category for current month
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter((t) => t.month === currentMonth && t.type === 'expense' && !t.is_predicted)
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.value;
      });
    return spending;
  }, [transactions, currentMonth]);

  // Calculate budget status
  const budgetStatus = useMemo(() => {
    if (!budgets) return [];
    return budgets.map((budget) => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = budget.budget_value > 0 ? (spent / budget.budget_value) * 100 : 0;
      const remaining = budget.budget_value - spent;

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        remaining,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok',
      };
    });
  }, [budgets, categorySpending]);

  // Summary stats
  const totalBudget = (budgets || []).reduce((sum, b) => sum + b.budget_value, 0);
  const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
  const exceededCount = budgetStatus.filter((b) => b.status === 'exceeded').length;

  // Available categories (not yet budgeted)
  const availableCategories = (categories || []).filter(
    (cat) => !(budgets || []).some((b) => b.category === cat) || editingBudget?.category === cat
  );

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenForm = (budget?: CategoryBudget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        budget_value: budget.budget_value.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData(initialFormData);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.category) {
        showWarning('Por favor, selecione uma categoria');
        return;
      }

      const limit = parseCurrency(formData.budget_value);
      if (isNaN(limit) || limit <= 0) {
        showWarning('Por favor, insira um limite válido');
        return;
      }

      // setBudget handles both add and update
      await setBudget(formData.category, currentMonth, limit, 80);

      setShowForm(false);
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (budget: CategoryBudget) => {
    const result = await showDeleteConfirm(`orçamento de ${budget.category}`);
    if (result.isConfirmed) {
      await deleteBudget(budget.id);
    }
  };

  const getProgressVariant = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'success';
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
  };

  const categoryOptions = availableCategories.map((cat) => ({
    value: cat,
    label: `${CATEGORY_EMOJIS[cat] || '📦'} ${cat}`,
  }));

  return (
    <PageLayout
      title="Orçamento"
      subtitle="Controle seus gastos por categoria"
      action={
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => handleOpenForm()}>
          Novo Orçamento
        </GlassButton>
      }
    >
      <MonthSelector />

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
                  background: 'var(--glass-bg)',
                  fontSize: '1.5rem',
                }}
              >
                💰
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Orçamento Total</small>
                <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(totalBudget)}
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
                  background: totalSpent > totalBudget ? 'var(--expense-bg)' : 'var(--income-bg)',
                  fontSize: '1.5rem',
                }}
              >
                📊
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Total Gasto</small>
                <h4
                  className="mb-0"
                  style={{
                    color: totalSpent > totalBudget ? 'var(--expense-color)' : 'var(--income-color)',
                  }}
                >
                  {formatCurrency(totalSpent)}
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
                  background: exceededCount > 0 ? 'var(--expense-bg)' : 'var(--income-bg)',
                  fontSize: '1.5rem',
                }}
              >
                {exceededCount > 0 ? '⚠️' : '✅'}
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Orçamentos Excedidos</small>
                <h4
                  className="mb-0"
                  style={{
                    color: exceededCount > 0 ? 'var(--expense-color)' : 'var(--income-color)',
                  }}
                >
                  {exceededCount}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
      </Row>

      {budgetStatus.length === 0 ? (
        <GlassCard>
          <NoBudgetsEmpty onAdd={() => handleOpenForm()} />
        </GlassCard>
      ) : (
        <Row className="g-4">
          {budgetStatus.map((budget) => (
            <Col key={budget.id} lg={6}>
              <GlassCard>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: '50px',
                        height: '50px',
                        background:
                          budget.status === 'exceeded'
                            ? 'var(--expense-bg)'
                            : budget.status === 'warning'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'var(--income-bg)',
                        fontSize: '1.5rem',
                      }}
                    >
                      {CATEGORY_EMOJIS[budget.category] || '📦'}
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                        {budget.category}
                      </h5>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Limite: {formatCurrency(budget.budget_value)}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <IconButton
                      icon={<FiEdit size={16} />}
                      variant="glass"
                      size="sm"
                      onClick={() => handleOpenForm(budget)}
                      tooltip="Editar"
                    />
                    <IconButton
                      icon={<FiTrash2 size={16} />}
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(budget)}
                      tooltip="Excluir"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="d-flex align-items-center" style={{ color: 'var(--text-muted)' }}>
                      {budget.status === 'exceeded' && (
                        <FiAlertTriangle
                          size={14}
                          className="me-1"
                          style={{ color: 'var(--expense-color)' }}
                        />
                      )}
                      Utilizado
                    </span>
                    <span
                      style={{
                        color:
                          budget.status === 'exceeded'
                            ? 'var(--expense-color)'
                            : budget.status === 'warning'
                            ? '#f59e0b'
                            : 'var(--income-color)',
                        fontWeight: 600,
                      }}
                    >
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    now={budget.percentage}
                    variant={getProgressVariant(budget.status)}
                    style={{
                      height: '10px',
                      background: 'var(--glass-bg)',
                      borderRadius: '5px',
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <div>
                    <small style={{ color: 'var(--text-muted)' }}>Gasto</small>
                    <p
                      className="mb-0 fw-bold"
                      style={{
                        color:
                          budget.status === 'exceeded'
                            ? 'var(--expense-color)'
                            : 'var(--text-primary)',
                      }}
                    >
                      {formatCurrency(budget.spent)}
                    </p>
                  </div>
                  <div className="text-end">
                    <small style={{ color: 'var(--text-muted)' }}>
                      {budget.remaining >= 0 ? 'Restante' : 'Excedido'}
                    </small>
                    <p
                      className="mb-0 fw-bold"
                      style={{
                        color:
                          budget.remaining >= 0 ? 'var(--income-color)' : 'var(--expense-color)',
                      }}
                    >
                      {formatCurrency(Math.abs(budget.remaining))}
                    </p>
                  </div>
                </div>

                {budget.status === 'exceeded' && (
                  <div
                    className="mt-3 p-2 rounded-2 text-center"
                    style={{ background: 'var(--expense-bg)' }}
                  >
                    <small style={{ color: 'var(--expense-color)' }}>
                      ⚠️ Orçamento excedido em {formatCurrency(Math.abs(budget.remaining))}
                    </small>
                  </div>
                )}

                {budget.status === 'warning' && (
                  <div
                    className="mt-3 p-2 rounded-2 text-center"
                    style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                  >
                    <small style={{ color: '#f59e0b' }}>
                      ⚠️ Atenção: você já usou mais de 80% do orçamento
                    </small>
                  </div>
                )}
              </GlassCard>
            </Col>
          ))}
        </Row>
      )}

      <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => handleOpenForm()} />

      {/* Form Modal */}
      <GlassModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
        titleIcon={<FiPieChart />}
        headerGradient="primary"
        footer={
          <div className="d-flex gap-2 w-100">
            <GlassButton variant="glass" onClick={() => setShowForm(false)} className="flex-1">
              Cancelar
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              className="flex-1"
            >
              {editingBudget ? 'Salvar' : 'Criar Orçamento'}
            </GlassButton>
          </div>
        }
      >
        <SelectField
          label="Categoria"
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          options={categoryOptions}
          placeholder="Selecione uma categoria..."
          required
          disabled={!!editingBudget}
          style={inputStyle}
          labelStyle={labelStyle}
        />

        <CurrencyInput
          label="Limite do Orçamento"
          value={formData.budget_value}
          onChange={(value) => handleChange('budget_value', value)}
          required
          style={inputStyle}
          labelStyle={labelStyle}
        />

        <div
          className="p-3 rounded-3"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <small style={{ color: 'var(--text-muted)' }}>
            💡 Dica: Defina um limite mensal para esta categoria. Você receberá alertas quando
            estiver perto de atingir o limite.
          </small>
        </div>
      </GlassModal>
    </PageLayout>
  );
}
