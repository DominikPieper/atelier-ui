import { HTMLAttributes, ReactNode } from 'react';
import type { LlmCardSpec, LlmCardRole } from '../spec';
import './llm-card.css';

/**
 * Properties for the LlmCard component.
 */
export interface LlmCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'role'>,
    LlmCardSpec {
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
  role?: LlmCardRole;
  /**
   * The content to be rendered inside the card.
   */
  children?: ReactNode;
}

/**
 * A card component for grouping related content.
 */
export function LlmCard({
  variant = 'elevated',
  padding = 'md',
  children,
  className,
  ...rest
}: LlmCardProps) {
  const classes = ['llm-card', `variant-${variant}`, `padding-${padding}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

/**
 * The header component for an LlmCard.
 */
export function LlmCardHeader({
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
    <div className={['llm-card-header', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

/**
 * The main content component for an LlmCard.
 */
export function LlmCardContent({
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
    <div className={['llm-card-content', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

/**
 * The footer component for an LlmCard.
 */
export function LlmCardFooter({
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
    <div className={['llm-card-footer', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
