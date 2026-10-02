import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Progress bar with determinate and indeterminate states.
 *
 * Usage:
 * ```html
 * <atl-progress [value]="75" />
 * <atl-progress variant="success" [value]="100" />
 * <atl-progress [indeterminate]="true" />
 * ```
 */
@Component({
  selector: 'atl-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="track">
      <div class="fill" [style.width]="fillWidth()"></div>
    </div>
  `,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/progress/atl-progress.css',
  host: {
    class: 'atl-progress',
    role: 'progressbar',
    'aria-valuemin': '0',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clampedValue()',
    '[attr.aria-valuemax]': 'indeterminate() ? null : max()',
    '[attr.aria-label]': 'label() || null',
    '[class]': 'hostClasses()',
  },
})
export class AtlProgress {
  /** Current value of the progress bar. */
  readonly value = input<number>(0);

  /** Maximum value. */
  readonly max = input<number>(100);

  /** Semantic color variant. */
  readonly variant = input<'default' | 'success' | 'warning' | 'danger'>(
    'default',
  );

  /** Height size of the track. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Shows an animated indeterminate state (loading). */
  readonly indeterminate = input(false);

  /**
   * Accessible name — rendered as `aria-label` on the host.
   * Required by ARIA when there is no visible label nearby.
   */
  readonly label = input<string | undefined>(undefined);

  protected readonly clampedValue = computed(() =>
    Math.min(Math.max(this.value(), 0), this.max()),
  );

  protected readonly fillWidth = computed(() =>
    this.indeterminate()
      ? '100%'
      : `${(this.clampedValue() / this.max()) * 100}%`,
  );

  protected readonly hostClasses = computed(
    () =>
      `variant-${this.variant()} size-${this.size()}${this.indeterminate() ? ' is-indeterminate' : ''}`,
  );
}
