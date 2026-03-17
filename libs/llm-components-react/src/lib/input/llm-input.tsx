import { InputHTMLAttributes } from 'react';
import './llm-input.css';

export interface LlmInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  errors?: string[];
  label?: string;
  readOnly?: boolean;
}

export function LlmInput({
  type = 'text',
  value,
  onChange,
  onValueChange,
  invalid = false,
  errors = [],
  disabled = false,
  readOnly = false,
  required = false,
  label,
  className,
  id,
  ...rest
}: LlmInputProps) {
  const inputId =
    id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const classes = [
    'llm-input',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    readOnly && 'is-readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const errorId = inputId ? `${inputId}-errors` : undefined;

  return (
    <div className={classes}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={errors.length > 0 ? errorId : undefined}
        {...rest}
      />
      {errors.length > 0 && (
        <div className="errors" id={errorId} aria-live="polite">
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
