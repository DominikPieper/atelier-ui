import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';

let nextId = 0;

/**
 * Accessible toggle (switch) component for use with Angular Signal Forms.
 * Presents as a pill-shaped on/off slider instead of a checkbox box,
 * but has identical boolean semantics and implements FormCheckboxControl.
 *
 * Usage:
 * ```html
 * <atl-toggle [(checked)]="enabled">Enable notifications</atl-toggle>
 * <atl-toggle [formField]="form.enabled">Enable</atl-toggle>
 * ```
 */
@Component({
  selector: 'atl-toggle',
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
  styleUrl: './atl-toggle.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AtlToggle implements FormCheckboxControl {
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
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** @internal */
  protected readonly inputId = `atl-toggle-${nextId++}`;

  /** @internal */
  protected readonly errorId = `atl-toggle-errors-${nextId++}`;

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
