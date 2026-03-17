import { CSSProperties, HTMLAttributes } from 'react';
import './llm-skeleton.css';

export interface LlmSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  animated?: boolean;
}

function computeHeight(variant: string, width: string, height?: string): string {
  if (height) return height;
  switch (variant) {
    case 'text':
      return '1em';
    case 'circular':
      return width;
    case 'rectangular':
      return '100px';
    default:
      return '1em';
  }
}

export function LlmSkeleton({
  variant = 'text',
  width = '100%',
  height,
  animated = true,
  className,
  style,
  ...rest
}: LlmSkeletonProps) {
  const classes = ['llm-skeleton', `variant-${variant}`, animated && 'is-animated', className]
    .filter(Boolean).join(' ');
  const computedHeight = computeHeight(variant, width, height);
  const inlineStyle: CSSProperties = { ...style, width, height: computedHeight };
  return <div className={classes} style={inlineStyle} aria-hidden="true" {...rest} />;
}
