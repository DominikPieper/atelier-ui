import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injectable,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/** Variant types for toast notifications. */
export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/** Options for creating a toast notification. */
export interface ToastOptions {
  variant?: ToastVariant;
  /** Duration in ms before auto-dismiss. 0 = no auto-dismiss. Default 5000. */
  duration?: number;
  /** Whether the toast shows a dismiss button. Default true. */
  dismissible?: boolean;
}

/** Internal data for a toast instance. */
export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  dismissible: boolean;
}

let toastId = 0;

/**
 * Service for showing transient toast notifications.
 *
 * Usage:
 * ```typescript
 * const toast = inject(LlmToastService);
 * toast.show('Saved successfully', { variant: 'success' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LlmToastService {
  readonly toasts = signal<ToastData[]>([]);

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Show a toast notification.
   * @returns The unique id of the toast, which can be used with `dismiss()`.
   */
  show(message: string, options?: ToastOptions): string {
    const id = `llm-toast-${toastId++}`;
    const toast: ToastData = {
      id,
      message,
      variant: options?.variant ?? 'default',
      duration: options?.duration ?? 5000,
      dismissible: options?.dismissible ?? true,
    };

    this.toasts.update((list) => [...list, toast]);

    if (toast.duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), toast.duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  /** Dismiss a single toast by id. */
  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Clear all active toasts. */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toasts.set([]);
  }
}

/**
 * Individual toast notification.
 *
 * Typically rendered by `llm-toast-container`, but can also be used standalone.
 */
@Component({
  selector: 'llm-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="message">{{ message() }}</span>
    @if (dismissible()) {
      <button class="dismiss" type="button" aria-label="Dismiss" (click)="onDismiss()">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    }
  `,
  styleUrl: './llm-toast.css',
  host: {
    '[class]': 'hostClasses()',
    role: 'status',
  },
})
export class LlmToast {
  /** Semantic color variant. */
  readonly variant = input<ToastVariant>('default');

  /** Whether to show a dismiss button. */
  readonly dismissible = input(true);

  /** The message to display. */
  readonly message = input('');

  /** Unique identifier for this toast. */
  readonly toastId = input('');

  /** Emitted when the toast is dismissed by the user. */
  readonly dismissed = output<string>();

  protected readonly hostClasses = computed(() => `variant-${this.variant()}`);

  protected onDismiss(): void {
    this.dismissed.emit(this.toastId());
  }
}

/**
 * Container that renders the toast stack at a fixed viewport position.
 * Place once in your app root or layout component.
 *
 * Usage:
 * ```html
 * <llm-toast-container position="bottom-right" />
 * ```
 */
@Component({
  selector: 'llm-toast-container',
  standalone: true,
  imports: [LlmToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <llm-toast
        [variant]="toast.variant"
        [dismissible]="toast.dismissible"
        [message]="toast.message"
        [toastId]="toast.id"
        (dismissed)="toastService.dismiss($event)"
      />
    }
  `,
  styleUrl: './llm-toast-container.css',
  host: {
    '[class]': 'hostClasses()',
    'aria-live': 'polite',
    role: 'status',
  },
})
export class LlmToastContainer {
  protected readonly toastService = inject(LlmToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Position of the toast stack on the viewport. */
  readonly position = input<'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'>('bottom-right');

  protected readonly hostClasses = computed(() => `position-${this.position()}`);

  constructor() {
    this.destroyRef.onDestroy(() => this.toastService.clear());
  }
}
