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
import { AtlIcon } from '../icon/atl-icon';

let nextId = 0;

/**
 * Accessible multiline text input component for use with Angular Signal Forms.
 *
 * Usage:
 * ```html
 * <atl-textarea placeholder="Enter a description" [(value)]="description" />
 * <atl-textarea [formField]="form.bio" [rows]="4" />
 * <atl-textarea label="Bio" [(value)]="bio" />
 * ```
 */
@Component({
  selector: 'atl-textarea',
  standalone: true,
  imports: [TextFieldModule, AtlIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <label [attr.for]="inputId()">{{ label() }}</label>
    }
    <div class="textarea-field">
      <textarea
        [attr.id]="inputId() || null"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="touched.set(true)"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-describedby]="showErrors() ? errorId : null"
        [cdkTextareaAutosize]="autoResize()"
        [cdkAutosizeMinRows]="rows()"
      ></textarea>
      @if (invalid()) {
        <atl-icon name="danger" size="sm" class="invalid-icon" />
      }
    </div>
    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './atl-textarea.css',
  host: {
    '[class]': 'hostClasses()',
    // See atl-input.ts's identical host binding for why: a static `id="…"`
    // attribute matches the `id` input AND stays on this host element, which
    // would duplicate the id this component puts on the native `<textarea>`
    // and break `<label for>` association (the host is not labelable and is
    // first in document order). Force the host's own `id` attribute to
    // always be absent.
    '[attr.id]': 'null',
    // Same reasoning, same fix, for `aria-label` — see atl-input.ts.
    '[attr.aria-label]': 'null',
  },
})
export class AtlTextarea implements FormValueControl<string> {
  /** The current textarea value. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** Number of visible text rows. */
  readonly rows = input(3);

  /**
   * Visible caption rendered as a `<label>` associated with the textarea via
   * `for`/`id`. Omit it when the field is captioned some other way (an
   * external `<label>`, or `aria-label`) — without one of these the textarea
   * has no accessible name.
   */
  readonly label = input('');

  /**
   * Accessible name for the native textarea, for when there is no visible
   * `label`. An aliased input rather than a plain host attribute — see
   * `atl-input.ts`'s identical `ariaLabel` for why.
   */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  /** Placeholder text shown when the textarea is empty. */
  readonly placeholder = input('');

  /**
   * Explicit id for the native textarea. Wins over the auto-generated id —
   * set this when something outside this component (an external
   * `<label for>`, or `aria-describedby` from elsewhere on the page) needs a
   * known, stable id to point at.
   */
  readonly id = input('');

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
  protected readonly errorId = `atl-textarea-errors-${nextId++}`;

  /**
   * @internal
   * Fallback id, used only when the caller does not supply one. Same
   * module-scoped counter idiom as `errorId` above and as every other
   * Angular form control in this lib — see `atl-input.ts`'s `generatedId`
   * for the honest account of what guarantee this idiom actually gives
   * (same-module-instance uniqueness, not `useId()`-equivalent SSR safety).
   */
  private readonly generatedId = `atl-textarea-${nextId++}`;

  /** @internal */
  protected readonly inputId = computed(
    () => this.id() || (this.label() ? this.generatedId : '')
  );

  /** @internal */
  /**
   * The message renders when there is a message. Gating it on `touched` as well was
   * an Angular-only rule: `touched` is not in the spec contract and React and Vue have
   * no equivalent, so the same four fields showed their errors at three different
   * moments depending on the framework. Deciding *when* to pass errors belongs to the
   * form layer, which is where `touched` lives (ADR-0055).
   */
  protected readonly showErrors = computed(
    () => this.errors().length > 0
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
