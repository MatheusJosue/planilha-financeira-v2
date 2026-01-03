'use client';

import { useState } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { FiPlus, FiTarget, FiEdit, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard, ChartCard } from '@/components/ui/GlassCard';
import { GlassButton, IconButton, FloatingActionButton } from '@/components/ui/GlassButton';
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

interface FormData {
  name: string;
  target_value: string;
  current_value: string;
  deadline: string;
  icon: string;
  color: string;
}

const initialFormData: FormData = {
  name: '',
  target_value: '',
  current_value: '0',
  deadline: '',
  icon: '🎯',
  color: '#6366f1',
};

const colorOptions = [
  { value: '#6366f1', label: '💜 Roxo' },
  { value: '#10b981', label: '💚 Verde' },
  { value: '#f59e0b', label: '🧡 Laranja' },
  { value: '#ef4444', label: '❤️ Vermelho' },
  { value: '#3b82f6', label: '💙 Azul' },
  { value: '#ec4899', label: '💗 Rosa' },
];

const iconOptions = Object.entries(GOAL_ICONS).map(([key, emoji]) => ({
  value: emoji,
  label: `${emoji} ${key}`,
}));

export default function MetasPage() {
  const { goals, addGoal, updateGoal, deleteGoal, addToGoal } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenForm = (goal?: FinancialGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_value: goal.target_value.toString(),
        current_value: goal.current_value.toString(),
        deadline: goal.deadline || '',
        icon: goal.icon || '🎯',
        color: goal.color || '#6366f1',
      });
    } else {
      setEditingGoal(null);
      setFormData(initialFormData);
    }
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.name.trim()) {
        showWarning('Por favor, insira um nome para a meta');
        return;
      }

      const targetValue = parseCurrency(formData.target_value);
      if (isNaN(targetValue) || targetValue <= 0) {
        showWarning('Por favor, insira um valor alvo válido');
        return;
      }

      const currentValue = parseCurrency(formData.current_value);

      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          name: formData.name.trim(),
          target_value: targetValue,
          current_value: currentValue,
          deadline: formData.deadline || undefined,
          icon: formData.icon,
          color: formData.color,
        });
      } else {
        await addGoal({
          name: formData.name.trim(),
          target_value: targetValue,
          current_value: currentValue,
          deadline: formData.deadline || undefined,
          icon: formData.icon,
          color: formData.color,
          is_completed: false,
        });
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goal: FinancialGoal) => {
    const result = await showDeleteConfirm(goal.name);
    if (result.isConfirmed) {
      await deleteGoal(goal.id);
    }
  };

  const handleOpenContribute = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setContributeAmount('');
    setShowContributeModal(true);
  };

  const handleContribute = async () => {
    if (!selectedGoal) return;

    const amount = parseCurrency(contributeAmount);
    if (isNaN(amount) || amount <= 0) {
      showWarning('Por favor, insira um valor válido');
      return;
    }

    await addToGoal(selectedGoal.id, amount);
    setShowContributeModal(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
  };

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  if (goals.length === 0) {
    return (
      <PageLayout
        title="Metas Financeiras"
        subtitle="Defina e acompanhe seus objetivos"
        action={
          <GlassButton variant="primary" icon={<FiPlus />} onClick={() => handleOpenForm()}>
            Nova Meta
          </GlassButton>
        }
      >
        <GlassCard>
          <NoGoalsEmpty onAdd={() => handleOpenForm()} />
        </GlassCard>

        <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => handleOpenForm()} />

        {/* Form Modal - must be included here too! */}
        <GlassModal
          show={showForm}
          onHide={() => setShowForm(false)}
          title="Nova Meta"
          titleIcon={<FiTarget />}
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
                Criar Meta
              </GlassButton>
            </div>
          }
        >
          <InputField
            label="Nome da Meta"
            value={formData.name}
            onChange={(value) => handleChange('name', value)}
            placeholder="Ex: Viagem, Reserva de Emergência..."
            required
            style={inputStyle}
            labelStyle={labelStyle}
          />

          <Row>
            <Col md={6}>
              <CurrencyInput
                label="Valor Alvo"
                value={formData.target_value}
                onChange={(value) => handleChange('target_value', value)}
                required
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
            <Col md={6}>
              <CurrencyInput
                label="Valor Atual"
                value={formData.current_value}
                onChange={(value) => handleChange('current_value', value)}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
          </Row>

          <DateInput
            label="Data Limite (opcional)"
            value={formData.deadline}
            onChange={(value) => handleChange('deadline', value)}
            style={inputStyle}
            labelStyle={labelStyle}
          />

          <Row>
            <Col md={6}>
              <SelectField
                label="Ícone"
                value={formData.icon}
                onChange={(value) => handleChange('icon', value)}
                options={iconOptions}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
            <Col md={6}>
              <SelectField
                label="Cor"
                value={formData.color}
                onChange={(value) => handleChange('color', value)}
                options={colorOptions}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
          </Row>
        </GlassModal>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Metas Financeiras"
      subtitle="Defina e acompanhe seus objetivos"
      action={
        <GlassButton variant="primary" icon={<FiPlus />} onClick={() => handleOpenForm()}>
          Nova Meta
        </GlassButton>
      }
    >
      {/* Summary */}
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
                🎯
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Metas Ativas</small>
                <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                  {goals.length}
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
                  background: 'var(--income-bg)',
                  fontSize: '1.5rem',
                }}
              >
                💰
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Total Acumulado</small>
                <h4 className="mb-0" style={{ color: 'var(--income-color)' }}>
                  {formatCurrency(goals.reduce((sum, g) => sum + g.current_value, 0))}
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
                  fontSize: '1.5rem',
                }}
              >
                🏆
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)' }}>Metas Alcançadas</small>
                <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
                  {goals.filter((g) => g.current_value >= g.target_value).length}
                </h4>
              </div>
            </div>
          </GlassCard>
        </Col>
      </Row>

      {/* Goals Grid */}
      <Row className="g-4">
        {goals.map((goal) => {
          const percentage = getProgressPercentage(goal);
          const remaining = goal.target_value - goal.current_value;

          return (
            <Col key={goal.id} lg={6}>
              <GlassCard>
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: `${goal.color}20`,
                        fontSize: '1.5rem',
                      }}
                    >
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                        {goal.name}
                      </h5>
                      {goal.deadline && (
                        <small style={{ color: 'var(--text-muted)' }}>
                          Prazo: {formatDate(goal.deadline)}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <IconButton
                      icon={<FiTrendingUp size={16} />}
                      variant="success"
                      size="sm"
                      onClick={() => handleOpenContribute(goal)}
                      tooltip="Contribuir"
                    />
                    <IconButton
                      icon={<FiEdit size={16} />}
                      variant="glass"
                      size="sm"
                      onClick={() => handleOpenForm(goal)}
                      tooltip="Editar"
                    />
                    <IconButton
                      icon={<FiTrash2 size={16} />}
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(goal)}
                      tooltip="Excluir"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: 'var(--text-muted)' }}>Progresso</span>
                    <span style={{ color: goal.color, fontWeight: 600 }}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    now={percentage}
                    variant={getProgressVariant(percentage)}
                    style={{
                      height: '10px',
                      background: 'var(--glass-bg)',
                      borderRadius: '5px',
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <div>
                    <small style={{ color: 'var(--text-muted)' }}>Atual</small>
                    <p className="mb-0 fw-bold" style={{ color: 'var(--income-color)' }}>
                      {formatCurrency(goal.current_value)}
                    </p>
                  </div>
                  <div className="text-end">
                    <small style={{ color: 'var(--text-muted)' }}>Meta</small>
                    <p className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(goal.target_value)}
                    </p>
                  </div>
                </div>

                {remaining > 0 && (
                  <div
                    className="mt-3 p-2 rounded-2 text-center"
                    style={{ background: 'var(--glass-bg)' }}
                  >
                    <small style={{ color: 'var(--text-muted)' }}>
                      Faltam <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(remaining)}</strong>
                    </small>
                  </div>
                )}

                {percentage >= 100 && (
                  <div
                    className="mt-3 p-2 rounded-2 text-center"
                    style={{ background: 'var(--income-bg)' }}
                  >
                    <span style={{ color: 'var(--income-color)' }}>
                      🎉 Meta alcançada!
                    </span>
                  </div>
                )}
              </GlassCard>
            </Col>
          );
        })}
      </Row>

      <FloatingActionButton icon={<FiPlus size={24} />} onClick={() => handleOpenForm()} />

      {/* Form Modal */}
      <GlassModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
        titleIcon={<FiTarget />}
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
              {editingGoal ? 'Salvar' : 'Criar Meta'}
            </GlassButton>
          </div>
        }
      >
        <InputField
          label="Nome da Meta"
          value={formData.name}
          onChange={(value) => handleChange('name', value)}
          placeholder="Ex: Viagem, Reserva de Emergência..."
          required
          style={inputStyle}
          labelStyle={labelStyle}
        />

        <Row>
          <Col md={6}>
            <CurrencyInput
              label="Valor Alvo"
              value={formData.target_value}
              onChange={(value) => handleChange('target_value', value)}
              required
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
          <Col md={6}>
            <CurrencyInput
              label="Valor Atual"
              value={formData.current_value}
              onChange={(value) => handleChange('current_value', value)}
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
        </Row>

        <DateInput
          label="Data Limite (opcional)"
          value={formData.deadline}
          onChange={(value) => handleChange('deadline', value)}
          style={inputStyle}
          labelStyle={labelStyle}
        />

        <Row>
          <Col md={6}>
            <SelectField
              label="Ícone"
              value={formData.icon}
              onChange={(value) => handleChange('icon', value)}
              options={iconOptions}
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
          <Col md={6}>
            <SelectField
              label="Cor"
              value={formData.color}
              onChange={(value) => handleChange('color', value)}
              options={colorOptions}
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
        </Row>
      </GlassModal>

      {/* Contribute Modal */}
      <GlassModal
        show={showContributeModal}
        onHide={() => setShowContributeModal(false)}
        title="Contribuir para Meta"
        titleIcon={<FiTrendingUp />}
        headerGradient="success"
        size="sm"
        footer={
          <div className="d-flex gap-2 w-100">
            <GlassButton variant="glass" onClick={() => setShowContributeModal(false)} className="flex-1">
              Cancelar
            </GlassButton>
            <GlassButton variant="success" onClick={handleContribute} className="flex-1">
              Contribuir
            </GlassButton>
          </div>
        }
      >
        {selectedGoal && (
          <>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>{selectedGoal.icon || '🎯'}</div>
              <h5 style={{ color: 'var(--text-primary)' }}>{selectedGoal.name}</h5>
              <p style={{ color: 'var(--text-muted)' }}>
                Atual: {formatCurrency(selectedGoal.current_value)} / {formatCurrency(selectedGoal.target_value)}
              </p>
            </div>
            <CurrencyInput
              label="Valor da Contribuição"
              value={contributeAmount}
              onChange={setContributeAmount}
              required
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </>
        )}
      </GlassModal>
    </PageLayout>
  );
}
