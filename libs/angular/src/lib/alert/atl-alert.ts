import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { AtlIcon } from '../icon/atl-icon';

/**
 * Inline notification banner with semantic color variants and optional dismiss button.
 *
 * Usage:
 * ```html
 * <atl-alert variant="success">Your changes were saved.</atl-alert>
 * <atl-alert variant="warning" [dismissible]="true" (dismissed)="onDismiss()">
 *   Your session expires soon.
 * </atl-alert>
 * ```
 */
// Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
// was the fifth way this library drew an icon, and the one check:iconography
// missed (ADR-0050).
const VARIANT_ICON_NAMES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
} as const;

@Component({
  selector: 'atl-alert',
  standalone: true,
  imports: [AtlIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="content">
      <atl-icon class="variant-icon" [name]="variantIcon()" size="sm" />
      <ng-content />
    </span>
    @if (isDismissible) {
      <button class="dismiss" type="button" aria-label="Dismiss" (click)="dismiss()">
        <atl-icon name="close" size="sm" />
      </button>
    }
  `,
  styleUrl: './atl-alert.css',
  host: {
    '[class]': 'hostClassesValue',
    role: 'alert',
    '[attr.aria-live]': 'ariaLive',
  },
})
export class AtlAlert {
  /** Semantic color variant of the alert. */
  readonly variant = input<'info' | 'success' | 'warning' | 'danger'>('info');

  /** Whether to show a dismiss button. */
  readonly dismissible = input(false);

  /** Emitted when the dismiss button is clicked. */
  readonly dismissed = output<void>();

  protected readonly hostClasses = computed(() => `variant-${this.variant()}`);

  protected readonly variantIcon = computed(() => VARIANT_ICON_NAMES[this.variant()]);

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
