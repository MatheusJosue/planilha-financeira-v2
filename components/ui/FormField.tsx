'use client';

import { ReactNode } from 'react';
import Form from 'react-bootstrap/Form';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
  labelStyle?: React.CSSProperties;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function FormField({
  label,
  children,
  className = 'mb-3',
  labelStyle,
  required,
  error,
  hint,
}: FormFieldProps) {
  return (
    <Form.Group className={className}>
      <Form.Label style={{ color: 'var(--text-secondary)', ...labelStyle }}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Form.Label>
      {children}
      {error && (
        <Form.Text className="text-red-400 text-xs mt-1 block">{error}</Form.Text>
      )}
      {hint && !error && (
        <Form.Text style={{ color: 'var(--text-hint)' }} className="text-xs mt-1 block">
          {hint}
        </Form.Text>
      )}
    </Form.Group>
  );
}

export default FormField;
