import { ButtonHTMLAttributes, ReactNode } from 'react';
import './llm-button.css';

export interface LlmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: ReactNode;
}

export function LlmButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className,
  ...rest
}: LlmButtonProps) {
  const isDisabled = disabled || loading;
  const classes = ['llm-button', `variant-${variant}`, `size-${size}`, isDisabled && 'is-disabled', loading && 'is-loading', className]
    .filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
