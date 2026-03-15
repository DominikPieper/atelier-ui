import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalField } from '@angular/forms/signals';

let nextId = 0;

/**
 * Accessible toggle (switch) component for use with Angular Signal Forms.
 * Presents as a pill-shaped on/off slider instead of a checkbox box,
 * but has identical boolean semantics and implements FormCheckboxControl.
 *
 * Usage:
 * ```html
 * <llm-toggle [(checked)]="enabled">Enable notifications</llm-toggle>
 * <llm-toggle [formField]="form.enabled">Enable</llm-toggle>
 * ```
 */
@Component({
  selector: 'llm-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [attr.for]="inputId">
      <input
        type="checkbox"
        role="switch"
        [id]="inputId"
        [checked]="checked()"
        (change)="onChange($event)"
        (blur)="touched.set(true)"
        [disabled]="disabled()"
        [attr.name]="name() || null"
        [attr.aria-checked]="checked()"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-describedby]="showErrors() ? errorId : null"
      />
      <span class="track" aria-hidden="true">
        <span class="thumb"></span>
      </span>
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
  styleUrl: './llm-toggle.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmToggle implements FormCheckboxControl {
  /** The checked state. Bound by [formField] directive. Supports [(checked)] two-way binding. */
  readonly checked = model(false);

  /** Whether the user has interacted with the input. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Whether the toggle is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the toggle has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Whether the toggle is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** The input's name attribute. Bound by [formField] directive. */
  readonly name = input('');

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  /** @internal */
  protected readonly inputId = `llm-toggle-${nextId++}`;

  /** @internal */
  protected readonly errorId = `llm-toggle-errors-${nextId++}`;

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

  /** @internal */
  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
  }
}
