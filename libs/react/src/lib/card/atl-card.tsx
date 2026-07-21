import { HTMLAttributes, ReactNode } from 'react';
import type { AtlCardSpec, AtlCardRole } from '../spec';
import './atl-card.css';

/**
 * Properties for the AtlCard component.
 */
export interface AtlCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'>,
    AtlCardSpec {
  /**
   * The visual style variant of the card.
   */
  variant?: 'elevated' | 'outlined' | 'flat';
  /**
   * The padding size within the card.
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Opt-in landmark role. Default is no role (plain `<div>`).
   * Pick `'article'` for self-contained content, `'region'` for a
   * perceivable area that needs a screen-reader stop (pair with
   * aria-label), or `'section'` to mirror an HTML `<section>`.
   */
  role?: AtlCardRole;
  /**
   * The content to be rendered inside the card.
   */
  children?: ReactNode;
}

/**
 * A card component for grouping related content.
 */
export function AtlCard({
  variant = 'elevated',
  padding = 'md',
  children,
  className,
  ...rest
}: AtlCardProps) {
  const classes = ['atl-card', `variant-${variant}`, `padding-${padding}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

/**
 * The header component for an AtlCard.
 */
export function AtlCardHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the card header.
   */
  children?: ReactNode;
}) {
  return (
    <div className={['atl-card-header', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

/**
 * The main content component for an AtlCard.
 */
export function AtlCardContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The main content of the card.
   */
  children?: ReactNode;
}) {
  return (
    <div className={['atl-card-content', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

/**
 * The footer component for an AtlCard.
 */
export function AtlCardFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the card footer.
   */
  children?: ReactNode;
}) {
  return (
    <div className={['atl-card-footer', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
