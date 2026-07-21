import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import type { FormValueControl } from '@angular/forms/signals';
import { type ValidationError, type WithOptionalFieldTree } from '@angular/forms/signals';
import { ATL_RADIO_GROUP, type AtlRadioGroupContext, type RadioItem } from './atl-radio-group.token';

let nextId = 0;

/**
 * Container for a group of radio buttons. Manages keyboard navigation, shared name,
 * and Signal Forms integration.
 *
 * Usage:
 * ```html
 * <atl-radio-group [(value)]="size" name="size">
 *   <atl-radio radioValue="sm">Small</atl-radio>
 *   <atl-radio radioValue="md">Medium</atl-radio>
 *   <atl-radio radioValue="lg">Large</atl-radio>
 * </atl-radio-group>
 *
 * <!-- With Signal Forms -->
 * <atl-radio-group [formField]="form.size">
 *   <atl-radio radioValue="sm">Small</atl-radio>
 * </atl-radio-group>
 * ```
 */
@Component({
  selector: 'atl-radio-group',
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
  styleUrl: './atl-radio-group.css',
  host: {
    role: 'radiogroup',
    '[class]': 'hostClasses()',
    '[attr.aria-invalid]': 'invalid() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.aria-describedby]': 'showErrors() ? errorId : null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: ATL_RADIO_GROUP, useExisting: AtlRadioGroup }],
})
export class AtlRadioGroup implements FormValueControl<string>, AtlRadioGroupContext {
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
  protected readonly errorId = `atl-radio-group-errors-${nextId++}`;

  /** @internal */
  private readonly items = signal<RadioItem[]>([]);

  /** @internal */
  private keyManager: FocusKeyManager<RadioItem> | null = null;

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

  /** @internal — called by AtlRadio on change */
  select(v: string): void {
    if (!this.disabled()) {
      this.value.set(v);
    }
  }

  /** @internal — called by AtlRadio on blur */
  markTouched(): void {
    this.touched.set(true);
  }

  /** @internal — called by AtlRadio on init */
  registerItem(item: RadioItem): void {
    this.items.update((list) => [...list, item]);
  }

  /** @internal — called by AtlRadio on destroy */
  unregisterItem(item: RadioItem): void {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    if (!this.keyManager) {
      this.keyManager = new FocusKeyManager(this.items())
        .withHorizontalOrientation('ltr')
        .withVerticalOrientation()
        .withWrap();
    }

    const currentIdx = this.items().findIndex((i) => i.radioValue() === this.value());
    this.keyManager.setActiveItem(currentIdx);
    this.keyManager.onKeydown(event);

    const activeIdx = this.keyManager.activeItemIndex;
    if (activeIdx !== null && activeIdx !== -1 && activeIdx !== currentIdx) {
      const target = this.items()[activeIdx];
      this.value.set(target.radioValue());
      this.touched.set(true);
    }
  }
}
