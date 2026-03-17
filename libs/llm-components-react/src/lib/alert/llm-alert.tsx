import { HTMLAttributes, ReactNode } from 'react';
import './llm-alert.css';

export interface LlmAlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  dismissible?: boolean;
  onDismissed?: () => void;
  children?: ReactNode;
}

export function LlmAlert({
  variant = 'info',
  dismissible = false,
  onDismissed,
  children,
  className,
  ...rest
}: LlmAlertProps) {
  const classes = ['llm-alert', `variant-${variant}`, className].filter(Boolean).join(' ');
  const ariaLive = variant === 'danger' || variant === 'warning' ? 'assertive' : 'polite';

  return (
    <div className={classes} role="alert" aria-live={ariaLive} {...rest}>
      <span className="content">{children}</span>
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
