import { ReactNode } from 'react';
import { useRadioGroup } from '../radio-group/llm-radio-group';
import './llm-radio.css';

export interface LlmRadioProps {
  radioValue: string;
  disabled?: boolean;
  children?: ReactNode;
}

export function LlmRadio({ radioValue, disabled = false, children }: LlmRadioProps) {
  const ctx = useRadioGroup();
  const isDisabled = disabled || ctx.disabled;
  const isChecked = ctx.value === radioValue;

  const classes = [
    'llm-radio',
    isDisabled && 'is-disabled',
    isChecked && 'is-checked',
    ctx.invalid && 'is-invalid',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes}>
      <input
        type="radio"
        name={ctx.name || undefined}
        value={radioValue}
        checked={isChecked}
        disabled={isDisabled}
        onChange={() => !isDisabled && ctx.onSelect(radioValue)}
        onBlur={() => ctx.onBlur()}
      />
      {children && <span className="radio-text">{children}</span>}
    </label>
  );
}
