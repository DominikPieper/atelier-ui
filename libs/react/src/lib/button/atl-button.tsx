import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import type { AtlButtonSpec, AtlButtonVariant, AtlButtonSize } from '../spec';
import '@atelier-ui/styles/button/atl-button.css';

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
export type AtlButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> &
  AtlButtonSpec &
  AtlButtonAccessibleName & {
    /** Visual style of the button. */
    variant?: AtlButtonVariant;
    /** Size of the button. */
    size?: AtlButtonSize;
    /** Disables the button, preventing interaction. */
    disabled?: boolean;
    /**
     * Shows a loading spinner, announces `aria-busy` and ignores activation.
     * The button stays focusable (ADR-0171).
     */
    loading?: boolean;
  };

/**
 * A versatile button component that supports various styles, sizes, and states.
 */
export const AtlButton = forwardRef<HTMLButtonElement, AtlButtonProps>(
  function AtlButton(
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      children,
      className,
      onClick,
      ...rest
    },
    ref,
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
        // Native `disabled` only for the `disabled` prop. Loading is announced
        // and blocked below, but the button stays focusable (ADR-0171).
        disabled={disabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        {...rest}
        onClick={
          loading
            ? (event) => {
                // Also stops a `type="submit"` from submitting its form.
                event.preventDefault();
              }
            : onClick
        }
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
