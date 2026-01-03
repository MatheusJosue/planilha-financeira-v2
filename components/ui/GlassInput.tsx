'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = true,
      className = '',
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className={`${fullWidth ? 'w-100' : ''} mb-4`}>
        {label && (
          <label
            htmlFor={inputId}
            className="d-block mb-2"
            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && iconPosition === 'left' && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`input-glass ${error ? 'border-danger' : ''} ${className}`}
            style={{
              paddingLeft: icon && iconPosition === 'left' ? '40px' : '12px',
              paddingRight: isPasswordField ? '44px' : icon && iconPosition === 'right' ? '40px' : '12px',
              width: '100%',
            }}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
          {icon && iconPosition === 'right' && !isPasswordField && (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1" style={{ fontSize: '0.75rem', color: 'var(--expense-color)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1" style={{ fontSize: '0.75rem', color: 'var(--text-hint)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// Textarea variant
interface GlassTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-100' : ''} mb-4`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="d-block mb-2"
            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`input-glass ${error ? 'border-danger' : ''} ${className}`}
          style={{ resize: 'none', width: '100%' }}
          {...props}
        />
        {error && (
          <p className="mt-1" style={{ fontSize: '0.75rem', color: 'var(--expense-color)' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1" style={{ fontSize: '0.75rem', color: 'var(--text-hint)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

export default GlassInput;
