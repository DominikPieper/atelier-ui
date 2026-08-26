import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { AtlIcon } from '../icon/atl-icon';

/**
 * Inline status badge for labeling items with semantic color variants.
 *
 * Usage:
 * ```html
 * <atl-badge variant="success">Active</atl-badge>
 * <atl-badge variant="danger" size="sm">Error</atl-badge>
 * <atl-badge variant="warning">Pending</atl-badge>
 * ```
 */
// Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
// was the fifth way this library drew an icon, and the one check:iconography
// missed (ADR-0050).
const VARIANT_ICON_NAMES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
} as const;

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
  styleUrl: './atl-badge.css',
  host: {
    '[class]': 'hostClasses()',
    role: 'status',
  },
})
export class AtlBadge {
  /** Semantic color variant of the badge. */
  readonly variant = input<'default' | 'success' | 'warning' | 'danger' | 'info'>('default');

  /** Size of the badge. */
  readonly size = input<'sm' | 'md'>('md');

  protected readonly hostClasses = computed(
    () => `variant-${this.variant()} size-${this.size()}`
  );

  protected readonly variantIcon = computed(() => VARIANT_ICON_NAMES[this.variant()]);
}
