import { CSSProperties, HTMLAttributes } from 'react';
import type { AtlSkeletonSpec } from '../spec';
import './atl-skeleton.css';

/**
 * Properties for the AtlSkeleton component.
 */
export interface AtlSkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    AtlSkeletonSpec {
  /**
   * The visual style variant of the skeleton.
   */
  variant?: 'text' | 'circular' | 'rectangular';
  /**
   * The width of the skeleton.
   */
  width?: string;
  /**
   * The height of the skeleton.
   */
  height?: string;
  /**
   * Whether the skeleton should be animated.
   */
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

/**
 * A placeholder component used to represent content while it's loading.
 */
export function AtlSkeleton({
  variant = 'text',
  width = '100%',
  height,
  animated = true,
  className,
  style,
  ...rest
}: AtlSkeletonProps) {
  const classes = ['atl-skeleton', `variant-${variant}`, animated && 'is-animated', className]
    .filter(Boolean).join(' ');
  const computedHeight = computeHeight(variant, width, height);
  const inlineStyle: CSSProperties = { ...style, width, height: computedHeight };
  return <div className={classes} style={inlineStyle} aria-hidden="true" {...rest} />;
}
