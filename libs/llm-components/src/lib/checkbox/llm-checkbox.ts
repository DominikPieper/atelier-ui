import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalField } from '@angular/forms/signals';

let nextId = 0;

/**
 * Accessible checkbox component for use with Angular Signal Forms.
 *
 * Usage:
 * ```html
 * <llm-checkbox [(checked)]="accepted">I agree to the terms</llm-checkbox>
 * <llm-checkbox [formField]="form.accepted">Accept</llm-checkbox>
 * ```
 */
@Component({
  selector: 'llm-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [attr.for]="inputId">
      <input
        #nativeInput
        type="checkbox"
        [id]="inputId"
        [checked]="checked()"
        (change)="onChange($event)"
        (blur)="touched.set(true)"
        [disabled]="disabled()"
        [attr.name]="name() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-describedby]="showErrors() ? errorId : null"
      />
      <ng-content />
    </label>
    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-checkbox.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmCheckbox implements FormCheckboxControl {
  /** The checked state. Bound by [formField] directive. Supports [(checked)] two-way binding. */
  readonly checked = model(false);

  /** Whether the user has interacted with the input. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Tri-state indeterminate mode (e.g. "select all"). Set via DOM property. */
  readonly indeterminate = input(false);

  /** Whether the checkbox is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the checkbox has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Whether the checkbox is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** The input's name attribute. Bound by [formField] directive. */
  readonly name = input('');

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  /** @internal */
  protected readonly inputId = `llm-checkbox-${nextId++}`;

  /** @internal */
  protected readonly errorId = `llm-checkbox-errors-${nextId++}`;

  /** @internal */
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  /** @internal */
  protected readonly showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0
  );

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.checked()) classes.push('is-checked');
    if (this.disabled()) classes.push('is-disabled');
    if (this.invalid()) classes.push('is-invalid');
    if (this.touched()) classes.push('is-touched');
    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      const el = this.nativeInput()?.nativeElement;
      if (el) {
        el.indeterminate = this.indeterminate();
      }
    });
  }

  /** @internal */
  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
