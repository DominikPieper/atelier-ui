import { ReactNode, SelectHTMLAttributes, OptionHTMLAttributes } from 'react';
import type {
  AtlSelectSpec,
  AtlOptionSpec,
} from '../spec';
import './atl-select.css';

/**
 * Properties for the AtlSelect component.
 */
export interface AtlSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>,
    AtlSelectSpec {
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
export function AtlSelect({
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
}: AtlSelectProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const selectId =
    id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const classes = [
    'atl-select',
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
 * Properties for the AtlOption component.
 */
export interface AtlOptionProps
  extends OptionHTMLAttributes<HTMLOptionElement>,
    AtlOptionSpec {
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
 * An individual option component for use within AtlSelect.
 */
export function AtlOption({ optionValue, children, ...rest }: AtlOptionProps) {
  return (
    <option value={optionValue} {...rest}>
      {children}
    </option>
  );
}
