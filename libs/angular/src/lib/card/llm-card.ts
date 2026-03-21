import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Card container component supporting elevated, outlined, and flat visual variants.
 * Compose with `llm-card-header`, `llm-card-content`, and `llm-card-footer` sub-components.
 *
 * Usage:
 * ```html
 * <llm-card variant="elevated" padding="md">
 *   <llm-card-header>Card Title</llm-card-header>
 *   <llm-card-content>Main content goes here.</llm-card-content>
 *   <llm-card-footer>
 *     <llm-button variant="primary">Save</llm-button>
 *   </llm-card-footer>
 * </llm-card>
 * ```
 */
@Component({
  selector: 'llm-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-card.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmCard {
  /** Visual style of the card. */
  readonly variant = input<'elevated' | 'outlined' | 'flat'>('elevated');

  /** Internal padding of the card. */
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');

  protected readonly hostClasses = computed(
    () => `variant-${this.variant()} padding-${this.padding()}`
  );
}

/**
 * Header slot for `llm-card`. Renders above the main content with a bottom separator.
 *
 * Usage:
 * ```html
 * <llm-card-header>Card Title</llm-card-header>
 * ```
 */
@Component({
  selector: 'llm-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-card.css',
})
export class LlmCardHeader {}

/**
 * Content slot for `llm-card`. Primary content area of the card.
 *
 * Usage:
 * ```html
 * <llm-card-content>Body text here.</llm-card-content>
 * ```
 */
@Component({
  selector: 'llm-card-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-card.css',
})
export class LlmCardContent {}

/**
 * Footer slot for `llm-card`. Renders below the main content, typically holds actions.
 *
 * Usage:
 * ```html
 * <llm-card-footer>
 *   <llm-button variant="primary">Save</llm-button>
 * </llm-card-footer>
 * ```
 */
@Component({
  selector: 'llm-card-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-card.css',
})
export class LlmCardFooter {}
