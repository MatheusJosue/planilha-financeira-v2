'use client';

import { useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { FiAlertTriangle, FiEdit, FiPieChart, FiPlus, FiTrash2 } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { GlassCard } from '@/components/ui/GlassCard';
import { FloatingActionButton, GlassButton, IconButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/Modal';
import { SelectField } from '@/components/ui/SelectField';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { NoBudgetsEmpty } from '@/components/ui/EmptyState';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, parseCurrency } from '@/utils/formatCurrency';
import { showDeleteConfirm, showWarning } from '@/lib/sweetalert';
import { CATEGORY_EMOJIS, type CategoryBudget } from '@/types';

interface BudgetFormData { category: string; budget_value: string; }
type BudgetFilter = 'all' | 'ok' | 'warning' | 'exceeded';
type BudgetSort = 'usage_desc' | 'budget_desc' | 'remaining' | 'category';

const initialFormData: BudgetFormData = { category: '', budget_value: '' };

export default function OrcamentoPage() {
  const { categoryBudgets: budgets, categories, transactions, currentMonth, setBudget, deleteBudget } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>(initialFormData);
  const [filter, setFilter] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<BudgetSort>('usage_desc');
  const [loading, setLoading] = useState(false);

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    transactions
      .filter((transaction) => transaction.month === currentMonth && transaction.type === 'expense' && !transaction.is_predicted)
      .forEach((transaction) => { spending[transaction.category] = (spending[transaction.category] || 0) + transaction.value; });
    return spending;
  }, [transactions, currentMonth]);

  const budgetStatus = useMemo(() => budgets.map((budget) => {
    const spent = categorySpending[budget.category] || 0;
    const rawPercentage = budget.budget_value > 0 ? (spent / budget.budget_value) * 100 : 0;
    return {
      ...budget,
      spent,
      rawPercentage,
      percentage: Math.min(rawPercentage, 100),
      remaining: budget.budget_value - spent,
      status: rawPercentage >= 100 ? 'exceeded' : rawPercentage >= 80 ? 'warning' : 'ok',
    } as const;
  }), [budgets, categorySpending]);

  const filteredBudgets = useMemo(() => budgetStatus
    .filter((budget) => filter === 'all' || budget.status === filter)
    .sort((a, b) => {
      if (sortBy === 'budget_desc') return b.budget_value - a.budget_value;
      if (sortBy === 'remaining') return a.remaining - b.remaining;
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return b.rawPercentage - a.rawPercentage;
    }), [budgetStatus, filter, sortBy]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.budget_value, 0);
  const totalSpent = budgetStatus.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const warningCount = budgetStatus.filter((budget) => budget.status !== 'ok').length;
  const availableCategories = categories.filter((category) => !budgets.some((budget) => budget.category === category) || editingBudget?.category === category);
  const categoryOptions = availableCategories.map((category) => ({ value: category, label: `${CATEGORY_EMOJIS[category] || '📦'} ${category}` }));

  const openForm = (budget?: CategoryBudget) => {
    setEditingBudget(budget || null);
    setFormData(budget ? { category: budget.category, budget_value: budget.budget_value.toString() } : initialFormData);
    setShowForm(true);
  };

  const saveBudget = async () => {
    if (!formData.category) return void showWarning('Selecione uma categoria');
    const value = parseCurrency(formData.budget_value);
    if (!value || value <= 0) return void showWarning('Informe um limite válido');
    setLoading(true);
    try {
      await setBudget(formData.category, currentMonth, value, 80);
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const removeBudget = async (budget: CategoryBudget) => {
    const result = await showDeleteConfirm(`orçamento de ${budget.category}`);
    if (result.isConfirmed) await deleteBudget(budget.id);
  };

  const inputStyle: React.CSSProperties = { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' };
  const labelStyle: React.CSSProperties = { color: 'var(--text-secondary)' };

  return (
    <PageLayout className="budgets-page">
      <section className="dashboard-hero budgets-hero mb-4">
        <div className="dashboard-hero-copy"><span className="dashboard-kicker">Limites mensais</span><h1>Orçamento</h1><p>Defina limites por categoria e acompanhe seus gastos antes que eles escapem do plano.</p></div>
        <div className="dashboard-hero-actions"><div className="dashboard-month-selector"><MonthSelector /></div><GlassButton variant="primary" icon={<FiPlus />} onClick={() => openForm()}>Novo orçamento</GlassButton></div>
        <div className="dashboard-hero-orb dashboard-hero-orb-one" /><div className="dashboard-hero-orb dashboard-hero-orb-two" />
      </section>

      <section className="budget-pulse mb-4">
        <div className="budget-pulse-main"><div className="financial-pulse-icon"><FiPieChart /></div><div><span>Uso do orçamento</span><strong className={totalPercentage >= 100 ? 'is-negative' : ''}>{totalPercentage.toFixed(0)}%</strong><small>{formatCurrency(totalSpent)} utilizados de {formatCurrency(totalBudget)}</small></div></div>
        <div className="budget-overall"><div className="budget-overall-label"><span>Consumo geral</span><strong>{totalRemaining >= 0 ? `${formatCurrency(totalRemaining)} disponíveis` : `${formatCurrency(Math.abs(totalRemaining))} excedidos`}</strong></div><div className={`budget-overall-track ${totalPercentage >= 100 ? 'danger' : totalPercentage >= 80 ? 'warning' : ''}`}><span style={{ width: `${Math.min(totalPercentage, 100)}%` }} /></div></div>
        <div className={`budget-alert-summary ${warningCount > 0 ? 'has-alert' : ''}`}><FiAlertTriangle /><div><span>Categorias em atenção</span><strong>{warningCount}</strong></div></div>
      </section>

      <section className="budgets-workspace">
        <div className="budgets-toolbar">
          <div className="transactions-toolbar-heading"><span>Distribuição</span><strong>Limites por categoria</strong></div>
          <Row className="g-2 budgets-filters">
            <Col xs={6} lg="auto"><Form.Select value={filter} onChange={(event) => setFilter(event.target.value as BudgetFilter)} style={inputStyle}><option value="all">Todas as categorias</option><option value="ok">Saudáveis</option><option value="warning">Em atenção</option><option value="exceeded">Excedidas</option></Form.Select></Col>
            <Col xs={6} lg="auto"><Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value as BudgetSort)} style={inputStyle}><option value="usage_desc">Maior consumo</option><option value="budget_desc">Maior limite</option><option value="remaining">Menor restante</option><option value="category">Categoria A–Z</option></Form.Select></Col>
          </Row>
        </div>

        {filteredBudgets.length === 0 ? <GlassCard><NoBudgetsEmpty onAdd={() => openForm()} /></GlassCard> : (
          <Row className="g-2 budget-card-grid">
            {filteredBudgets.map((budget) => (
              <Col xs={12} sm={6} xl={4} xxl={3} key={budget.id}>
                <article className={`budget-card ${budget.status}`}>
                  <div className="budget-card-header"><span className="budget-card-icon">{CATEGORY_EMOJIS[budget.category] || '📦'}</span><div><strong>{budget.category}</strong><small>Limite de {formatCurrency(budget.budget_value)}</small></div><span className="budget-card-percentage">{budget.rawPercentage.toFixed(0)}%</span></div>
                  <div className="budget-card-progress"><span style={{ width: `${budget.percentage}%` }} /></div>
                  <div className="budget-card-values"><div><span>Gasto</span><strong>{formatCurrency(budget.spent)}</strong></div><div><span>{budget.remaining >= 0 ? 'Restante' : 'Excedido'}</span><strong>{formatCurrency(Math.abs(budget.remaining))}</strong></div></div>
                  <div className="budget-card-actions"><span>{budget.status === 'exceeded' ? 'Limite excedido' : budget.status === 'warning' ? 'Próximo do limite' : 'Dentro do planejado'}</span><div><IconButton icon={<FiEdit size={14} />} variant="glass" size="sm" onClick={() => openForm(budget)} tooltip="Editar" /><IconButton icon={<FiTrash2 size={14} />} variant="danger" size="sm" onClick={() => removeBudget(budget)} tooltip="Excluir" /></div></div>
                </article>
              </Col>
            ))}
          </Row>
        )}
      </section>

      <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => openForm()} />
      <GlassModal show={showForm} onHide={() => setShowForm(false)} title={editingBudget ? 'Editar orçamento' : 'Novo orçamento'} titleIcon={<FiPieChart />} headerGradient="primary" footer={<div className="d-flex gap-2 w-100"><GlassButton variant="glass" onClick={() => setShowForm(false)} className="flex-1">Cancelar</GlassButton><GlassButton variant="primary" onClick={saveBudget} loading={loading} className="flex-1">{editingBudget ? 'Salvar' : 'Criar orçamento'}</GlassButton></div>}>
        <SelectField label="Categoria" value={formData.category} onChange={(value) => setFormData((current) => ({ ...current, category: value }))} options={categoryOptions} placeholder="Selecione uma categoria..." required disabled={Boolean(editingBudget)} style={inputStyle} labelStyle={labelStyle} />
        <CurrencyInput label="Limite do orçamento" value={formData.budget_value} onChange={(value) => setFormData((current) => ({ ...current, budget_value: value }))} required style={inputStyle} labelStyle={labelStyle} />
        <div className="budget-form-tip">💡 Defina um limite mensal realista. O alerta será exibido ao atingir 80%.</div>
      </GlassModal>
    </PageLayout>
  );
}
