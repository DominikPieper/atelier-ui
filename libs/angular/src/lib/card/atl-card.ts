import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * Card container component supporting elevated, outlined, and flat visual variants.
 * Compose with `atl-card-header`, `atl-card-content`, and `atl-card-footer` sub-components.
 *
 * Usage:
 * ```html
 * <atl-card variant="elevated" padding="md">
 *   <atl-card-header>Card Title</atl-card-header>
 *   <atl-card-content>Main content goes here.</atl-card-content>
 *   <atl-card-footer>
 *     <button atl-button variant="primary">Save</button>
 *   </atl-card-footer>
 * </atl-card>
 * ```
 */
@Component({
  selector: 'atl-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/card/atl-card.css',
  host: {
    class: 'atl-card',
    '[class]': 'hostClasses()',
    '[attr.role]': 'role() || null',
  },
})
export class AtlCard {
  /** Visual style of the card. */
  readonly variant = input<'elevated' | 'outlined' | 'flat'>('elevated');

  /** Internal padding of the card. */
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Opt-in landmark role. Default is no role.
   *
   * - `'article'` — self-contained content (blog post, comment).
   * - `'region'`  — perceivable area that needs a screen-reader stop;
   *                 pair with `aria-label`.
   * - `'section'` — mirrors an HTML `<section>`.
   *
   * Most cards group content visually and shouldn't add a landmark.
   * Leave unset by default.
   */
  readonly role = input<'article' | 'region' | 'section' | undefined>(
    undefined,
  );

  protected readonly hostClasses = computed(
    () => `variant-${this.variant()} padding-${this.padding()}`,
  );
}

/**
 * Header slot for `atl-card`. Renders above the main content with a bottom separator.
 *
 * Usage:
 * ```html
 * <atl-card-header>Card Title</atl-card-header>
 * ```
 */
@Component({
  selector: 'atl-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/card/atl-card.css',
  host: { class: 'atl-card-header' },
})
export class AtlCardHeader {}

/**
 * Content slot for `atl-card`. Primary content area of the card.
 *
 * Usage:
 * ```html
 * <atl-card-content>Body text here.</atl-card-content>
 * ```
 */
@Component({
  selector: 'atl-card-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/card/atl-card.css',
  host: { class: 'atl-card-content' },
})
export class AtlCardContent {}

/**
 * Footer slot for `atl-card`. Renders below the main content, typically holds actions.
 *
 * Usage:
 * ```html
 * <atl-card-footer>
 *   <button atl-button variant="primary">Save</button>
 * </atl-card-footer>
 * ```
 */
@Component({
  selector: 'atl-card-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/card/atl-card.css',
  host: { class: 'atl-card-footer' },
})
export class AtlCardFooter {}
