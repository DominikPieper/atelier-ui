import { ReactNode } from 'react';
import type { AtlRadioSpec } from '../spec';
import { useRadioGroup } from '../radio-group/atl-radio-group';
import './atl-radio.css';

/**
 * Properties for the AtlRadio component.
 */
export interface AtlRadioProps extends AtlRadioSpec {
  /**
   * The value of the radio button.
   */
  radioValue: string;
  /**
   * Whether the radio button is disabled.
   */
  disabled?: boolean;
  /**
   * The content to be rendered as the label for the radio button.
   */
  children?: ReactNode;
}

/**
 * An individual radio button component, meant to be used within AtlRadioGroup.
 */
export function AtlRadio({ radioValue, disabled = false, children }: AtlRadioProps) {
  const ctx = useRadioGroup();
  const isDisabled = disabled || ctx.disabled;
  const isReadOnly = ctx.readOnly;
  const isChecked = ctx.value === radioValue;

  const classes = [
    'atl-radio',
    isDisabled && 'is-disabled',
    isReadOnly && 'is-readonly',
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
        readOnly={isReadOnly}
        onChange={() => !isDisabled && !isReadOnly && ctx.onSelect(radioValue)}
        onBlur={() => ctx.onBlur()}
      />
      {children && <span className="radio-text">{children}</span>}
    </label>
  );
}
