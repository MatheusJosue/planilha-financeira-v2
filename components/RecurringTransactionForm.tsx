'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, ButtonGroup, Button } from 'react-bootstrap';
import { FiPlus, FiEdit, FiRepeat, FiCalendar } from 'react-icons/fi';
import { GlassModal } from '@/components/ui/Modal';
import { GlassButton } from '@/components/ui/GlassButton';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { DateInput } from '@/components/ui/DateInput';
import { SelectField } from '@/components/ui/SelectField';
import { InputField } from '@/components/ui/InputField';
import { useFinanceStore } from '@/store/financeStore';
import { parseCurrency } from '@/utils/formatCurrency';
import { getToday } from '@/utils/formatDate';
import { showWarning } from '@/lib/sweetalert';
import type { RecurringTransaction, TransactionType, RecurrenceType } from '@/types';
import { CATEGORY_EMOJIS } from '@/types';

interface RecurringTransactionFormProps {
  show: boolean;
  onHide: () => void;
  recurring?: RecurringTransaction | null;
}

interface FormData {
  description: string;
  type: TransactionType;
  category: string;
  value: string;
  recurrence_type: RecurrenceType;
  day_of_month: string;
  start_date: string;
  end_date: string;
  total_installments: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  description: '',
  type: 'expense',
  category: '',
  value: '',
  recurrence_type: 'fixed',
  day_of_month: '5',
  start_date: getToday(),
  end_date: '',
  total_installments: '',
  is_active: true,
};

export function RecurringTransactionForm({
  show,
  onHide,
  recurring,
}: RecurringTransactionFormProps) {
  const { categories, addRecurringTransaction, updateRecurringTransaction } = useFinanceStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const isEditing = !!recurring;

  const getInitialFormData = useCallback((): FormData => {
    if (recurring) {
      return {
        description: recurring.description,
        type: recurring.type,
        category: recurring.category,
        value: recurring.value.toString(),
        recurrence_type: recurring.recurrence_type,
        day_of_month: recurring.day_of_month.toString(),
        start_date: recurring.start_date,
        end_date: recurring.end_date || '',
        total_installments: recurring.total_installments?.toString() || '',
        is_active: recurring.is_active,
      };
    }
    return {
      ...initialFormData,
      start_date: getToday(),
    };
  }, [recurring]);

  useEffect(() => {
    if (show) {
      setFormData(getInitialFormData());
    }
  }, [show, getInitialFormData]);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.description.trim()) {
        showWarning('Por favor, insira uma descrição');
        return;
      }

      if (!formData.category) {
        showWarning('Por favor, selecione uma categoria');
        return;
      }

      const value = parseCurrency(formData.value);
      if (isNaN(value) || value <= 0) {
        showWarning('Por favor, insira um valor válido');
        return;
      }

      const dayOfMonth = parseInt(formData.day_of_month);

      if (isEditing && recurring) {
        await updateRecurringTransaction(recurring.id, {
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          value,
          recurrence_type: formData.recurrence_type,
          day_of_month: dayOfMonth,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          total_installments:
            formData.recurrence_type === 'installment'
              ? parseInt(formData.total_installments) || undefined
              : undefined,
          is_active: formData.is_active,
        });
      } else {
        await addRecurringTransaction({
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          value,
          recurrence_type: formData.recurrence_type,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          day_of_month: dayOfMonth,
          total_installments:
            formData.recurrence_type === 'installment'
              ? parseInt(formData.total_installments) || undefined
              : undefined,
          is_active: true,
        });
      }

      onHide();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: `${CATEGORY_EMOJIS[cat] || '📦'} ${cat}`,
  }));

  const recurrenceTypeOptions = [
    { value: 'fixed', label: 'Valor Fixo (mensal)' },
    { value: 'installment', label: 'Parcelado' },
    { value: 'variable', label: 'Variável' },
  ];

  const dayOfMonthOptions = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `Dia ${i + 1}`,
  }));

  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-primary)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
  };

  return (
    <GlassModal
      show={show}
      onHide={onHide}
      title={isEditing ? 'Editar Recorrência' : 'Nova Recorrência'}
      titleIcon={isEditing ? <FiEdit /> : <FiRepeat />}
      headerGradient={formData.type === 'income' ? 'success' : 'danger'}
      footer={
        <div className="d-flex gap-2 w-100">
          <GlassButton variant="glass" onClick={onHide} className="flex-1">
            Cancelar
          </GlassButton>
          <GlassButton
            variant={formData.type === 'income' ? 'success' : 'danger'}
            onClick={handleSubmit}
            loading={loading}
            className="flex-1"
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </GlassButton>
        </div>
      }
    >
      <Form onSubmit={handleSubmit}>
        {/* Type Toggle */}
        <div className="mb-4">
          <Form.Label style={labelStyle}>Tipo</Form.Label>
          <ButtonGroup className="w-100">
            <Button
              variant={formData.type === 'expense' ? 'danger' : 'outline-secondary'}
              onClick={() => handleChange('type', 'expense')}
              style={{
                background:
                  formData.type === 'expense' ? 'var(--gradient-danger)' : 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: formData.type === 'expense' ? 'white' : 'var(--text-muted)',
              }}
            >
              Despesa
            </Button>
            <Button
              variant={formData.type === 'income' ? 'success' : 'outline-secondary'}
              onClick={() => handleChange('type', 'income')}
              style={{
                background:
                  formData.type === 'income' ? 'var(--gradient-success)' : 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: formData.type === 'income' ? 'white' : 'var(--text-muted)',
              }}
            >
              Receita
            </Button>
          </ButtonGroup>
        </div>

        {/* Description */}
        <InputField
          label="Descrição"
          value={formData.description}
          onChange={(value) => handleChange('description', value)}
          placeholder="Ex: Salário, Aluguel, Netflix..."
          required
          style={inputStyle}
          labelStyle={labelStyle}
        />

        {/* Category and Value */}
        <Row>
          <Col md={6}>
            <SelectField
              label="Categoria"
              value={formData.category}
              onChange={(value) => handleChange('category', value)}
              options={categoryOptions}
              placeholder="Selecione..."
              required
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
          <Col md={6}>
            <CurrencyInput
              label="Valor"
              value={formData.value}
              onChange={(value) => handleChange('value', value)}
              required
              style={inputStyle}
              labelStyle={labelStyle}
            />
          </Col>
        </Row>

        {/* Recurrence Settings */}
        <div
          className="p-3 rounded-3 mb-3"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <h6 className="mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FiCalendar />
            Configurações de Recorrência
          </h6>

          <Row>
            <Col md={6}>
              <SelectField
                label="Tipo de Recorrência"
                value={formData.recurrence_type}
                onChange={(value) => handleChange('recurrence_type', value)}
                options={recurrenceTypeOptions}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
            <Col md={6}>
              <SelectField
                label="Dia do Mês"
                value={formData.day_of_month}
                onChange={(value) => handleChange('day_of_month', value)}
                options={dayOfMonthOptions}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
          </Row>

          {formData.recurrence_type === 'installment' && (
            <InputField
              label="Número de Parcelas"
              type="number"
              value={formData.total_installments}
              onChange={(value) => handleChange('total_installments', value)}
              placeholder="Ex: 12"
              min="1"
              max="60"
              style={inputStyle}
              labelStyle={labelStyle}
            />
          )}

          <Row>
            <Col md={6}>
              <DateInput
                label="Data de Início"
                value={formData.start_date}
                onChange={(value) => handleChange('start_date', value)}
                required
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
            <Col md={6}>
              <DateInput
                label="Data Final (opcional)"
                value={formData.end_date}
                onChange={(value) => handleChange('end_date', value)}
                min={formData.start_date}
                style={inputStyle}
                labelStyle={labelStyle}
              />
            </Col>
          </Row>
        </div>

        {/* Active Toggle (only when editing) */}
        {isEditing && (
          <div className="mb-3">
            <Form.Check
              type="switch"
              id="active-switch"
              label={
                <span style={{ color: 'var(--text-secondary)' }}>
                  {formData.is_active ? 'Ativo' : 'Pausado'}
                </span>
              }
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
            />
          </div>
        )}
      </Form>
    </GlassModal>
  );
}

export default RecurringTransactionForm;
