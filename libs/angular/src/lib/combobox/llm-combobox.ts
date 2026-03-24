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
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';
import type { LlmComboboxOption } from '@atelier-ui/spec';

let nextId = 0;

/**
 * Filterable autocomplete combobox. Accepts an `options` array and emits the
 * selected option's `value`. The user types to narrow the list; selecting an
 * option commits the value and displays its label.
 *
 * Usage:
 * ```html
 * <llm-combobox
 *   [(value)]="country"
 *   [options]="countryOptions"
 *   placeholder="Search country…"
 * />
 *
 * <!-- With Signal Forms -->
 * <llm-combobox [formField]="form.country" [options]="countryOptions" />
 * ```
 */
@Component({
  selector: 'llm-combobox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="combobox-wrapper">
      <input
        #inputEl
        class="combobox-input"
        type="text"
        autocomplete="off"
        role="combobox"
        [id]="inputId"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="panelId"
        aria-autocomplete="list"
        [attr.aria-activedescendant]="activeOptionId()"
        [attr.aria-invalid]="invalid() || null"
        [attr.disabled]="disabled() || null"
        [attr.required]="required() || null"
        [attr.name]="name() || null"
        [placeholder]="placeholder()"
        [value]="query()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />
      <span class="combobox-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>

    <ul
      #panel
      [id]="panelId"
      popover="manual"
      role="listbox"
      class="panel"
      [attr.aria-labelledby]="inputId"
    >
      @for (option of filteredOptions(); track option.value; let i = $index) {
        <li
          [id]="optionId(i)"
          role="option"
          class="option"
          [class.is-active]="activeIndex() === i"
          [class.is-selected]="option.value === value()"
          [class.is-disabled]="option.disabled"
          [attr.aria-selected]="option.value === value()"
          [attr.aria-disabled]="option.disabled || null"
          (mousedown)="onOptionSelect(option)"
          (mouseenter)="activeIndex.set(i)"
        >
          <span>{{ option.label }}</span>
          @if (option.value === value()) {
            <svg class="option-check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          }
        </li>
      }
      @if (filteredOptions().length === 0) {
        <li class="no-results" role="option" aria-disabled="true">No results found.</li>
      }
    </ul>

    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-combobox.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmCombobox implements FormValueControl<string> {
  /** The selected value. Supports [(value)] two-way binding and [formField] directive. */
  readonly value = model('');

  /** Whether the user has interacted. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Options to display and filter. */
  readonly options = input<LlmComboboxOption[]>([]);

  /** Placeholder text for the input. */
  readonly placeholder = input('');

  /** Whether the combobox is disabled. */
  readonly disabled = input(false);

  /** Whether the combobox has validation errors. */
  readonly invalid = input(false);

  /** Whether the combobox is required. */
  readonly required = input(false);

  /** The input's name attribute. */
  readonly name = input('');

  /** Validation errors from the form system. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** @internal */
  protected readonly query = signal('');

  /** @internal */
  protected readonly isOpen = signal(false);

  /** @internal */
  protected readonly activeIndex = signal(-1);

  /** @internal */
  protected readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  /** @internal */
  protected readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  /** @internal */
  protected readonly inputId = `llm-combobox-input-${nextId}`;

  /** @internal */
  protected readonly panelId = `llm-combobox-panel-${nextId}`;

  /** @internal */
  protected readonly errorId = `llm-combobox-errors-${nextId++}`;

  /** @internal */
  protected readonly filteredOptions = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  /** @internal */
  protected readonly activeOptionId = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 ? this.optionId(idx) : null;
  });

  /** @internal */
  protected readonly showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0,
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

  private outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  protected optionId(index: number): string {
    return `${this.panelId}-option-${index}`;
  }

  /** @internal */
  protected onInput(event: Event): void {
    const q = (event.target as HTMLInputElement).value;
    this.query.set(q);
    this.activeIndex.set(-1);
    if (q === '') {
      this.value.set('');
    }
    if (!this.isOpen()) this.open();
  }

  /** @internal */
  protected onFocus(): void {
    if (!this.disabled()) this.open();
  }

  /** @internal */
  protected onBlur(): void {
    // Revert query to selected label (or clear if nothing selected)
    const selectedOption = this.options().find((o) => o.value === this.value());
    this.query.set(selectedOption?.label ?? '');
    this.touched.set(true);
    // close() is called via outside-click handler; blur alone doesn't close
    // (mousedown on option fires before blur, so selection still works)
  }

  /** @internal */
  protected onOptionSelect(option: LlmComboboxOption): void {
    if (option.disabled || this.disabled()) return;
    this.value.set(option.value);
    this.query.set(option.label);
    this.touched.set(true);
    this.close();
    this.inputEl()?.nativeElement.focus();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    const filtered = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen()) { this.open(); return; }
        const next = this.activeIndex() + 1;
        this.activeIndex.set(next >= filtered.length ? 0 : next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isOpen()) { this.open(); return; }
        const prev = this.activeIndex() - 1;
        this.activeIndex.set(prev < 0 ? filtered.length - 1 : prev);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const idx = this.activeIndex();
        if (this.isOpen() && idx >= 0 && idx < filtered.length) {
          this.onOptionSelect(filtered[idx]);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        const selectedOption = this.options().find((o) => o.value === this.value());
        this.query.set(selectedOption?.label ?? '');
        this.close();
        break;
      }
      case 'Tab': {
        this.close();
        break;
      }
    }
  }

  private open(): void {
    const panel = this.panelRef();
    if (!panel || this.isOpen()) return;
    (panel.nativeElement as HTMLElement & { showPopover(): void }).showPopover();
    this.isOpen.set(true);
    this.activeIndex.set(-1);

    this.outsideClickHandler = (e: MouseEvent) => {
      if (!this.elementRef.nativeElement.contains(e.target as Node)) {
        this.close();
      }
    };
    document.addEventListener('click', this.outsideClickHandler);
  }

  private close(): void {
    const panel = this.panelRef();
    if (!panel || !this.isOpen()) return;
    try {
      (panel.nativeElement as HTMLElement & { hidePopover(): void }).hidePopover();
    } catch {
      // Panel may already be hidden
    }
    this.isOpen.set(false);
    this.activeIndex.set(-1);

    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }
}
