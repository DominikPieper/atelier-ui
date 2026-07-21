import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

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
const VARIANT_ICONS: Record<'default' | 'success' | 'warning' | 'danger' | 'info', string | null> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

@Component({
  selector: 'atl-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variantIcon(); as icon) {
      <span class="variant-icon" aria-hidden="true">{{ icon }}</span>
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

  protected readonly variantIcon = computed(() => VARIANT_ICONS[this.variant()]);
}
