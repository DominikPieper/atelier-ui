import { InputHTMLAttributes } from 'react';
import type { LlmInputSpec } from '@llm-components/llm-components-spec';
import './llm-input.css';

/**
 * Properties for the LlmInput component.
 */
export interface LlmInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'readOnly'>,
    LlmInputSpec {
  /**
   * The type of input to render.
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /**
   * The current value of the input.
   */
  value?: string;
  /**
   * Callback triggered when the value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Whether the input is in an invalid state.
   */
  invalid?: boolean;
  /**
   * Array of error messages to display.
   */
  errors?: string[];
  /**
   * The label for the input.
   */
  label?: string;
  /**
   * Whether the input is read-only.
   */
  readOnly?: boolean;
}

/**
 * A versatile input component for text entry.
 */
export function LlmInput({
  type = 'text',
  value,
  onChange,
  onValueChange,
  invalid = false,
  errors = [],
  disabled = false,
  readOnly: reactReadOnly,
  readonly: specReadOnly,
  required = false,
  label,
  className,
  id,
  ...rest
}: LlmInputProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
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
