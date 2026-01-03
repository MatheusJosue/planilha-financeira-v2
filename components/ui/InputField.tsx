'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import Form from 'react-bootstrap/Form';
import { FormField } from './FormField';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  error?: string;
  hint?: string;
  size?: 'sm' | 'lg';
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      value,
      onChange,
      className = 'mb-3',
      style,
      labelStyle,
      id,
      error,
      hint,
      required,
      ...props
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
      <FormField
        label={label}
        className={className}
        labelStyle={labelStyle}
        required={required}
        error={error}
        hint={hint}
      >
        <Form.Control
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={inputStyle}
          {...props}
        />
      </FormField>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
