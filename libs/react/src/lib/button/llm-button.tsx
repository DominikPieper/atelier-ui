import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import type { LlmButtonSpec } from '../spec';
import './llm-button.css';

/**
 * Accessibility requirement: the button must carry an accessible name
 * either as visible children OR as an `aria-label`. TypeScript catches
 * the icon-only-without-aria-label mistake at consumer build time.
 */
type LlmButtonAccessibleName =
  | { children: ReactNode; 'aria-label'?: string }
  | { children?: undefined; 'aria-label': string };

/**
 * Properties for the LlmButton component.
 */
export type LlmButtonProps =
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>
  & LlmButtonSpec
  & LlmButtonAccessibleName;

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
