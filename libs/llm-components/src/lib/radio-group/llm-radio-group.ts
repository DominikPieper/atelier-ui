import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalField } from '@angular/forms/signals';
import { LLM_RADIO_GROUP, type LlmRadioGroupContext } from './llm-radio-group.token';

let nextId = 0;

/**
 * Container for a group of radio buttons. Manages keyboard navigation, shared name,
 * and Signal Forms integration.
 *
 * Usage:
 * ```html
 * <llm-radio-group [(value)]="size" name="size">
 *   <llm-radio radioValue="sm">Small</llm-radio>
 *   <llm-radio radioValue="md">Medium</llm-radio>
 *   <llm-radio radioValue="lg">Large</llm-radio>
 * </llm-radio-group>
 *
 * <!-- With Signal Forms -->
 * <llm-radio-group [formField]="form.size">
 *   <llm-radio radioValue="sm">Small</llm-radio>
 * </llm-radio-group>
 * ```
 */
@Component({
  selector: 'llm-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (showErrors()) {
      <div class="errors" [id]="errorId" aria-live="polite">
        @for (error of errors(); track error.kind) {
          <p class="error-message">{{ error.message }}</p>
        }
      </div>
    }
  `,
  styleUrl: './llm-radio-group.css',
  host: {
    role: 'radiogroup',
    '[class]': 'hostClasses()',
    '[attr.aria-invalid]': 'invalid() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.aria-describedby]': 'showErrors() ? errorId : null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: LLM_RADIO_GROUP, useExisting: LlmRadioGroup }],
})
export class LlmRadioGroup implements FormValueControl<string>, LlmRadioGroupContext {
  /** The selected value. Bound by [formField] directive. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** Whether the user has interacted. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Whether the group is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /** Whether the group has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Whether the group is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** Shared name attribute propagated to all child radio inputs. Bound by [formField] directive. */
  readonly name = input('');

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);

  /** @internal */
  protected readonly errorId = `llm-radio-group-errors-${nextId++}`;

  /** @internal */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  protected readonly showErrors = computed(
    () => this.touched() && this.invalid() && this.errors().length > 0
  );

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.disabled()) classes.push('is-disabled');
    if (this.invalid()) classes.push('is-invalid');
    if (this.touched()) classes.push('is-touched');
    return classes.join(' ');
  });

  /** @internal — called by LlmRadio on change */
  select(v: string): void {
    if (!this.disabled()) {
      this.value.set(v);
    }
  }

  /** @internal — called by LlmRadio on blur */
  markTouched(): void {
    this.touched.set(true);
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const inputs = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLInputElement>(
        'input[type="radio"]:not(:disabled)'
      )
    );
    if (inputs.length === 0) return;

    const currentIdx = inputs.indexOf(document.activeElement as HTMLInputElement);

    let nextIdx: number;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIdx = currentIdx < inputs.length - 1 ? currentIdx + 1 : 0;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIdx = currentIdx > 0 ? currentIdx - 1 : inputs.length - 1;
        break;
      default:
        return;
    }

    const target = inputs[nextIdx];
    target.focus();
    this.select(target.value);
    this.touched.set(true);
  }
}
