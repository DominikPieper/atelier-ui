import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import type { LlmButtonSpec } from '@llm-components/llm-components-spec';
import './llm-button.css';

export interface LlmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, LlmButtonSpec {
  children?: ReactNode;
}

export const LlmButton = forwardRef<HTMLButtonElement, LlmButtonProps>(function LlmButton(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    children,
    className,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  const classes = [
    'llm-button',
    `variant-${variant}`,
    `size-${size}`,
    isDisabled && 'is-disabled',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});
