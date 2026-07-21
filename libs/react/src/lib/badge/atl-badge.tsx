import { HTMLAttributes, ReactNode } from 'react';
import type { AtlBadgeSpec } from '../spec';
import './atl-badge.css';

type AtlBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_ICONS: Record<AtlBadgeVariant, string | null> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

/**
 * Properties for the AtlBadge component.
 */
export interface AtlBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    AtlBadgeSpec {
  /**
   * The visual style variant of the badge.
   */
  variant?: AtlBadgeVariant;
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
export function AtlBadge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...rest
}: AtlBadgeProps) {
  const classes = ['atl-badge', `variant-${variant}`, `size-${size}`, className]
    .filter(Boolean).join(' ');
  const icon = VARIANT_ICONS[variant];
  return (
    <span className={classes} role="status" {...rest}>
      {icon && <span className="variant-icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
