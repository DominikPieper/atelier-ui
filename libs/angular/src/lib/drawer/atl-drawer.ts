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
import { ATL_DRAWER } from './atl-drawer.token';

let nextId = 0;

/**
 * Slide-in drawer panel using the native `<dialog>` element.
 * Supports left, right, top, and bottom positions with focus trap,
 * Escape to close, and backdrop click to close.
 * Compose with `atl-drawer-header`, `atl-drawer-content`, and `atl-drawer-footer`.
 *
 * Usage:
 * ```html
 * <atl-button (click)="isOpen = true">Open</atl-button>
 * <atl-drawer [(open)]="isOpen" position="right">
 *   <atl-drawer-header>Settings</atl-drawer-header>
 *   <atl-drawer-content>Content here.</atl-drawer-content>
 *   <atl-drawer-footer>
 *     <atl-button variant="primary" (click)="isOpen = false">Save</atl-button>
 *   </atl-drawer-footer>
 * </atl-drawer>
 * ```
 */
@Component({
  selector: 'atl-drawer',
  standalone: true,
  imports: [A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ATL_DRAWER,
      useFactory: (drawer: AtlDrawer) => ({
        headerId: drawer.headerId,
        close: () => drawer.open.set(false),
      }),
      deps: [AtlDrawer],
    },
  ],
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <dialog
      #dialogEl
      [attr.aria-labelledby]="headerId"
      aria-modal="true"
      [cdkTrapFocus]="open()"
      (cancel)="onCancel($event)"
      (close)="open.set(false)"
      (click)="onBackdropClick($event)"
    >
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
      <div class="panel" (click)="$event.stopPropagation()">
        <ng-content />
      </div>
    </dialog>
  `,
  styleUrl: './atl-drawer.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AtlDrawer {
  /** Whether the drawer is open. Supports two-way binding: [(open)]="isOpen". */
  readonly open = model(false);

  /** Which edge the drawer slides in from. */
  readonly position = input<'left' | 'right' | 'top' | 'bottom'>('right');

  /** Width (for left/right) or height (for top/bottom) of the panel. */
  readonly size = input<'sm' | 'md' | 'lg' | 'full'>('md');

  /** Whether clicking the backdrop closes the drawer. */
  readonly closeOnBackdrop = input(true);

  /** @internal — referenced by AtlDrawerHeader via ATL_DRAWER token */
  readonly headerId = `atl-drawer-header-${nextId}`;

  protected readonly drawerId = `atl-drawer-${nextId++}`;
  protected readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly triggerEl = signal<HTMLElement | null>(null);

  protected readonly hostClasses = computed(
    () =>
      `atl-drawer position-${this.position()} size-${this.size()}${this.open() ? ' is-open' : ''}`
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
 * Header slot for `atl-drawer`. Contains the title and a close button.
 * Automatically receives the correct `id` for `aria-labelledby` association.
 */
@Component({
  selector: 'atl-drawer-header',
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
  styleUrl: './atl-drawer.css',
  host: {
    class: 'atl-drawer-header',
    '[attr.id]': 'context.headerId',
  },
})
export class AtlDrawerHeader {
  protected readonly context = inject(ATL_DRAWER);
}

/**
 * Content slot for `atl-drawer`. Scrollable primary content area.
 */
@Component({
  selector: 'atl-drawer-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './atl-drawer.css',
  host: { class: 'atl-drawer-content' },
})
export class AtlDrawerContent {}

/**
 * Footer slot for `atl-drawer`. Renders at the bottom with action buttons.
 */
@Component({
  selector: 'atl-drawer-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './atl-drawer.css',
  host: { class: 'atl-drawer-footer' },
})
export class AtlDrawerFooter {}
