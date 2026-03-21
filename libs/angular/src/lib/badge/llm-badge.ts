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
 * <llm-badge variant="success">Active</llm-badge>
 * <llm-badge variant="danger" size="sm">Error</llm-badge>
 * <llm-badge variant="warning">Pending</llm-badge>
 * ```
 */
@Component({
  selector: 'llm-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-badge.css',
  host: {
    '[class]': 'hostClasses()',
    role: 'status',
  },
})
export class LlmBadge {
  /** Semantic color variant of the badge. */
  readonly variant = input<'default' | 'success' | 'warning' | 'danger' | 'info'>('default');

  /** Size of the badge. */
  readonly size = input<'sm' | 'md'>('md');

  protected readonly hostClasses = computed(
    () => `variant-${this.variant()} size-${this.size()}`
  );
}
