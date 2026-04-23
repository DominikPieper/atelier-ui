import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';

let nextId = 0;

/**
 * Accessible multiline text input component for use with Angular Signal Forms.
 *
 * Usage:
 * ```html
 * <llm-textarea placeholder="Enter a description" [(value)]="description" />
 * <llm-textarea [formField]="form.bio" [rows]="4" />
 * ```
 */
@Component({
  selector: 'llm-textarea',
  standalone: true,
  imports: [TextFieldModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="textarea-field">
      <textarea
        [value]="value()"
        (input)="onInput($event)"
        (blur)="touched.set(true)"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [attr.name]="name() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-describedby]="showErrors() ? errorId : null"
        [cdkTextareaAutosize]="autoResize()"
        [cdkAutosizeMinRows]="rows()"
      ></textarea>
    </div>
    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-textarea.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmTextarea implements FormValueControl<string> {
  /** The current textarea value. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** Number of visible text rows. */
  readonly rows = input(3);

  /** Placeholder text shown when the textarea is empty. */
  readonly placeholder = input('');

  /** Whether the textarea is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the textarea is read-only. Bound by [formField] directive. */
  readonly readonly = input(false);

  /** Whether the textarea has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** Whether the user has interacted with the textarea. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Whether the textarea is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** The textarea's name attribute. Bound by [formField] directive. */
  readonly name = input('');

  /** Whether to auto-resize the textarea height to fit its content. */
  readonly autoResize = input(false);

  /** @internal */
  protected readonly errorId = `llm-textarea-errors-${nextId++}`;

  /** @internal */
  protected readonly showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0
  );

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.disabled()) classes.push('is-disabled');
    if (this.invalid()) classes.push('is-invalid');
    if (this.readonly()) classes.push('is-readonly');
    if (this.touched()) classes.push('is-touched');
    if (this.autoResize()) classes.push('is-auto-resize');
    return classes.join(' ');
  });

  /** @internal */
  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }
}
