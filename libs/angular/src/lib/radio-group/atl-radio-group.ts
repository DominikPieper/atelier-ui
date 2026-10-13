import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import type { FormValueControl } from '@angular/forms/signals';
import {
  type ValidationError,
  type WithOptionalFieldTree,
} from '@angular/forms/signals';
import { warnIfUnnamedHost } from '../a11y-dev-warn';
import {
  ATL_RADIO_GROUP,
  type AtlRadioGroupContext,
  type RadioItem,
} from './atl-radio-group.token';

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
 * <!-- Accessible name: a group has no <label for>, so pass `aria-label` or
 *      `aria-labelledby` (static or bound with [aria-label]); dev mode warns
 *      when both are missing (ADR-0171). -->
 * <atl-radio-group aria-label="Plan size" [(value)]="size"> … </atl-radio-group>
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
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/radio-group/atl-radio-group.css',
  host: {
    class: 'atl-radio-group',
    role: 'radiogroup',
    '[class]': 'hostClasses()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[attr.aria-invalid]': 'invalid() || null',
    '[attr.aria-required]': 'required() || null',
    '[attr.aria-describedby]': 'showErrors() ? errorId : null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: ATL_RADIO_GROUP, useExisting: AtlRadioGroup }],
})
export class AtlRadioGroup
  implements FormValueControl<string>, AtlRadioGroupContext
{
  /** The selected value. Bound by [formField] directive. Supports [(value)] two-way binding. */
  readonly value = model('');

  /** Whether the user has interacted. Bound by [formField] directive. */
  readonly touched = model(false);

  /** Whether the group is disabled. Bound by [formField] directive. */
  readonly disabled = input(false);

  /**
   * Whether the selection can be read but not changed. Enforced by the guards in
   * `select()` and `onKeydown()`: HTML ignores `readonly` on a radio input, so the
   * group has to block the change itself. See ADR-0045.
   */
  readonly readonly = input(false);

  /** Whether the group has validation errors. Bound by [formField] directive. */
  readonly invalid = input(false);

  /** Whether the group is required. Bound by [formField] directive. */
  readonly required = input(false);

  /** Shared name attribute propagated to all child radio inputs. Bound by [formField] directive. */
  readonly name = input('');

  /** Validation errors from the form system. Bound by [formField] directive. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>(
    [],
  );

  /**
   * Accessible name of the group, written as `aria-label` on the host, which
   * carries `role="radiogroup"`. A `<label for>` cannot name a group, so a group
   * needs this or `aria-labelledby`. An aliased input rather than a plain host
   * attribute, so it is declared, bindable (`[aria-label]`) and in the spec
   * contract; see `atl-input.ts`'s identical `ariaLabel`.
   */
  // host-attr-guard exists for hosts that are NOT the labelled element, where a
  // static attribute would be a decoy. This host carries the role and the input is
  // written back onto it above, so the static attribute and the input agree.
  // eslint-disable-next-line atelier/host-attr-guard
  readonly ariaLabel = input('', { alias: 'aria-label' });

  /**
   * Id of the visible caption that names the group. Use instead of `aria-label`
   * when the text is on screen.
   */
  // eslint-disable-next-line atelier/host-attr-guard -- same as `ariaLabel`
  readonly ariaLabelledby = input('', { alias: 'aria-labelledby' });

  /** @internal */
  protected readonly errorId = `atl-radio-group-errors-${nextId++}`;

  /** @internal */
  private readonly items = signal<RadioItem[]>([]);

  /** @internal */
  private keyManager: FocusKeyManager<RadioItem> | null = null;

  /** @internal */
  /**
   * The message renders when there is a message. Gating it on `touched` as well was
   * an Angular-only rule: `touched` is not in the spec contract and React and Vue have
   * no equivalent, so the same four fields showed their errors at three different
   * moments depending on the framework. Deciding *when* to pass errors belongs to the
   * form layer, which is where `touched` lives (ADR-0055).
   */
  protected readonly showErrors = computed(() => this.errors().length > 0);

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.disabled()) classes.push('is-disabled');
    if (this.readonly()) classes.push('is-readonly');
    if (this.invalid()) classes.push('is-invalid');
    if (this.touched()) classes.push('is-touched');
    return classes.join(' ');
  });

  constructor() {
    warnIfUnnamedHost(
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement,
      'AtlRadioGroup',
      'set aria-label, or aria-labelledby pointing at a visible caption',
    );
  }

  /** @internal — called by AtlRadio on change */
  select(v: string): void {
    if (!this.disabled() && !this.readonly()) {
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
    if (this.disabled() || this.readonly()) return;

    if (!this.keyManager) {
      this.keyManager = new FocusKeyManager(this.items())
        .withHorizontalOrientation('ltr')
        .withVerticalOrientation()
        .withWrap();
    }

    const currentIdx = this.items().findIndex(
      (i) => i.radioValue() === this.value(),
    );
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
