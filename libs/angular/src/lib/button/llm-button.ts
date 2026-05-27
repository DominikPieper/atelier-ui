import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import type { LlmButtonVariant, LlmButtonSize } from '../spec';

/**
 * Accessible button component with visual variants and sizes.
 *
 * Usage:
 * ```html
 * <llm-button variant="primary" size="md" (click)="save()">Save</llm-button>
 * <llm-button variant="outline" [disabled]="true">Cancel</llm-button>
 * <llm-button [loading]="isSaving">Saving…</llm-button>
 * ```
 */
@Component({
  selector: 'llm-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styleUrl: './llm-button.css',
  host: {
    role: 'button',
    '[class]': 'hostClasses()',
    '[attr.aria-disabled]': 'isDisabled()',
    '[attr.disabled]': 'isDisabled() ? true : null',
  },
})
export class LlmButton {
  /** Visual style of the button. */
  readonly variant = input<LlmButtonVariant>('primary');

  /** Size of the button. */
  readonly size = input<LlmButtonSize>('md');

  /** Disables the button, preventing interaction. */
  readonly disabled = input(false);

  /** Shows a loading spinner and disables interaction. */
  readonly loading = input(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly hostClasses = computed(
    () =>
      `variant-${this.variant()} size-${this.size()}${this.isDisabled() ? ' is-disabled' : ''}${this.loading() ? ' is-loading' : ''}`
  );

  /** @internal — host element ref for the dev-mode a11y check. */
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Suppress clicks while disabled/loading. The host is a custom element, so
    // — unlike a native `<button disabled>` — neither the `disabled` attribute
    // nor `pointer-events: none` reliably blocks click dispatch (the latter only
    // affects pointer-driven clicks, not programmatic/keyboard ones). A real
    // click lands on projected content (a descendant), so a capture-phase
    // listener on the host intercepts it before any consumer `(click)` handler
    // bound on the host (which fires in the bubble phase), matching the
    // React/Vue native-disabled behavior.
    const host = this.el.nativeElement;
    const guard = (event: Event) => {
      if (this.isDisabled()) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
    host.addEventListener('click', guard, true);
    this.destroyRef.onDestroy(() => host.removeEventListener('click', guard, true));

    // Dev-mode warning when a button has no accessible name. Angular's
    // <ng-content> projection means we can't enforce this at the type
    // level (unlike the React adapter), so we check after first render.
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      afterNextRender(() => {
        const host = this.el.nativeElement;
        const hasText = host.textContent.trim().length > 0;
        const hasAriaLabel = host.hasAttribute('aria-label')
          || host.hasAttribute('aria-labelledby');
        if (!hasText && !hasAriaLabel) {
          console.warn(
            '[LlmButton] icon-only button is missing an accessible name — '
              + 'add an aria-label attribute so screen readers announce its purpose.',
            host,
          );
        }
      });
    }
  }
}

// Angular's compiler injects this global; declare so TS doesn't complain.
declare const ngDevMode: unknown;
