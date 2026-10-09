import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import type { AtlButtonVariant, AtlButtonSize } from '../spec';

/** Native `type` attribute of the button. */
export type AtlButtonType = 'button' | 'submit' | 'reset';

/**
 * Accessible button component with visual variants and sizes. An attribute
 * component on a native `<button>`: focus, Tab order, Enter/Space activation and
 * form submission are the browser's own.
 *
 * Usage:
 * ```html
 * <button atl-button variant="primary" size="md" (click)="save()">Save</button>
 * <button atl-button variant="outline" [disabled]="true">Cancel</button>
 * <button atl-button type="submit" [loading]="isSaving">Saving…</button>
 * ```
 */
@Component({
  selector: 'button[atl-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/button/atl-button.css',
  host: {
    class: 'atl-button',
    '[class]': 'hostClasses()',
    '[attr.type]': 'type()',
    '[disabled]': 'isDisabled()',
    '[attr.aria-disabled]': 'isDisabled() || null',
  },
})
export class AtlButton {
  /** Visual style of the button. */
  readonly variant = input<AtlButtonVariant>('primary');

  /** Size of the button. */
  readonly size = input<AtlButtonSize>('md');

  /** Disables the button, preventing interaction. */
  readonly disabled = input(false);

  /** Shows a loading spinner and disables interaction. */
  readonly loading = input(false);

  /** Native `type` attribute of the button. */
  readonly type = input<AtlButtonType>('button');

  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  protected readonly hostClasses = computed(
    () =>
      `variant-${this.variant()} size-${this.size()}${this.isDisabled() ? ' is-disabled' : ''}${this.loading() ? ' is-loading' : ''}`,
  );

  /** @internal — host element ref for the dev-mode a11y check. */
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Dev-mode warning when a button has no accessible name. Angular's
    // <ng-content> projection means we can't enforce this at the type
    // level (unlike the React adapter), so we check after first render.
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      afterNextRender(() => {
        const host = this.el.nativeElement;
        const hasText = host.textContent.trim().length > 0;
        const hasAriaLabel =
          host.hasAttribute('aria-label') ||
          host.hasAttribute('aria-labelledby');
        if (!hasText && !hasAriaLabel) {
          console.warn(
            '[AtlButton] icon-only button is missing an accessible name — ' +
              'add an aria-label attribute so screen readers announce its purpose.',
            host,
          );
        }
      });
    }
  }
}

// Angular's compiler injects this global; declare so TS doesn't complain.
declare const ngDevMode: unknown;
