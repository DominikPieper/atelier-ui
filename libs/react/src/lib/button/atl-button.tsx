import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import type { AtlButtonSpec } from '../spec';
import './atl-button.css';

/**
 * Accessibility requirement: the button must carry an accessible name
 * either as visible children OR as an `aria-label`. TypeScript catches
 * the icon-only-without-aria-label mistake at consumer build time.
 */
type AtlButtonAccessibleName =
  | { children: ReactNode; 'aria-label'?: string }
  | { children?: undefined; 'aria-label': string };

/**
 * Properties for the AtlButton component.
 */
export type AtlButtonProps =
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>
  & AtlButtonSpec
  & AtlButtonAccessibleName;

/**
 * A versatile button component that supports various styles, sizes, and states.
 */
export const AtlButton = forwardRef<HTMLButtonElement, AtlButtonProps>(function AtlButton(
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
    'atl-button',
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
