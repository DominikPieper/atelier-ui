import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';
import { LLM_RADIO_GROUP, type LlmRadioGroupContext, type RadioItem } from './llm-radio-group.token';

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
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);

  /** @internal */
  protected readonly errorId = `llm-radio-group-errors-${nextId++}`;

  /** @internal */
  private readonly items = signal<RadioItem[]>([]);

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

  /** @internal — called by LlmRadio on init */
  registerItem(item: RadioItem): void {
    this.items.update((list) => [...list, item]);
  }

  /** @internal — called by LlmRadio on destroy */
  unregisterItem(item: RadioItem): void {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== 'ArrowDown' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowLeft') return;

    event.preventDefault();
    const radioItems = this.items();
    const enabled = radioItems.filter((item) => !item.isDisabled());
    if (enabled.length === 0) return;

    const currentPos = enabled.findIndex((i) => i.radioValue() === this.value());
    const isNext = key === 'ArrowDown' || key === 'ArrowRight';
    const n = enabled.length;
    const nextPos = isNext
      ? (currentPos + 1) % n
      : (currentPos - 1 + n) % n;

    const target = enabled[nextPos];
    if (target) {
      target.focusInput();
      this.value.set(target.radioValue());
      this.touched.set(true);
    }
  }
}
