import { createContext, useContext, InputHTMLAttributes, ReactNode } from 'react';
import './llm-radio-group.css';

export interface RadioGroupContextValue {
  value: string;
  name: string;
  disabled: boolean;
  invalid: boolean;
  onSelect: (value: string) => void;
  onBlur: () => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue>({
  value: '',
  name: '',
  disabled: false,
  invalid: false,
  onSelect: () => {},
  onBlur: () => {},
});

export interface LlmRadioGroupProps extends Omit<InputHTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  errors?: string[];
  children?: ReactNode;
}

export function LlmRadioGroup({
  value = '',
  onValueChange,
  name = '',
  disabled = false,
  invalid = false,
  required = false,
  errors = [],
  children,
  className,
  ...rest
}: LlmRadioGroupProps) {
  const classes = [
    'llm-radio-group',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
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
        invalid,
        onSelect: (v) => !disabled && onValueChange?.(v),
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
