import { HTMLAttributes } from 'react';
import type { LlmProgressSpec } from '@atelier-ui/spec';
import './llm-progress.css';

/**
 * Properties for the LlmProgress component.
 */
export interface LlmProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmProgressSpec {
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
}

/**
 * A progress bar component for displaying task progress.
 */
export function LlmProgress({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  indeterminate = false,
  className,
  ...rest
}: LlmProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const fillWidth = indeterminate ? '100%' : `${(clampedValue / max) * 100}%`;

  const classes = [
    'llm-progress',
    `variant-${variant}`,
    `size-${size}`,
    indeterminate && 'is-indeterminate',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="progressbar"
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
