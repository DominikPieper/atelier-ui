import { HTMLAttributes } from 'react';
import './llm-progress.css';

export interface LlmProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

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
