import { HTMLAttributes } from 'react';
import type { AtlIconName, AtlIconSize, AtlIconSpec } from '../spec';
import { ATL_ICON_GEOMETRY, ATL_ICON_STROKE_WIDTH, ATL_ICON_VIEWBOX } from '../icons';
import './atl-icon.css';


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
 * Vector icon. 23 named variants, drawn from the geometry in `icons.ts` so the
 * same shape is used everywhere it appears. Matches the Figma `AtlIcon`
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
  const geometry = ATL_ICON_GEOMETRY[name];
  const stroke = geometry.kind === 'stroke';
  return (
    <span className={classes} {...accessibilityProps} {...rest}>
      <svg
        viewBox={ATL_ICON_VIEWBOX}
        fill={stroke ? 'none' : 'currentColor'}
        stroke={stroke ? 'currentColor' : undefined}
        strokeWidth={stroke ? ATL_ICON_STROKE_WIDTH : undefined}
        strokeLinecap={stroke ? 'round' : undefined}
        strokeLinejoin={stroke ? 'round' : undefined}
        aria-hidden="true"
        focusable="false"
      >
        {geometry.paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
