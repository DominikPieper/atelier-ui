import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Loading placeholder that mimics the shape of content while it loads.
 *
 * Usage:
 * ```html
 * <llm-skeleton />
 * <llm-skeleton variant="circular" width="40px" />
 * <llm-skeleton variant="rectangular" height="200px" />
 * ```
 */
@Component({
  selector: 'llm-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  styleUrl: './llm-skeleton.css',
  host: {
    '[class]': 'hostClasses()',
    '[style.width]': 'width()',
    '[style.height]': 'computedHeight()',
    'aria-hidden': 'true',
  },
})
export class LlmSkeleton {
  /** Shape variant of the skeleton placeholder. */
  readonly variant = input<'text' | 'circular' | 'rectangular'>('text');

  /** CSS width of the skeleton. */
  readonly width = input('100%');

  /** CSS height — when empty, a sensible default is chosen per variant. */
  readonly height = input('');

  /** Whether the shimmer animation is active. */
  readonly animated = input(true);

  protected readonly computedHeight = computed(() => {
    if (this.height()) return this.height();
    switch (this.variant()) {
      case 'text':
        return '1em';
      case 'circular':
        return this.width();
      case 'rectangular':
        return '100px';
    }
  });

  protected readonly hostClasses = computed(() => {
    const classes = [`variant-${this.variant()}`];
    if (this.animated()) classes.push('is-animated');
    return classes.join(' ');
  });
}
