import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import type { AtlIconName, AtlBadgeVariant } from '../spec';
import { AtlIcon } from '../icon/atl-icon';

// Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
// was the fifth way this library drew an icon, and the one check:icon-duplication
// missed (ADR-0050).
const VARIANT_ICON_NAMES: Partial<Record<AtlBadgeVariant, AtlIconName>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/**
 * Inline badge for labeling items with semantic color variants.
 *
 * Decorative by default: it carries no ARIA role. When the badge announces a
 * change (a count or state that updates), pass `role="status"` yourself.
 *
 * Usage:
 * ```html
 * <atl-badge variant="success">Active</atl-badge>
 * <atl-badge variant="danger" size="sm">Error</atl-badge>
 * <atl-badge variant="warning" role="status">3 pending</atl-badge>
 * ```
 */
@Component({
  selector: 'atl-badge',
  standalone: true,
  imports: [AtlIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variantIcon(); as icon) {
      <atl-icon class="variant-icon" [name]="icon" size="sm" />
    }
    <ng-content />
  `,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/badge/atl-badge.css',
  host: {
    class: 'atl-badge',
    '[class]': 'hostClasses()',
  },
})
export class AtlBadge {
  /** Semantic color variant of the badge. */
  readonly variant = input<
    'default' | 'success' | 'warning' | 'danger' | 'info'
  >('default');

  /** Size of the badge. */
  readonly size = input<'sm' | 'md'>('md');

  protected readonly hostClasses = computed(
    () => `variant-${this.variant()} size-${this.size()}`,
  );

  protected readonly variantIcon = computed(
    () => VARIANT_ICON_NAMES[this.variant()],
  );
}
