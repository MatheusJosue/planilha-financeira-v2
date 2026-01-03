'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      fullWidth = true,
      icon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            >
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`
              select-glass
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs mt-1 text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-hint)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

export default GlassSelect;
