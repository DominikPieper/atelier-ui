import { InputHTMLAttributes, ReactNode, useRef, useEffect, useId } from 'react';
import type { LlmCheckboxSpec } from '../spec';
import './llm-checkbox.css';

/**
 * Properties for the LlmCheckbox component.
 */
export interface LlmCheckboxProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'checked' | 'onChange' | 'readOnly' | 'value'
    >,
    LlmCheckboxSpec {
  /**
   * Whether the checkbox is checked.
   */
  checked?: boolean;
  /**
   * Callback triggered when the checked state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Whether the checkbox is in an indeterminate state.
   */
  indeterminate?: boolean;
  /**
   * Whether the checkbox is in an invalid state.
   */
  invalid?: boolean;
  /**
   * Array of error messages to display.
   */
  errors?: string[];
  /**
   * Whether the checkbox is read-only.
   */
  readOnly?: boolean;
  /**
   * The content to be rendered as the label for the checkbox.
   */
  children?: ReactNode;
}

/**
 * A checkbox component for selecting one or more options.
 */
export function LlmCheckbox({
  checked = false,
  onCheckedChange,
  indeterminate = false,
  invalid = false,
  errors = [],
  disabled = false,
  readOnly: reactReadOnly,
  readonly: specReadOnly,
  required = false,
  children,
  className,
  id,
  name,
  ...rest
}: LlmCheckboxProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || `checkbox-${generatedId}`;
  const errorId = `${inputId}-errors`;

  const classes = [
    'llm-checkbox',
    checked && 'is-checked',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={classes}>
      <label htmlFor={inputId}>
        <input
          ref={inputRef}
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={errors.length > 0 ? errorId : undefined}
          name={name}
          {...rest}
        />
        {children}
      </label>
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
