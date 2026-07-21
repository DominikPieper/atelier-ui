import { HTMLAttributes } from 'react';
import type { AtlIconName, AtlIconSize, AtlIconSpec } from '../spec';
import './atl-icon.css';

const ICON_GLYPHS: Record<AtlIconName, string> = {
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
 * Properties for the AtlIcon component.
 */
export interface AtlIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'aria-label'>,
    AtlIconSpec {
  /** The icon name. */
  name: AtlIconName;
  /** The icon size. */
  size?: AtlIconSize;
  /**
   * Accessible label. When provided, the icon is announced as an image with
   * this label. When omitted, the icon is hidden from assistive tech.
   */
  label?: string;
}

/**
 * Pictogram glyph icon. 21 named variants matching the Figma `AtlIcon`
 * component set. Decorative by default; pass `label` to announce a meaning
 * to assistive tech.
 */
export function AtlIcon({
  name,
  size = 'md',
  label,
  className,
  ...rest
}: AtlIconProps) {
  const classes = ['atl-icon', `size-${size}`, className].filter(Boolean).join(' ');
  const accessibilityProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true as const };
  return (
    <span className={classes} {...accessibilityProps} {...rest}>
      {ICON_GLYPHS[name]}
    </span>
  );
}
