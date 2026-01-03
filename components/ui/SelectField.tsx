'use client';

import { forwardRef } from 'react';
import Form from 'react-bootstrap/Form';
import { FormField } from './FormField';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      value,
      onChange,
      options,
      placeholder,
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
    const selectStyle: React.CSSProperties = {
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--border-radius-md)',
      ...style,
    };

    return (
      <FormField label={label} className={className} labelStyle={labelStyle} required={required} error={error}>
        <Form.Select
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          style={selectStyle}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </FormField>
    );
  }
);

SelectField.displayName = 'SelectField';

export default SelectField;
