import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
}
