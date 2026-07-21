import { HTMLAttributes } from 'react';
import type { AtlProgressSpec } from '../spec';
import './atl-progress.css';

/**
 * Properties for the AtlProgress component.
 */
export interface AtlProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    AtlProgressSpec {
  /**
   * The current progress value.
   */
  value?: number;
  /**
   * The maximum progress value.
   */
  max?: number;
  /**
   * The visual style variant of the progress bar.
   */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /**
   * The size of the progress bar.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the progress bar is in an indeterminate state.
   */
  indeterminate?: boolean;
  /**
   * Accessible name for the progress bar — rendered as `aria-label`.
   * Required by ARIA when there is no visible label nearby.
   */
  label?: string;
}

/**
 * A progress bar component for displaying task progress.
 */
export function AtlProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  label,
  className,
  ...rest
}: AtlProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const fillWidth = indeterminate ? '100%' : `${(clampedValue / max) * 100}%`;

  const classes = [
    'atl-progress',
    `variant-${variant}`,
    `size-${size}`,
    indeterminate && 'is-indeterminate',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuenow={indeterminate ? undefined : clampedValue}
      aria-valuemax={indeterminate ? undefined : max}
      {...rest}
    >
      <div className="track">
        <div className="fill" style={{ width: fillWidth }} />
      </div>
    </div>
  );
}
