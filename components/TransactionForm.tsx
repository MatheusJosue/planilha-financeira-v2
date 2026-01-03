'use client';

import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, ButtonGroup, Button } from 'react-bootstrap';
import { FiPlus, FiEdit, FiDollarSign, FiCalendar, FiRepeat } from 'react-icons/fi';
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
import type { Transaction, TransactionType, RecurrenceType } from '@/types';
import { CATEGORY_EMOJIS } from '@/types';

interface TransactionFormProps {
  show: boolean;
  onHide: () => void;
  transaction?: Transaction | null;
  defaultType?: TransactionType;
}

interface FormData {
  description: string;
  type: TransactionType;
  category: string;
  value: string;
  date: string;
  isRecurring: boolean;
  recurrence_type: RecurrenceType;
  day_of_month: string;
  total_installments: string;
  end_date: string;
}

const initialFormData: FormData = {
  description: '',
  type: 'expense',
  category: '',
  value: '',
  date: getToday(),
  isRecurring: false,
  recurrence_type: 'fixed',
  day_of_month: '5',
  total_installments: '',
  end_date: '',
};

export function TransactionForm({
  show,
  onHide,
  transaction,
  defaultType = 'expense',
}: TransactionFormProps) {
  const {
    categories,
    addTransaction,
    updateTransaction,
    addRecurringTransaction,
  } = useFinanceStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  const isEditing = !!transaction;

  // Initialize form data
  const getInitialFormData = useCallback((): FormData => {
    if (transaction) {
      return {
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        value: transaction.value.toString(),
        date: transaction.date,
        isRecurring: false,
        recurrence_type: 'fixed',
        day_of_month: '5',
        total_installments: '',
        end_date: '',
      };
    }
    return {
      ...initialFormData,
      type: defaultType,
      date: getToday(),
    };
  }, [transaction, defaultType]);

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
      // Validate
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

      if (!formData.date) {
        showWarning('Por favor, selecione uma data');
        return;
      }

      if (isEditing && transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, {
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          value,
          date: formData.date,
        });
      } else if (formData.isRecurring) {
        // Create recurring transaction
        const dayOfMonth = parseInt(formData.day_of_month);

        await addRecurringTransaction({
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          value,
          recurrence_type: formData.recurrence_type,
          start_date: formData.date,
          end_date: formData.end_date || undefined,
          day_of_month: dayOfMonth,
          total_installments:
            formData.recurrence_type === 'installment'
              ? parseInt(formData.total_installments) || undefined
              : undefined,
          is_active: true,
        });
      } else {
        // Create regular transaction
        await addTransaction({
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          value,
          date: formData.date,
        });
      }

      onHide();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: `${CATEGORY_EMOJIS[cat] || '📦'} ${cat}`,
  }));

  const recurrenceTypeOptions = [
    { value: 'fixed', label: 'Valor Fixo' },
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
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
      titleIcon={isEditing ? <FiEdit /> : <FiPlus />}
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
            {isEditing ? 'Salvar' : 'Adicionar'}
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
                  formData.type === 'expense'
                    ? 'var(--gradient-danger)'
                    : 'var(--glass-bg)',
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
                  formData.type === 'income'
                    ? 'var(--gradient-success)'
                    : 'var(--glass-bg)',
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
          placeholder="Ex: Almoço, Salário..."
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

        {/* Date */}
        <DateInput
          label="Data"
          value={formData.date}
          onChange={(value) => handleChange('date', value)}
          required
          style={inputStyle}
          labelStyle={labelStyle}
        />

        {/* Recurring Toggle (only for new transactions) */}
        {!isEditing && (
          <>
            <div className="mb-3">
              <Form.Check
                type="switch"
                id="recurring-switch"
                label={
                  <span className="d-flex align-items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <FiRepeat size={16} />
                    Transação Recorrente
                  </span>
                }
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
              />
            </div>

            {/* Recurring Options */}
            {formData.isRecurring && (
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                }}
              >
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

                <DateInput
                  label="Data Final (opcional)"
                  value={formData.end_date}
                  onChange={(value) => handleChange('end_date', value)}
                  min={formData.date}
                  style={inputStyle}
                  labelStyle={labelStyle}
                />
              </div>
            )}
          </>
        )}
      </Form>
    </GlassModal>
  );
}

export default TransactionForm;
