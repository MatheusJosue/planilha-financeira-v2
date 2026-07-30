'use client';

import { useMemo, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { FiCalendar, FiEdit, FiPlus, FiTarget, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { FloatingActionButton, GlassButton, IconButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { SelectField } from '@/components/ui/SelectField';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { DateInput } from '@/components/ui/DateInput';
import { NoGoalsEmpty } from '@/components/ui/EmptyState';
import { useFinanceStore } from '@/store/financeStore';
import { formatCurrency, parseCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { showDeleteConfirm, showWarning } from '@/lib/sweetalert';
import { GOAL_ICONS, type FinancialGoal } from '@/types';

interface GoalFormData {
  name: string;
  target_value: string;
  current_value: string;
  deadline: string;
  icon: string;
  color: string;
}

type GoalFilter = 'all' | 'active' | 'completed' | 'overdue';
type GoalSort = 'deadline' | 'progress_desc' | 'progress_asc' | 'remaining';

const initialFormData: GoalFormData = {
  name: '', target_value: '', current_value: '0', deadline: '', icon: '🎯', color: '#6366f1',
};

const colorOptions = [
  { value: '#6366f1', label: '💜 Roxo' },
  { value: '#10b981', label: '💚 Verde' },
  { value: '#f59e0b', label: '🧡 Laranja' },
  { value: '#ef4444', label: '❤️ Vermelho' },
  { value: '#3b82f6', label: '💙 Azul' },
  { value: '#ec4899', label: '💗 Rosa' },
];

const iconOptions = Object.entries(GOAL_ICONS).map(([key, emoji]) => ({ value: emoji, label: `${emoji} ${key}` }));

export default function MetasPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [formData, setFormData] = useState<GoalFormData>(initialFormData);
  const [filter, setFilter] = useState<GoalFilter>('all');
  const [sortBy, setSortBy] = useState<GoalSort>('deadline');
  const [loading, setLoading] = useState(false);

  const changeField = (field: keyof GoalFormData, value: string) => setFormData((current) => ({ ...current, [field]: value }));
  const progress = (goal: FinancialGoal) => Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isOverdue = (goal: FinancialGoal) => Boolean(goal.deadline && !goal.is_completed && new Date(`${goal.deadline}T23:59:59`) < new Date());

  const openForm = (goal?: FinancialGoal) => {
    setEditingGoal(goal || null);
    setFormData(goal ? {
      name: goal.name,
      target_value: goal.target_value.toString(),
      current_value: goal.current_value.toString(),
      deadline: goal.deadline || '',
      icon: goal.icon || '🎯',
      color: goal.color || '#6366f1',
    } : initialFormData);
    setShowForm(true);
  };

  const saveGoal = async () => {
    if (!formData.name.trim()) return void showWarning('Informe um nome para a meta');
    const targetValue = parseCurrency(formData.target_value);
    if (!targetValue || targetValue <= 0) return void showWarning('Informe um valor alvo válido');
    const currentValue = parseCurrency(formData.current_value) || 0;
    setLoading(true);
    try {
      const values = {
        name: formData.name.trim(), target_value: targetValue, current_value: currentValue,
        deadline: formData.deadline || undefined, icon: formData.icon, color: formData.color,
        is_completed: currentValue >= targetValue,
      };
      if (editingGoal) await updateGoal(editingGoal.id, values);
      else await addGoal(values);
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  };

  const removeGoal = async (goal: FinancialGoal) => {
    const result = await showDeleteConfirm(goal.name);
    if (result.isConfirmed) await deleteGoal(goal.id);
  };

  const contribute = async () => {
    const amount = parseCurrency(contributeAmount);
    if (!selectedGoal || !amount || amount <= 0) return void showWarning('Informe um valor válido');
    await addToGoal(selectedGoal.id, amount);
    setShowContributeModal(false);
  };

  const filteredGoals = useMemo(() => goals
    .filter((goal) => {
      if (filter === 'active') return !goal.is_completed && !isOverdue(goal);
      if (filter === 'completed') return goal.is_completed || goal.current_value >= goal.target_value;
      if (filter === 'overdue') return isOverdue(goal);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'progress_desc') return progress(b) - progress(a);
      if (sortBy === 'progress_asc') return progress(a) - progress(b);
      if (sortBy === 'remaining') return (a.target_value - a.current_value) - (b.target_value - b.current_value);
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }), [goals, filter, sortBy]);

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_value, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.current_value, 0);
  const overallProgress = totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0;
  const completedCount = goals.filter((goal) => goal.is_completed || goal.current_value >= goal.target_value).length;
  const inputStyle: React.CSSProperties = { background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' };
  const labelStyle: React.CSSProperties = { color: 'var(--text-secondary)' };

  return (
    <PageLayout className="goals-page">
      <section className="dashboard-hero goals-hero mb-4">
        <div className="dashboard-hero-copy"><span className="dashboard-kicker">Objetivos financeiros</span><h1>Metas</h1><p>Transforme grandes planos em avanços pequenos e consistentes.</p></div>
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => openForm()}>Nova meta</GlassButton>
        <div className="dashboard-hero-orb dashboard-hero-orb-one" /><div className="dashboard-hero-orb dashboard-hero-orb-two" />
      </section>

      <section className="goals-pulse mb-4">
        <div className="goals-pulse-main"><div className="financial-pulse-icon"><FiTarget /></div><div><span>Progresso geral</span><strong>{overallProgress.toFixed(0)}%</strong><small>{formatCurrency(totalCurrent)} acumulados de {formatCurrency(totalTarget)}</small></div></div>
        <div className="goals-overall-track"><span style={{ width: `${overallProgress}%` }} /></div>
        <div className="goals-pulse-stat"><span>Em andamento</span><strong>{goals.length - completedCount}</strong></div>
        <div className="goals-pulse-stat success"><span>Concluídas</span><strong>{completedCount}</strong></div>
      </section>

      <section className="goals-workspace">
        <div className="goals-toolbar">
          <div className="transactions-toolbar-heading"><span>Planejamento</span><strong>Seus objetivos</strong></div>
          <Row className="g-2 goals-filters">
            <Col xs={6} lg="auto"><Form.Select value={filter} onChange={(event) => setFilter(event.target.value as GoalFilter)} style={inputStyle}><option value="all">Todas as metas</option><option value="active">Em andamento</option><option value="completed">Concluídas</option><option value="overdue">Atrasadas</option></Form.Select></Col>
            <Col xs={6} lg="auto"><Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value as GoalSort)} style={inputStyle}><option value="deadline">Prazo mais próximo</option><option value="progress_desc">Maior progresso</option><option value="progress_asc">Menor progresso</option><option value="remaining">Menor valor restante</option></Form.Select></Col>
          </Row>
        </div>

        {filteredGoals.length === 0 ? <GlassCard><NoGoalsEmpty onAdd={() => openForm()} /></GlassCard> : (
          <Row className="g-2 goal-card-grid">
            {filteredGoals.map((goal) => {
              const percentage = progress(goal);
              const remaining = Math.max(goal.target_value - goal.current_value, 0);
              const overdue = isOverdue(goal);
              return (
                <Col xs={12} sm={6} xl={4} xxl={3} key={goal.id}>
                  <article className={`goal-card ${percentage >= 100 ? 'completed' : ''} ${overdue ? 'overdue' : ''}`} style={{ '--goal-color': goal.color } as React.CSSProperties}>
                    <div className="goal-card-header"><span className="goal-card-icon">{goal.icon || '🎯'}</span><div><strong>{goal.name}</strong>{goal.deadline && <small><FiCalendar /> {formatDate(goal.deadline)}</small>}</div><span className="goal-card-percentage">{percentage.toFixed(0)}%</span></div>
                    <div className="goal-card-progress"><span style={{ width: `${percentage}%` }} /></div>
                    <div className="goal-card-values"><div><span>Acumulado</span><strong>{formatCurrency(goal.current_value)}</strong></div><div><span>{percentage >= 100 ? 'Concluída' : 'Faltam'}</span><strong>{percentage >= 100 ? '✓' : formatCurrency(remaining)}</strong></div></div>
                    <div className="goal-card-actions"><GlassButton variant="success" size="sm" icon={<FiTrendingUp size={14} />} onClick={() => { setSelectedGoal(goal); setContributeAmount(''); setShowContributeModal(true); }}>Contribuir</GlassButton><div><IconButton icon={<FiEdit size={14} />} variant="glass" size="sm" onClick={() => openForm(goal)} tooltip="Editar" /><IconButton icon={<FiTrash2 size={14} />} variant="danger" size="sm" onClick={() => removeGoal(goal)} tooltip="Excluir" /></div></div>
                  </article>
                </Col>
              );
            })}
          </Row>
        )}
      </section>

      <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => openForm()} />

      <GlassModal show={showForm} onHide={() => setShowForm(false)} title={editingGoal ? 'Editar meta' : 'Nova meta'} titleIcon={<FiTarget />} headerGradient="primary" footer={<div className="d-flex gap-2 w-100"><GlassButton variant="glass" onClick={() => setShowForm(false)} className="flex-1">Cancelar</GlassButton><GlassButton variant="primary" onClick={saveGoal} loading={loading} className="flex-1">{editingGoal ? 'Salvar' : 'Criar meta'}</GlassButton></div>}>
        <InputField label="Nome da meta" value={formData.name} onChange={(value) => changeField('name', value)} placeholder="Ex: Viagem, reserva de emergência..." required style={inputStyle} labelStyle={labelStyle} />
        <Row><Col md={6}><CurrencyInput label="Valor alvo" value={formData.target_value} onChange={(value) => changeField('target_value', value)} required style={inputStyle} labelStyle={labelStyle} /></Col><Col md={6}><CurrencyInput label="Valor atual" value={formData.current_value} onChange={(value) => changeField('current_value', value)} style={inputStyle} labelStyle={labelStyle} /></Col></Row>
        <DateInput label="Data limite (opcional)" value={formData.deadline} onChange={(value) => changeField('deadline', value)} style={inputStyle} labelStyle={labelStyle} />
        <Row><Col md={6}><SelectField label="Ícone" value={formData.icon} onChange={(value) => changeField('icon', value)} options={iconOptions} style={inputStyle} labelStyle={labelStyle} /></Col><Col md={6}><SelectField label="Cor" value={formData.color} onChange={(value) => changeField('color', value)} options={colorOptions} style={inputStyle} labelStyle={labelStyle} /></Col></Row>
      </GlassModal>

      <GlassModal show={showContributeModal} onHide={() => setShowContributeModal(false)} title="Contribuir para meta" titleIcon={<FiTrendingUp />} headerGradient="success" size="sm" footer={<div className="d-flex gap-2 w-100"><GlassButton variant="glass" onClick={() => setShowContributeModal(false)} className="flex-1">Cancelar</GlassButton><GlassButton variant="success" onClick={contribute} className="flex-1">Contribuir</GlassButton></div>}>
        {selectedGoal && <><div className="goal-contribution-summary"><span>{selectedGoal.icon || '🎯'}</span><strong>{selectedGoal.name}</strong><small>{formatCurrency(selectedGoal.current_value)} de {formatCurrency(selectedGoal.target_value)}</small></div><CurrencyInput label="Valor da contribuição" value={contributeAmount} onChange={setContributeAmount} required style={inputStyle} labelStyle={labelStyle} /></>}
      </GlassModal>
    </PageLayout>
  );
}
