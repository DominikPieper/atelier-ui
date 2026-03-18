import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { LlmButtonVariant, LlmButtonSize } from '@llm-components/llm-components-spec';

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
  variant = input<LlmButtonVariant>('primary');

  /** Size of the button. */
  size = input<LlmButtonSize>('md');

  /** Disables the button, preventing interaction. */
  disabled = input(false);

  /** Shows a loading spinner and disables interaction. */
  loading = input(false);

  protected isDisabled = computed(() => this.disabled() || this.loading());

  protected hostClasses = computed(
    () =>
      `variant-${this.variant()} size-${this.size()}${this.isDisabled() ? ' is-disabled' : ''}${this.loading() ? ' is-loading' : ''}`
  );
}
