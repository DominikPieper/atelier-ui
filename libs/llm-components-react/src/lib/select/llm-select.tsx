import { ReactNode, SelectHTMLAttributes, OptionHTMLAttributes } from 'react';
import type {
  LlmSelectSpec,
  LlmOptionSpec,
} from '@atelier-ui/spec';
import './llm-select.css';

/**
 * Properties for the LlmSelect component.
 */
export interface LlmSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>,
    LlmSelectSpec {
  /**
   * The current value of the select.
   */
  value?: string;
  /**
   * Callback triggered when the value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Placeholder text to display when no value is selected.
   */
  placeholder?: string;
  /**
   * Whether the select is in an invalid state.
   */
  invalid?: boolean;
  /**
   * Array of error messages to display.
   */
  errors?: string[];
  /**
   * The label for the select.
   */
  label?: string;
  /**
   * Whether the select is read-only.
   */
  readOnly?: boolean;
}

/**
 * A select component for choosing an option from a list.
 */
export function LlmSelect({
  value = '',
  onValueChange,
  placeholder,
  invalid = false,
  errors = [],
  disabled = false,
  readOnly: reactReadOnly,
  readonly: specReadOnly,
  required = false,
  label,
  children,
  className,
  id,
  ...rest
}: LlmSelectProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const selectId =
    id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const classes = [
    'llm-select',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    readOnly && 'is-readonly',
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

/**
 * Properties for the LlmOption component.
 */
export interface LlmOptionProps
  extends OptionHTMLAttributes<HTMLOptionElement>,
    LlmOptionSpec {
  /**
   * The value of the option.
   */
  optionValue: string;
  /**
   * The content to be rendered inside the option.
   */
  children?: ReactNode;
}

/**
 * An individual option component for use within LlmSelect.
 */
export function LlmOption({ optionValue, children, ...rest }: LlmOptionProps) {
  return (
    <option value={optionValue} {...rest}>
      {children}
    </option>
  );
}
