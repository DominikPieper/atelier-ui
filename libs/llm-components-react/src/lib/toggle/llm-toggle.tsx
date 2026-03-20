import { InputHTMLAttributes, ReactNode, useId } from 'react';
import type { LlmToggleSpec } from '@atelier-ui/spec';
import './llm-toggle.css';

/**
 * Properties for the LlmToggle component.
 */
export interface LlmToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'readOnly'>,
    LlmToggleSpec {
  /**
   * Whether the toggle is read-only.
   */
  readOnly?: boolean;
  /**
   * Callback fired when the checked state changes.
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * List of error messages to display.
   */
  errors?: string[];
  /**
   * Optional content to display alongside the toggle.
   */
  children?: ReactNode;
}

/**
 * A toggle switch component for binary choices, supporting validation and custom labels.
 */
export function LlmToggle({
  checked = false,
  onCheckedChange,
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
}: LlmToggleProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const generatedId = useId();
  const inputId = id || `toggle-${generatedId}`;
  const errorId = `${inputId}-errors`;

  const classes = [
    'llm-toggle',
    checked && 'is-checked',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label htmlFor={inputId}>
        <input
          type="checkbox"
          role="switch"
          id={inputId}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-checked={checked}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-describedby={errors.length > 0 ? errorId : undefined}
          name={name}
          {...rest}
        />
        <span className="track" aria-hidden="true">
          <span className="thumb" />
        </span>
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
