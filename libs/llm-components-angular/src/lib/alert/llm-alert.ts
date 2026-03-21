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
    @if (isDismissible) {
      <button class="dismiss" type="button" aria-label="Dismiss" (click)="dismiss()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    }
  `,
  styleUrl: './llm-alert.css',
  host: {
    '[class]': 'hostClassesValue',
    role: 'alert',
    '[attr.aria-live]': 'ariaLive',
  },
})
export class LlmAlert {
  /** Semantic color variant of the alert. */
  readonly variant = input<'info' | 'success' | 'warning' | 'danger'>('info');

  /** Whether to show a dismiss button. */
  readonly dismissible = input(false);

  /** Emitted when the dismiss button is clicked. */
  readonly dismissed = output<void>();

  protected readonly hostClasses = computed(() => `variant-${this.variant()}`);

  /** @internal */
  get isDismissible(): boolean {
    return this.dismissible();
  }

  /** @internal */
  get hostClassesValue(): string {
    return this.hostClasses();
  }

  /** @internal */
  get ariaLive(): string {
    return this.variant() === 'danger' ? 'assertive' : 'polite';
  }

  protected dismiss(): void {
    this.dismissed.emit();
  }
}
