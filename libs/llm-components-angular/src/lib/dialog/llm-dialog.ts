import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LLM_DIALOG } from './llm-dialog.token';

let nextId = 0;

/**
 * Accessible modal dialog using the native `<dialog>` element.
 * Includes focus trap, Escape to close, backdrop click to close, and animation.
 * Compose with `llm-dialog-header`, `llm-dialog-content`, and `llm-dialog-footer`.
 *
 * Usage:
 * ```html
 * <llm-dialog [(open)]="isOpen">
 *   <llm-dialog-header>Dialog Title</llm-dialog-header>
 *   <llm-dialog-content>Dialog body content.</llm-dialog-content>
 *   <llm-dialog-footer>
 *     <llm-button variant="primary" (click)="isOpen = false">Confirm</llm-button>
 *   </llm-dialog-footer>
 * </llm-dialog>
 * ```
 */
@Component({
  selector: 'llm-dialog',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LLM_DIALOG,
      useFactory: (dialog: LlmDialog) => ({
      headerId: dialog.headerId,
      close: () => dialog.open.set(false),
    }),
      deps: [LlmDialog],
    },
  ],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogEl
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabel() ? null : (ariaLabelledby() || headerId)"
      aria-modal="true"
      [cdkTrapFocus]="open()"
      (cancel)="onCancel($event)"
      (click)="onBackdropClick($event)"
    >
      <div [class]="panelClass()">
        <ng-content />
      </div>
    </dialog>
  `,
  styleUrl: './llm-dialog.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmDialog {
  /** Whether the dialog is open. Supports two-way binding: [(open)]="isOpen". */
  readonly open = model(false);

  /** Whether clicking the backdrop closes the dialog. */
  readonly closeOnBackdrop = input(true);

  /** Size of the dialog panel. */
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  /** Accessible label for the dialog (use instead of aria-labelledby when no header is present). */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  /** ID of the element that labels the dialog (defaults to the llm-dialog-header id). */
  readonly ariaLabelledby = input('', { alias: 'aria-labelledby' });

  /** @internal — referenced by LlmDialogHeader via LLM_DIALOG token */
  readonly headerId = `llm-dialog-header-${nextId}`;

  protected readonly dialogId = `llm-dialog-${nextId++}`;
  protected readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly triggerEl = signal<HTMLElement | null>(null);

  protected readonly panelClass = computed(() => `panel size-${this.size()}`);
  protected readonly hostClasses = computed(() => (this.open() ? 'is-open' : ''));

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        this.triggerEl.set(document.activeElement as HTMLElement);
        dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
        this.triggerEl()?.focus();
        this.triggerEl.set(null);
      }
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.open.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === this.dialogRef()?.nativeElement) {
      this.open.set(false);
    }
  }

}

/**
 * Header slot for `llm-dialog`. Renders above content with a bottom separator.
 * Automatically receives the correct `id` for `aria-labelledby` association.
 */
@Component({
  selector: 'llm-dialog-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <button
      class="close-btn"
      type="button"
      aria-label="Close dialog"
      (click)="context.close()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  `,
  styleUrl: './llm-dialog.css',
  host: {
    '[attr.id]': 'context.headerId',
  },
})
export class LlmDialogHeader {
  protected readonly context = inject(LLM_DIALOG);
}

/**
 * Content slot for `llm-dialog`. Scrollable primary content area.
 */
@Component({
  selector: 'llm-dialog-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-dialog.css',
})
export class LlmDialogContent {}

/**
 * Footer slot for `llm-dialog`. Renders below content, typically holds action buttons.
 */
@Component({
  selector: 'llm-dialog-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-dialog.css',
})
export class LlmDialogFooter {}
