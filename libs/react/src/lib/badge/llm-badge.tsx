import { HTMLAttributes, ReactNode } from 'react';
import type { LlmBadgeSpec } from '../spec';
import './llm-badge.css';

type LlmBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_ICONS: Record<LlmBadgeVariant, string | null> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

/**
 * Properties for the LlmBadge component.
 */
export interface LlmBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    LlmBadgeSpec {
  /**
   * The visual style variant of the badge.
   */
  variant?: LlmBadgeVariant;
  /**
   * The size of the badge.
   */
  size?: 'sm' | 'md';
  /**
   * The content to be rendered inside the badge.
   */
  children?: ReactNode;
}

/**
 * A badge component for displaying small amounts of information or status.
 */
export function LlmBadge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...rest
}: LlmBadgeProps) {
  const classes = ['llm-badge', `variant-${variant}`, `size-${size}`, className]
    .filter(Boolean).join(' ');
  const icon = VARIANT_ICONS[variant];
  return (
    <span className={classes} role="status" {...rest}>
      {icon && <span className="variant-icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
