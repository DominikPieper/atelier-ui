import {
  createContext,
  useContext,
  useRef,
  type KeyboardEvent,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import type { AtlRadioGroupSpec } from '../spec';
import './atl-radio-group.css';

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
  onSelect: () => undefined,
  onBlur: () => undefined,
});

/**
 * Properties for the AtlRadioGroup component.
 */
export interface AtlRadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLDivElement>, 'onChange'>,
    AtlRadioGroupSpec {
  /**
   * The current value of the radio group.
   */
  value?: string;
  /**
   * Callback triggered when the value changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * The layout orientation of the radio group.
   */
  orientation?: 'horizontal' | 'vertical';
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
export function AtlRadioGroup({
  value = '',
  onValueChange,
  orientation = 'vertical',
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
}: AtlRadioGroupProps) {
  const readOnly = reactReadOnly ?? specReadOnly ?? false;
  const groupRef = useRef<HTMLDivElement>(null);

  // Roving arrow-key navigation per the WAI-ARIA radiogroup pattern: Arrow
  // Down/Right move to the next enabled radio, Up/Left to the previous, both
  // wrapping, and the navigated radio is selected and focused.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!forward && !backward) return;
    const radios = Array.from(
      groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []
    ).filter((radio) => !radio.disabled);
    if (radios.length === 0) return;
    event.preventDefault();
    const currentIdx = radios.findIndex((radio) => radio.value === value);
    const start = currentIdx === -1 ? (forward ? -1 : 0) : currentIdx;
    const nextIdx = (start + (forward ? 1 : -1) + radios.length) % radios.length;
    const target = radios[nextIdx];
    target.focus();
    onValueChange?.(target.value);
  };

  const classes = [
    'atl-radio-group',
    `orientation-${orientation}`,
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
        onBlur: () => undefined,
      }}
    >
      <div
        ref={groupRef}
        className={classes}
        role="radiogroup"
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        onKeyDown={handleKeyDown}
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
