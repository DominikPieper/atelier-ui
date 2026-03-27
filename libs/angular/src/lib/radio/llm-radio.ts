import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LLM_RADIO_GROUP, type RadioItem } from '../radio-group/llm-radio-group.token';

let nextId = 0;

/**
 * Individual radio button. Must be placed inside an `llm-radio-group`.
 *
 * Usage:
 * ```html
 * <llm-radio-group [(value)]="selected" name="plan">
 *   <llm-radio radioValue="free">Free</llm-radio>
 *   <llm-radio radioValue="pro">Pro</llm-radio>
 * </llm-radio-group>
 * ```
 */
@Component({
  selector: 'llm-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [attr.for]="inputId">
      <input
        type="radio"
        [id]="inputId"
        [value]="radioValue()"
        [checked]="isChecked()"
        [disabled]="isDisabled()"
        [attr.name]="effectiveName() || null"
        (change)="onChange()"
        (blur)="onBlur()"
      />
      <ng-content />
    </label>
  `,
  styleUrl: './llm-radio.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmRadio implements RadioItem, OnInit, OnDestroy {
  /** The value this radio option represents within the group. */
  readonly radioValue = input.required<string>();

  /** Whether this specific radio is individually disabled (stacked with group disabled). */
  readonly disabled = input(false);

  /** @internal */
  private readonly group = inject(LLM_RADIO_GROUP, { optional: true });

  /** @internal */
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  protected readonly inputId = `llm-radio-${nextId++}`;

  /** @internal */
  protected readonly isChecked = computed(() => this.group?.value() === this.radioValue());

  /** @internal */
  readonly isDisabled = computed(() => this.disabled() || (this.group?.disabled() ?? false));

  /** @internal */
  protected readonly effectiveName = computed(() => this.group?.name() ?? '');

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.isChecked()) classes.push('is-checked');
    if (this.isDisabled()) classes.push('is-disabled');
    return classes.join(' ');
  });

  /** @internal — for FocusKeyManager */
  get disabled(): boolean {
    return this.isDisabled();
  }

  /** @internal — for FocusKeyManager */
  focus(): void {
    this.el.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }

  ngOnInit(): void {
    this.group?.registerItem(this);
  }

  ngOnDestroy(): void {
    this.group?.unregisterItem(this);
  }

  /** @internal */
  protected onChange(): void {
    this.group?.select(this.radioValue());
  }

  /** @internal */
  protected onBlur(): void {
    this.group?.markTouched();
  }
}
