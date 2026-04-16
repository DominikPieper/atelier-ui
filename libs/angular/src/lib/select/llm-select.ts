import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ActiveDescendantKeyManager, Highlightable } from '@angular/cdk/a11y';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { DomPortal } from '@angular/cdk/portal';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';
import { LLM_SELECT, type LlmSelectContext } from './llm-select.token';

/** @internal — Wrapper item for ActiveDescendantKeyManager integration. */
class SelectOptionItem implements Highlightable {
  disabled: boolean;

  constructor(
    readonly id: string,
    readonly value: string,
    readonly labelText: string,
    disabled: boolean,
    private readonly activeOptionId: import('@angular/core').WritableSignal<string | null>,
  ) {
    this.disabled = disabled;
  }

  getLabel(): string {
    return this.labelText;
  }

  setActiveStyles(): void {
    this.activeOptionId.set(this.id);
  }

  setInactiveStyles(): void {
    // Handled by key manager — no-op here
  }
}

let nextId = 0;

/**
 * Accessible dropdown select component for use with Angular Signal Forms.
 * Uses the CDK Overlay for viewport-aware panel positioning.
 *
 * Usage:
 * ```html
 * <llm-select [(value)]="country" placeholder="Select a country">
 *   <llm-option optionValue="us">United States</llm-option>
 *   <llm-option optionValue="ca">Canada</llm-option>
 * </llm-select>
 *
 * <!-- With Signal Forms -->
 * <llm-select [formField]="form.country" placeholder="Select a country">
 *   <llm-option optionValue="us">United States</llm-option>
 * </llm-select>
 * ```
 */
@Component({
  selector: 'llm-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="trigger"
      [id]="triggerId"
      [attr.aria-expanded]="isOpen()"
      aria-haspopup="listbox"
      [attr.aria-controls]="panelId"
      [attr.aria-activedescendant]="activeOptionId()"
      [attr.aria-invalid]="invalid() || null"
      [attr.disabled]="disabled() || null"
      (click)="onTriggerClick()"
      (blur)="onTriggerBlur()"
    >
      <span class="trigger-text">{{ selectedLabel() || placeholder() }}</span>
      <span class="trigger-icon" aria-hidden="true">▾</span>
    </button>

    <div
      #panel
      [id]="panelId"
      role="listbox"
      class="panel"
      [attr.aria-labelledby]="triggerId"
    >
      <ng-content />
    </div>

    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-select.css',
  host: {
    role: 'combobox',
    '[class]': 'hostClasses()',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: LLM_SELECT, useExisting: LlmSelect }],
})
export class LlmSelect implements FormValueControl<string>, LlmSelectContext, OnDestroy {
  /** The selected value. Bound by [formField] directive. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** Whether the user has interacted. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Placeholder text shown when no option is selected. */
  readonly placeholder = input('');

  /** Whether the select is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the select has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Whether the select is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** The input's name attribute. Bound by [formField] directive. */
  readonly name = input('');

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** @internal */
  readonly activeOptionId = signal<string | null>(null);

  /** @internal */
  protected readonly isOpen = signal(false);

  /** @internal */
  protected readonly optionsList = signal<
    { id: string; value: string; labelText: string; disabled: boolean }[]
  >([]);

  /** @internal */
  protected readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly triggerId = `llm-select-trigger-${nextId}`;

  /** @internal */
  protected readonly panelId = `llm-select-panel-${nextId}`;

  /** @internal */
  protected readonly errorId = `llm-select-errors-${nextId++}`;

  /** @internal */
  protected readonly selectedLabel = computed(
    () => this.optionsList().find((o) => o.value === this.value())?.labelText ?? ''
  );

  /** @internal */
  protected readonly showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0
  );

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.isOpen()) classes.push('is-open');
    if (this.disabled()) classes.push('is-disabled');
    if (this.invalid()) classes.push('is-invalid');
    if (this.touched()) classes.push('is-touched');
    return classes.join(' ');
  });

  /** @internal */
  private keyManager: ActiveDescendantKeyManager<SelectOptionItem> | null = null;

  private overlayRef: OverlayRef | null = null;
  private outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** @internal — called by LlmOption on init */
  registerOption(id: string, value: string, labelText: string, disabled: boolean): void {
    this.optionsList.update((list) => [...list, { id, value, labelText, disabled }]);
  }

  /** @internal — called by LlmOption on destroy */
  unregisterOption(id: string): void {
    this.optionsList.update((list) => list.filter((o) => o.id !== id));
  }

  /** @internal — called by LlmOption on select */
  select(v: string): void {
    if (!this.disabled()) {
      this.value.set(v);
      this.close();
    }
  }

  /** @internal — called by LlmOption on interaction */
  markTouched(): void {
    this.touched.set(true);
  }

  /** @internal */
  protected onTriggerClick(): void {
    if (this.disabled()) return;
    if (this.isOpen()) { this.close(); } else { this.open(); }
  }

  /** @internal */
  protected onTriggerBlur(): void {
    if (!this.isOpen()) {
      this.touched.set(true);
    }
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        } else {
          const activeItem = this.keyManager?.activeItem as SelectOptionItem | null | undefined;
          if (activeItem) {
            this.select(activeItem.value);
          }
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.close();
        break;
      }
      default: {
        const isNav = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key);
        const isTypeahead = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
        if ((isNav || isTypeahead) && !this.isOpen()) {
          this.open();
          if (isNav) return; // open() already sets active item
        }
        this.keyManager?.onKeydown(event);
      }
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }

  private open(): void {
    const panel = this.panelRef();
    if (!panel) return;

    if (!this.overlayRef) {
      this.overlayRef = this.createOverlay();
    }

    this.overlayRef.attach(new DomPortal(panel.nativeElement));
    panel.nativeElement.classList.add('is-open');
    this.overlayRef.updatePosition();
    this.isOpen.set(true);

    // (Re)create key manager with current options
    const items = this.optionsList().map(
      (o) => new SelectOptionItem(o.id, o.value, o.labelText, o.disabled, this.activeOptionId),
    );
    this.keyManager = new ActiveDescendantKeyManager(items)
      .withWrap()
      .withTypeAhead(500)
      .withHomeAndEnd()
      .withVerticalOrientation();

    // Set active option to currently selected or first enabled
    const selectedIdx = items.findIndex((i) => i.value === this.value() && !i.disabled);
    const firstEnabledIdx = items.findIndex((i) => !i.disabled);
    const activeIdx = selectedIdx >= 0 ? selectedIdx : firstEnabledIdx;
    if (activeIdx >= 0) {
      this.keyManager.setActiveItem(activeIdx);
    }

    // Outside click — check host AND panel (panel is in overlay container, outside host)
    this.outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !this.elementRef.nativeElement.contains(target) &&
        !panel.nativeElement.contains(target)
      ) {
        this.close();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  private close(): void {
    const panel = this.panelRef();
    if (panel) {
      panel.nativeElement.classList.remove('is-open');
    }
    this.overlayRef?.detach();
    this.isOpen.set(false);
    this.activeOptionId.set(null);
    this.keyManager = null;

    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }

  private createOverlay(): OverlayRef {
    const triggerEl = this.elementRef.nativeElement.querySelector<HTMLElement>('.trigger')!;

    const positionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      triggerEl,
    )
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ])
      .withFlexibleDimensions(false)
      .withPush(true);

    const scrollStrategy = createRepositionScrollStrategy(this.injector);

    return createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy,
      minWidth: triggerEl.offsetWidth,
    });
  }
}
