import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import type { LlmButtonSpec } from '@atelier-ui/spec';
import './llm-button.css';

/**
 * Properties for the LlmButton component.
 */
export interface LlmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, LlmButtonSpec {
  /**
   * The content to be rendered inside the button.
   */
  children?: ReactNode;
}

/**
 * A versatile button component that supports various styles, sizes, and states.
 */
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
