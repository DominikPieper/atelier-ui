import { HTMLAttributes } from 'react';
import type { LlmIconName, LlmIconSize, LlmIconSpec } from '../spec';
import './llm-icon.css';

const ICON_GLYPHS: Record<LlmIconName, string> = {
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
  error: '!',
  'chevron-up': '▲',
  'chevron-down': '▼',
  'chevron-left': '‹',
  'chevron-right': '›',
  'sort-asc': '↑',
  'sort-desc': '↓',
  'arrow-right': '→',
  'arrow-left': '←',
  copy: '⎘',
  paste: '⎗',
  add: '⊕',
  edit: '✏',
  delete: '🗑',
  close: '×',
  more: '…',
  'default-toast': '💬',
};

/**
 * Properties for the LlmIcon component.
 */
export interface LlmIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'aria-label'>,
    LlmIconSpec {
  /** The icon name. */
  name: LlmIconName;
  /** The icon size. */
  size?: LlmIconSize;
  /**
   * Accessible label. When provided, the icon is announced as an image with
   * this label. When omitted, the icon is hidden from assistive tech.
   */
  label?: string;
}

/**
 * Pictogram glyph icon. 21 named variants matching the Figma `LlmIcon`
 * component set. Decorative by default; pass `label` to announce a meaning
 * to assistive tech.
 */
export function LlmIcon({
  name,
  size = 'md',
  label,
  className,
  ...rest
}: LlmIconProps) {
  const classes = ['llm-icon', `size-${size}`, className].filter(Boolean).join(' ');
  const accessibilityProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true as const };
  return (
    <span className={classes} {...accessibilityProps} {...rest}>
      {ICON_GLYPHS[name]}
    </span>
  );
}
