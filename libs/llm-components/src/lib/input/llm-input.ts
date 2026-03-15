import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalField } from '@angular/forms/signals';

let nextId = 0;

/**
 * Accessible text input component for use with Angular Signal Forms.
 *
 * Usage:
 * ```html
 * <llm-input type="email" placeholder="you@example.com" [(value)]="email" />
 * <llm-input [formField]="loginForm.email" placeholder="Email" />
 * ```
 */
@Component({
  selector: 'llm-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      [type]="type()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="touched.set(true)"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [placeholder]="placeholder()"
      [attr.name]="name() || null"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-required]="required() || null"
      [attr.aria-describedby]="showErrors() ? errorId : null"
    />
    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-input.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmInput implements FormValueControl<string> {
  /** The current input value. Bound by [formField] directive. Supports [(value)] two-way binding. */
  value = model('');

  /** The type of input field. */
  type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');

  /** Placeholder text shown when the input is empty. */
  placeholder = input('');

  /** Whether the input is disabled. Bound by [formField] directive. */
  disabled = input(false);

  /** Whether the input is read-only. Bound by [formField] directive. */
  readonly = input(false);

  /** Whether the input has validation errors. Bound by [formField] directive. */
  invalid = input(false);

  /** Validation errors from the form system. Bound by [formField] directive. */
  errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  /** Whether the user has interacted with the input. Bound by [formField] directive. */
  touched = model(false);

  /** Whether the input is required. Bound by [formField] directive. */
  required = input(false);

  /** The input's name attribute. Bound by [formField] directive. */
  name = input('');

  /** @internal */
  protected readonly errorId = `llm-input-errors-${nextId++}`;

  /** @internal */
  protected showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0
  );

  /** @internal */
  protected hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.disabled()) classes.push('is-disabled');
    if (this.invalid()) classes.push('is-invalid');
    if (this.readonly()) classes.push('is-readonly');
    if (this.touched()) classes.push('is-touched');
    return classes.join(' ');
  });

  /** @internal */
  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
