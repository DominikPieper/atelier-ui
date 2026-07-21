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
import { ATL_DIALOG } from './atl-dialog.token';

let nextId = 0;

/**
 * Accessible modal dialog using the native `<dialog>` element.
 * Includes focus trap, Escape to close, backdrop click to close, and animation.
 * Compose with `atl-dialog-header`, `atl-dialog-content`, and `atl-dialog-footer`.
 *
 * Usage:
 * ```html
 * <atl-dialog [(open)]="isOpen">
 *   <atl-dialog-header>Dialog Title</atl-dialog-header>
 *   <atl-dialog-content>Dialog body content.</atl-dialog-content>
 *   <atl-dialog-footer>
 *     <atl-button variant="primary" (click)="isOpen = false">Confirm</atl-button>
 *   </atl-dialog-footer>
 * </atl-dialog>
 * ```
 */
@Component({
  selector: 'atl-dialog',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ATL_DIALOG,
      useFactory: (dialog: AtlDialog) => ({
      headerId: dialog.headerId,
      close: () => dialog.open.set(false),
    }),
      deps: [AtlDialog],
    },
  ],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogEl
      class="atl-dialog"
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
  styleUrl: './atl-dialog.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AtlDialog {
  /** Whether the dialog is open. Supports two-way binding: [(open)]="isOpen". */
  readonly open = model(false);

  /** Whether clicking the backdrop closes the dialog. */
  readonly closeOnBackdrop = input(true);

  /** Size of the dialog panel. */
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');

  /** Accessible label for the dialog (use instead of aria-labelledby when no header is present). */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  /** ID of the element that labels the dialog (defaults to the atl-dialog-header id). */
  readonly ariaLabelledby = input('', { alias: 'aria-labelledby' });

  /** @internal — referenced by AtlDialogHeader via ATL_DIALOG token */
  readonly headerId = `atl-dialog-header-${nextId}`;

  protected readonly dialogId = `atl-dialog-${nextId++}`;
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
 * Header slot for `atl-dialog`. Renders above content with a bottom separator.
 * Automatically receives the correct `id` for `aria-labelledby` association.
 */
@Component({
  selector: 'atl-dialog-header',
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
  styleUrl: './atl-dialog.css',
  host: {
    class: 'atl-dialog-header',
    '[attr.id]': 'context.headerId',
  },
})
export class AtlDialogHeader {
  protected readonly context = inject(ATL_DIALOG);
}

/**
 * Content slot for `atl-dialog`. Scrollable primary content area.
 */
@Component({
  selector: 'atl-dialog-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './atl-dialog.css',
  host: { class: 'atl-dialog-content' },
})
export class AtlDialogContent {}

/**
 * Footer slot for `atl-dialog`. Renders below content, typically holds action buttons.
 */
@Component({
  selector: 'atl-dialog-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './atl-dialog.css',
  host: { class: 'atl-dialog-footer' },
})
export class AtlDialogFooter {}
