import { HTMLAttributes, ReactNode } from 'react';
import type { AtlAlertSpec } from '../spec';
import './atl-alert.css';

type AtlAlertVariant = 'info' | 'success' | 'warning' | 'danger';

const VARIANT_ICONS: Record<AtlAlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

/**
 * Properties for the AtlAlert component.
 */
export interface AtlAlertProps
  extends HTMLAttributes<HTMLDivElement>,
    AtlAlertSpec {
  /**
   * The visual style variant of the alert.
   */
  variant?: AtlAlertVariant;
  /**
   * Whether the alert can be dismissed by the user.
   */
  dismissible?: boolean;
  /**
   * Callback triggered when the alert is dismissed.
   */
  onDismissed?: () => void;
  /**
   * The content to be rendered inside the alert.
   */
  children?: ReactNode;
}

/**
 * An alert component for displaying important messages.
 */
export function AtlAlert({
  variant = 'info',
  dismissible = false,
  onDismissed,
  children,
  className,
  ...rest
}: AtlAlertProps) {
  const classes = ['atl-alert', `variant-${variant}`, className].filter(Boolean).join(' ');
  const ariaLive = variant === 'danger' || variant === 'warning' ? 'assertive' : 'polite';

  return (
    <div className={classes} role="alert" aria-live={ariaLive} {...rest}>
      <span className="content">
        <span className="variant-icon" aria-hidden="true">{VARIANT_ICONS[variant]}</span>
        {children}
      </span>
      {dismissible && (
        <button
          className="dismiss"
          type="button"
          aria-label="Dismiss"
          onClick={onDismissed}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
