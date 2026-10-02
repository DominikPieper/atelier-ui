import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Loading placeholder that mimics the shape of content while it loads.
 *
 * Usage:
 * ```html
 * <atl-skeleton />
 * <atl-skeleton variant="circular" width="40px" />
 * <atl-skeleton variant="rectangular" height="200px" />
 * ```
 */
@Component({
  selector: 'atl-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/skeleton/atl-skeleton.css',
  host: {
    class: 'atl-skeleton',
    '[class]': 'hostClasses()',
    '[style.width]': 'width()',
    '[style.height]': 'computedHeight()',
    'aria-hidden': 'true',
  },
})
export class AtlSkeleton {
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
