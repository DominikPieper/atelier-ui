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
  const isChecked = ctx.value === radioValue;

  const classes = [
    'atl-radio',
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
        // HTML ignores `readonly` on a radio, so guarding onChange stops the model
        // but not the input's own DOM state. Cancelling the click makes the browser
        // restore the previous selection (verified in chromium). See ADR-0045.
        onClick={(e) => ctx.readOnly && e.preventDefault()}
        onChange={() => !isDisabled && !ctx.readOnly && ctx.onSelect(radioValue)}
        onBlur={() => ctx.onBlur()}
      />
      {children && <span className="radio-text">{children}</span>}
    </label>
  );
}
