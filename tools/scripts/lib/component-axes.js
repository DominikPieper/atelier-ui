'use strict';
/**
 * Shared map of the CSS-/default-bearing spec axis unions to their component
 * directory. Consumed by check-variants.js (CSS class parity) and
 * check-defaults.js (cross-framework default parity) so the two gates agree on
 * which unions exist and where they live. The directory cannot always be
 * derived from the type name (AtlTabGroupVariant lives in `tabs`,
 * AtlToastContainerPosition in `toast`), hence the explicit map.
 */
const UNION_TO_COMPONENT = {
  AtlButtonVariant: 'button',
  AtlButtonSize: 'button',
  AtlBadgeVariant: 'badge',
  AtlBadgeSize: 'badge',
  AtlAvatarSize: 'avatar',
  AtlAvatarShape: 'avatar',
  AtlCardVariant: 'card',
  AtlAlertVariant: 'alert',
  AtlDialogSize: 'dialog',
  AtlTabGroupVariant: 'tabs',
  AtlAccordionGroupVariant: 'accordion',
  AtlMenuVariant: 'menu',
  AtlTooltipPosition: 'tooltip',
  AtlToastVariant: 'toast',
  AtlToastContainerPosition: 'toast',
  AtlSkeletonVariant: 'skeleton',
  AtlProgressVariant: 'progress',
  AtlProgressSize: 'progress',
  AtlDrawerPosition: 'drawer',
  AtlDrawerSize: 'drawer',
  AtlTableVariant: 'table',
  AtlTableSize: 'table',
  AtlIconSize: 'icon',
  AtlChatVariant: 'chat',
};

/** Axis suffix -> CSS class prefix AND the prop name that carries the axis. */
const AXIS_PREFIX = {
  Variant: 'variant',
  Size: 'size',
  Shape: 'shape',
  Position: 'position',
  Orientation: 'orientation',
};

/** The `Atl<Component><Axis>` suffix for a union type name, or null. */
function axisOf(unionName) {
  const m = /(Variant|Size|Shape|Position|Orientation)$/.exec(unionName);
  return m ? m[1] : null;
}

module.exports = { UNION_TO_COMPONENT, AXIS_PREFIX, axisOf };
