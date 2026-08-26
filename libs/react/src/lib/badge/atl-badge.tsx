import { HTMLAttributes, ReactNode } from 'react';
import type { AtlBadgeSpec, AtlIconName } from '../spec';
import './atl-badge.css';
import { AtlIcon } from '../icon/atl-icon';

/** Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
 * was the fifth way this library drew an icon, and the one check:iconography
 * missed (ADR-0050). */
const VARIANT_ICON_NAMES: Partial<Record<AtlBadgeVariant, AtlIconName>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};


type AtlBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

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
  const iconName = VARIANT_ICON_NAMES[variant];
  return (
    <span className={classes} role="status" {...rest}>
      {iconName && <AtlIcon className="variant-icon" name={iconName} size="sm" />}
      {children}
    </span>
  );
}
