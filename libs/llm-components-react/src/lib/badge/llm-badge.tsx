import { HTMLAttributes, ReactNode } from 'react';
import './llm-badge.css';

export interface LlmBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children?: ReactNode;
}

export function LlmBadge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...rest
}: LlmBadgeProps) {
  const classes = ['llm-badge', `variant-${variant}`, `size-${size}`, className]
    .filter(Boolean).join(' ');
  return (
    <span className={classes} role="status" {...rest}>
      {children}
    </span>
  );
}
