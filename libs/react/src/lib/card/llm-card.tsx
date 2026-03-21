import { HTMLAttributes, ReactNode } from 'react';
import type { LlmCardSpec } from '@atelier-ui/spec';
import './llm-card.css';

/**
 * Properties for the LlmCard component.
 */
export interface LlmCardProps
  extends HTMLAttributes<HTMLDivElement>,
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
