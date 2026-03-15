import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalField } from '@angular/forms/signals';
import { LLM_SELECT, type LlmSelectContext } from './llm-select.token';

let nextId = 0;

/**
 * Accessible dropdown select component for use with Angular Signal Forms.
 * Uses the native Popover API for the panel overlay.
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
      [attr.popovertarget]="panelId"
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
      popover="manual"
      role="listbox"
      class="panel"
      [attr.aria-labelledby]="triggerId"
      (toggle)="onPanelToggle($event)"
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
export class LlmSelect implements FormValueControl<string>, LlmSelectContext {
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
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

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

  /** @internal — type-ahead buffer */
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  private outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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
    this.isOpen() ? this.close() : this.open();
  }

  /** @internal */
  protected onTriggerBlur(): void {
    if (!this.isOpen()) {
      this.touched.set(true);
    }
  }

  /** @internal */
  protected onPanelToggle(event: Event): void {
    const toggleEvent = event as ToggleEvent;
    if (toggleEvent.newState === 'closed') {
      this.isOpen.set(false);
      this.activeOptionId.set(null);
    }
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const enabledOptions = this.optionsList().filter((o) => !o.disabled);
    if (enabledOptions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
          return;
        }
        const currentIdx = enabledOptions.findIndex((o) => o.id === this.activeOptionId());
        const nextIdx = currentIdx < enabledOptions.length - 1 ? currentIdx + 1 : 0;
        this.activeOptionId.set(enabledOptions[nextIdx].id);
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
          return;
        }
        const currentIdx = enabledOptions.findIndex((o) => o.id === this.activeOptionId());
        const prevIdx = currentIdx > 0 ? currentIdx - 1 : enabledOptions.length - 1;
        this.activeOptionId.set(enabledOptions[prevIdx].id);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
          return;
        }
        const active = enabledOptions.find((o) => o.id === this.activeOptionId());
        if (active) {
          this.select(active.value);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.close();
        break;
      }
      case 'Home': {
        event.preventDefault();
        if (!this.isOpen()) this.open();
        this.activeOptionId.set(enabledOptions[0]?.id ?? null);
        break;
      }
      case 'End': {
        event.preventDefault();
        if (!this.isOpen()) this.open();
        this.activeOptionId.set(enabledOptions[enabledOptions.length - 1]?.id ?? null);
        break;
      }
      default: {
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.handleTypeahead(event.key, enabledOptions);
        }
      }
    }
  }

  private handleTypeahead(
    char: string,
    enabledOptions: { id: string; value: string; labelText: string; disabled: boolean }[]
  ): void {
    if (!this.isOpen()) this.open();
    this.typeaheadBuffer += char.toLowerCase();

    if (this.typeaheadTimer !== null) clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
      this.typeaheadTimer = null;
    }, 500);

    const match = enabledOptions.find((o) =>
      o.labelText.toLowerCase().startsWith(this.typeaheadBuffer)
    );
    if (match) {
      this.activeOptionId.set(match.id);
    }
  }

  private open(): void {
    const panel = this.panelRef();
    if (!panel) return;
    (panel.nativeElement as HTMLElement & { showPopover(): void }).showPopover();
    this.isOpen.set(true);

    // Set active option to currently selected or first enabled
    const enabledOptions = this.optionsList().filter((o) => !o.disabled);
    const selectedOption = enabledOptions.find((o) => o.value === this.value());
    this.activeOptionId.set(selectedOption?.id ?? enabledOptions[0]?.id ?? null);

    // Outside click listener
    this.outsideClickHandler = (e: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(e.target as Node)) {
        this.close();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  private close(): void {
    const panel = this.panelRef();
    if (!panel) return;
    try {
      (panel.nativeElement as HTMLElement & { hidePopover(): void }).hidePopover();
    } catch {
      // Panel may already be hidden
    }
    this.isOpen.set(false);
    this.activeOptionId.set(null);

    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }
}
