import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';
import { AtlIcon } from '../icon/atl-icon';

let nextId = 0;

/**
 * Accessible text input component for use with Angular Signal Forms.
 *
 * Usage:
 * ```html
 * <atl-input type="email" placeholder="you@example.com" [(value)]="email" />
 * <atl-input [formField]="loginForm.email" placeholder="Email" />
 * <atl-input label="Email" type="email" [(value)]="email" />
 * ```
 */
@Component({
  selector: 'atl-input',
  standalone: true,
  imports: [AtlIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <label [attr.for]="inputId()">{{ label() }}</label>
    }
    <div class="input-field">
      <input
        [attr.id]="inputId() || null"
        [type]="type()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="touched.set(true)"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [placeholder]="placeholder()"
        [attr.name]="name() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-required]="required() || null"
        [attr.aria-describedby]="showErrors() ? errorId : null"
      />
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
  styleUrl: './atl-input.css',
  host: {
    '[class]': 'hostClasses()',
    // A static `id="…"` attribute on `<atl-input>` matches the `id` input AND
    // stays as a literal attribute on this host element (Angular keeps static
    // attributes even when they also bind an input) — unlike `[id]="…"`
    // property binding, which does not reflect. Left alone, that host `id`
    // duplicates the one this component puts on the native `<input>`, and
    // since the host is not labelable and comes first in document order,
    // `<label for>` resolves to nothing (`input.labels.length === 0`). Force
    // the host's own `id` attribute to always be absent so `id` unambiguously
    // means "the native input's id", the one place a caller-supplied `id`
    // needs to land for label association to work.
    '[attr.id]': 'null',
    // Same reasoning, same fix, for `aria-label`: force it absent on the host
    // so the alias below (which the compiler recognizes here too) cannot
    // leave a decoy `aria-label` on a roleless element while the native
    // input — the thing that actually needs the accessible name — has none.
    '[attr.aria-label]': 'null',
  },
})
export class AtlInput implements FormValueControl<string> {
  /** The current input value. Bound by [formField] directive. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** The type of input field. */
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');

  /**
   * Visible caption rendered as a `<label>` associated with the input via
   * `for`/`id`. Omit it when the field is captioned some other way (an
   * external `<label>`, or `aria-label`) — without one of these the input
   * has no accessible name.
   */
  readonly label = input('');

  /**
   * Accessible name for the native input, for when there is no visible
   * `label`. An aliased input rather than a plain host attribute: an
   * unrecognized `aria-label="…"` on `<atl-input>` would sit on the host
   * element, which has no role, leaving the actual control unnamed.
   */
  readonly ariaLabel = input('', { alias: 'aria-label' });

  /** Placeholder text shown when the input is empty. */
  readonly placeholder = input('');

  /**
   * Explicit id for the native input. Wins over the auto-generated id — set
   * this when something outside this component (an external `<label for>`,
   * or `aria-describedby` from elsewhere on the page) needs a known, stable
   * id to point at.
   */
  readonly id = input('');

  /** Whether the input is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the input is read-only. Bound by [formField] directive. */
  readonly readonly = input(false);

  /** Whether the input has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** Whether the user has interacted with the input. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Whether the input is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** The input's name attribute. Bound by [formField] directive. */
  readonly name = input('');

  /** @internal */
  protected readonly errorId = `atl-input-errors-${nextId++}`;

  /**
   * @internal
   * Fallback id, used only when the caller does not supply one. A
   * module-scoped counter — the idiom every other Angular form control in
   * this lib already uses for its own ids (checkbox, radio, toggle, select,
   * textarea all do the same `` `atl-<name>-${nextId++}` `` thing for
   * errorId) — rather than reaching for a `useId()`-equivalent. Collision-free
   * across every instance rendered within one running copy of this module
   * (one browser tab, or one server-render pass), which is the guarantee this
   * lib actually needs: none of these adapters are server-rendered today.
   *
   * This is NOT the guarantee React's/Vue's `useId()` gives. `nextId` is a
   * plain module-level variable, not reset per request: a persistent Node SSR
   * process keeps incrementing it across requests while a fresh client always
   * starts at 0, so server and client render would diverge the moment this
   * component is server-rendered — the exact hydration mismatch this file
   * used to (wrongly) claim the counter avoided. Two independently bundled
   * copies of this module (e.g. two versions loaded by separate
   * micro-frontends on one page) would likewise each start their own `nextId`
   * at 0 and could collide. Neither risk is exercised today; revisit this if
   * SSR or module-duplication ever applies here.
   */
  private readonly generatedId = `atl-input-${nextId++}`;

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
    return classes.join(' ');
  });

  /** @internal */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
