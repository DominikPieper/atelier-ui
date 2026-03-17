import { ReactNode, SelectHTMLAttributes, OptionHTMLAttributes } from 'react';
import './llm-select.css';

export interface LlmSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  errors?: string[];
  label?: string;
}

export function LlmSelect({
  value = '',
  onValueChange,
  placeholder,
  invalid = false,
  errors = [],
  disabled = false,
  required = false,
  label,
  children,
  className,
  id,
  ...rest
}: LlmSelectProps) {
  const selectId =
    id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const classes = [
    'llm-select',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <div className="select-wrapper">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          aria-invalid={invalid || undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <span className="select-arrow" aria-hidden="true">
          ▾
        </span>
      </div>
      {errors.length > 0 && (
        <div className="errors" role="alert" aria-live="polite">
          {errors.map((err, i) => (
            <p key={i} className="error-message">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export interface LlmOptionProps extends OptionHTMLAttributes<HTMLOptionElement> {
  optionValue: string;
  children?: ReactNode;
}

export function LlmOption({ optionValue, children, ...rest }: LlmOptionProps) {
  return (
    <option value={optionValue} {...rest}>
      {children}
    </option>
  );
}
