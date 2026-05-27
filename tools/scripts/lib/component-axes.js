'use strict';
/**
 * Shared map of the CSS-/default-bearing spec axis unions to their component
 * directory. Consumed by check-variants.js (CSS class parity) and
 * check-defaults.js (cross-framework default parity) so the two gates agree on
 * which unions exist and where they live. The directory cannot always be
 * derived from the type name (LlmTabGroupVariant lives in `tabs`,
 * LlmToastContainerPosition in `toast`), hence the explicit map.
 */
const UNION_TO_COMPONENT = {
  LlmButtonVariant: 'button',
  LlmButtonSize: 'button',
  LlmBadgeVariant: 'badge',
  LlmBadgeSize: 'badge',
  LlmAvatarSize: 'avatar',
  LlmAvatarShape: 'avatar',
  LlmCardVariant: 'card',
  LlmAlertVariant: 'alert',
  LlmDialogSize: 'dialog',
  LlmTabGroupVariant: 'tabs',
  LlmAccordionGroupVariant: 'accordion',
  LlmMenuVariant: 'menu',
  LlmTooltipPosition: 'tooltip',
  LlmToastVariant: 'toast',
  LlmToastContainerPosition: 'toast',
  LlmSkeletonVariant: 'skeleton',
  LlmProgressVariant: 'progress',
  LlmProgressSize: 'progress',
  LlmDrawerPosition: 'drawer',
  LlmDrawerSize: 'drawer',
  LlmTableVariant: 'table',
  LlmTableSize: 'table',
  LlmIconSize: 'icon',
  LlmChatVariant: 'chat',
};

/** Axis suffix -> CSS class prefix AND the prop name that carries the axis. */
const AXIS_PREFIX = {
  Variant: 'variant',
  Size: 'size',
  Shape: 'shape',
  Position: 'position',
  Orientation: 'orientation',
};

/** The `Llm<Component><Axis>` suffix for a union type name, or null. */
function axisOf(unionName) {
  const m = /(Variant|Size|Shape|Position|Orientation)$/.exec(unionName);
  return m ? m[1] : null;
}

module.exports = { UNION_TO_COMPONENT, AXIS_PREFIX, axisOf };
