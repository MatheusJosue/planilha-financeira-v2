'use client';

import { forwardRef } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { FormField } from './FormField';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder = 'Ex: 45,00 ou 45.00',
      required = false,
      className = 'mb-3',
      style,
      labelStyle,
      id,
      error,
      disabled,
    },
    ref
  ) => {
    const inputStyle: React.CSSProperties = {
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      color: 'var(--text-primary)',
      ...style,
    };

    return (
      <FormField label={label} className={className} labelStyle={labelStyle} required={required} error={error}>
        <InputGroup>
          <InputGroup.Text
            style={{
              background: 'var(--glass-bg-strong)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-muted)',
              borderRight: 'none',
            }}
          >
            R$
          </InputGroup.Text>
          <Form.Control
            ref={ref}
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            style={{
              ...inputStyle,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
          />
        </InputGroup>
      </FormField>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
