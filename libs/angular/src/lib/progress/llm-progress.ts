import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Progress bar with determinate and indeterminate states.
 *
 * Usage:
 * ```html
 * <llm-progress [value]="75" />
 * <llm-progress variant="success" [value]="100" />
 * <llm-progress [indeterminate]="true" />
 * ```
 */
@Component({
  selector: 'llm-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="track">
      <div class="fill" [style.width]="fillWidth()"></div>
    </div>
  `,
  styleUrl: './llm-progress.css',
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clampedValue()',
    '[attr.aria-valuemax]': 'indeterminate() ? null : max()',
    '[class]': 'hostClasses()',
  },
})
export class LlmProgress {
  /** Current value of the progress bar. */
  readonly value = input<number>(0);

  /** Maximum value. */
  readonly max = input<number>(100);

  /** Semantic color variant. */
  readonly variant = input<'default' | 'success' | 'warning' | 'danger'>('default');

  /** Height size of the track. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Shows an animated indeterminate state (loading). */
  readonly indeterminate = input(false);

  protected readonly clampedValue = computed(() =>
    Math.min(Math.max(this.value(), 0), this.max())
  );

  protected readonly fillWidth = computed(() =>
    this.indeterminate()
      ? '100%'
      : `${(this.clampedValue() / this.max()) * 100}%`
  );

  protected readonly hostClasses = computed(
    () =>
      `variant-${this.variant()} size-${this.size()}${this.indeterminate() ? ' is-indeterminate' : ''}`
  );
}
