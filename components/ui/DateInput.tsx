'use client';

import { forwardRef } from 'react';
import Form from 'react-bootstrap/Form';
import { FormField } from './FormField';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  id?: string;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      value,
      onChange,
      required = false,
      className = 'mb-3',
      style,
      labelStyle,
      id,
      min,
      max,
      error,
      disabled,
    },
    ref
  ) => {
    const inputStyle: React.CSSProperties = {
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--border-radius-md)',
      ...style,
    };

    return (
      <FormField label={label} className={className} labelStyle={labelStyle} required={required} error={error}>
        <Form.Control
          ref={ref}
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          style={inputStyle}
        />
      </FormField>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput;
