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
import { LLM_DRAWER } from './llm-drawer.token';

let nextId = 0;

/**
 * Slide-in drawer panel using the native `<dialog>` element.
 * Supports left, right, top, and bottom positions with focus trap,
 * Escape to close, and backdrop click to close.
 * Compose with `llm-drawer-header`, `llm-drawer-content`, and `llm-drawer-footer`.
 *
 * Usage:
 * ```html
 * <llm-button (click)="isOpen = true">Open</llm-button>
 * <llm-drawer [(open)]="isOpen" position="right">
 *   <llm-drawer-header>Settings</llm-drawer-header>
 *   <llm-drawer-content>Content here.</llm-drawer-content>
 *   <llm-drawer-footer>
 *     <llm-button variant="primary" (click)="isOpen = false">Save</llm-button>
 *   </llm-drawer-footer>
 * </llm-drawer>
 * ```
 */
@Component({
  selector: 'llm-drawer',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LLM_DRAWER,
      useFactory: (drawer: LlmDrawer) => ({
        headerId: drawer.headerId,
        close: () => drawer.open.set(false),
      }),
      deps: [LlmDrawer],
    },
  ],
  template: `
    <dialog
      #dialogEl
      [attr.aria-labelledby]="headerId"
      aria-modal="true"
      [cdkTrapFocus]="open()"
      (cancel)="onCancel($event)"
      (close)="open.set(false)"
      (click)="onBackdropClick($event)"
    >
      <div class="panel" (click)="$event.stopPropagation()">
        <ng-content />
      </div>
    </dialog>
  `,
  styleUrl: './llm-drawer.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmDrawer {
  /** Whether the drawer is open. Supports two-way binding: [(open)]="isOpen". */
  readonly open = model(false);

  /** Which edge the drawer slides in from. */
  readonly position = input<'left' | 'right' | 'top' | 'bottom'>('right');

  /** Width (for left/right) or height (for top/bottom) of the panel. */
  readonly size = input<'sm' | 'md' | 'lg' | 'full'>('md');

  /** Whether clicking the backdrop closes the drawer. */
  readonly closeOnBackdrop = input(true);

  /** @internal — referenced by LlmDrawerHeader via LLM_DRAWER token */
  readonly headerId = `llm-drawer-header-${nextId}`;

  protected readonly drawerId = `llm-drawer-${nextId++}`;
  protected readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly triggerEl = signal<HTMLElement | null>(null);

  protected readonly hostClasses = computed(
    () =>
      `position-${this.position()} size-${this.size()}${this.open() ? ' is-open' : ''}`
  );

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
 * Header slot for `llm-drawer`. Contains the title and a close button.
 * Automatically receives the correct `id` for `aria-labelledby` association.
 */
@Component({
  selector: 'llm-drawer-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    <button
      class="close-btn"
      type="button"
      aria-label="Close drawer"
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
  styleUrl: './llm-drawer.css',
  host: {
    '[attr.id]': 'context.headerId',
  },
})
export class LlmDrawerHeader {
  protected readonly context = inject(LLM_DRAWER);
}

/**
 * Content slot for `llm-drawer`. Scrollable primary content area.
 */
@Component({
  selector: 'llm-drawer-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-drawer.css',
})
export class LlmDrawerContent {}

/**
 * Footer slot for `llm-drawer`. Renders at the bottom with action buttons.
 */
@Component({
  selector: 'llm-drawer-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-drawer.css',
})
export class LlmDrawerFooter {}
