import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

/**
 * Inline notification banner with semantic color variants and optional dismiss button.
 *
 * Usage:
 * ```html
 * <llm-alert variant="success">Your changes were saved.</llm-alert>
 * <llm-alert variant="warning" [dismissible]="true" (dismissed)="onDismiss()">
 *   Your session expires soon.
 * </llm-alert>
 * ```
 */
@Component({
  selector: 'llm-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="content"><ng-content /></span>
    @if (dismissible()) {
      <button class="dismiss" type="button" aria-label="Dismiss" (click)="dismiss()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    }
  `,
  styleUrl: './llm-alert.css',
  host: {
    '[class]': 'hostClasses()',
    role: 'alert',
    '[attr.aria-live]': 'variant() === "danger" ? "assertive" : "polite"',
  },
})
export class LlmAlert {
  /** Semantic color variant of the alert. */
  variant = input<'info' | 'success' | 'warning' | 'danger'>('info');

  /** Whether to show a dismiss button. */
  dismissible = input(false);

  /** Emitted when the dismiss button is clicked. */
  dismissed = output<void>();

  protected hostClasses = computed(() => `variant-${this.variant()}`);

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
