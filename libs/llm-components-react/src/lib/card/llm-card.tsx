import { HTMLAttributes, ReactNode } from 'react';
import './llm-card.css';

export interface LlmCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

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

export function LlmCardHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={['llm-card-header', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function LlmCardContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={['llm-card-content', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export function LlmCardFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={['llm-card-footer', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
