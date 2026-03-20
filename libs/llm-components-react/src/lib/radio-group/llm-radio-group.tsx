import { createContext, useContext, InputHTMLAttributes, ReactNode } from 'react';
import type { LlmRadioGroupSpec } from '@atelier-ui/spec';
import './llm-radio-group.css';

/**
 * Interface for the RadioGroup context.
 */
export interface RadioGroupContextValue {
  /**
   * The currently selected value.
   */
  value: string;
  /**
   * The name of the radio group.
   */
  name: string;
  /**
   * Whether the entire radio group is disabled.
   */
  disabled: boolean;
  /**
   * Whether the entire radio group is read-only.
   */
  readOnly: boolean;
  /**
   * Whether the radio group is in an invalid state.
   */
  invalid: boolean;
  /**
   * Callback to select a value.
   */
  onSelect: (value: string) => void;
  /**
   * Callback triggered on blur.
   */
  onBlur: () => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue>({
  value: '',
  name: '',
  disabled: false,
  readOnly: false,
  invalid: false,
  onSelect: () => {},
  onBlur: () => {},
});

/**
 * Properties for the LlmRadioGroup component.
 */
export interface LlmRadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLDivElement>, 'onChange'>,
    LlmRadioGroupSpec {
  /**
   * The current value of the radio group.
   */
  value?: string;
  /**
   * Callback triggered when the value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * The name of the radio group, applied to all child radio buttons.
   */
  name?: string;
  /**
   * Whether the radio group is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the radio group is read-only.
   */
  readOnly?: boolean;
  /**
   * Whether the radio group is in an invalid state.
   */
  invalid?: boolean;
  /**
   * Whether a value is required.
   */
  required?: boolean;
  /**
   * Array of error messages to display.
   */
  errors?: string[];
  /**
   * The radio buttons to be rendered.
   */
  children?: ReactNode;
}

/**
 * A group of radio buttons.
 */
export function LlmRadioGroup({
  value = '',
  onValueChange,
  name = '',
  disabled = false,
  readOnly: reactReadOnly,
  readonly: specReadOnly,
  invalid = false,
  required = false,
  errors = [],
  children,
  className,
  ...rest
}: LlmRadioGroupProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const classes = [
    'llm-radio-group',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    readOnly && 'is-readonly',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroupContext.Provider
      value={{
        value,
        name,
        disabled,
        readOnly,
        invalid,
        onSelect: (v) => !disabled && !readOnly && onValueChange?.(v),
        onBlur: () => {},
      }}
    >
      <div
        className={classes}
        role="radiogroup"
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        {...rest}
      >
        {children}
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
    </RadioGroupContext.Provider>
  );
}

export function useRadioGroup(): RadioGroupContextValue {
  return useContext(RadioGroupContext);
}
