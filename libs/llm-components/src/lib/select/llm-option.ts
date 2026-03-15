import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { LLM_SELECT } from './llm-select.token';

let nextOptionId = 0;

/**
 * Option item for use inside `<llm-select>`.
 *
 * Usage:
 * ```html
 * <llm-option optionValue="us">United States</llm-option>
 * ```
 */
@Component({
  selector: 'llm-option',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="option"
      [attr.id]="optionId"
      [attr.aria-selected]="isSelected()"
      [attr.aria-disabled]="disabled() || null"
      [class.is-selected]="isSelected()"
      [class.is-active]="isActive()"
      [class.is-disabled]="disabled()"
      (click)="onClick()"
      (mouseenter)="onMouseEnter()"
    >
      <ng-content />
    </div>
  `,
})
export class LlmOption implements OnInit, OnDestroy {
  /** The value this option represents. Required. */
  readonly optionValue = input.required<string>();

  /** Whether this option is disabled. */
  readonly disabled = input(false);

  /** @internal */
  protected readonly optionId = `llm-option-${nextOptionId++}`;

  /** @internal */
  private readonly context = inject(LLM_SELECT);

  /** @internal */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  protected readonly isSelected = computed(() => this.context.value() === this.optionValue());

  /** @internal */
  protected readonly isActive = computed(() => this.context.activeOptionId() === this.optionId);

  ngOnInit(): void {
    const labelText = this.elementRef.nativeElement.textContent?.trim() ?? '';
    this.context.registerOption(this.optionId, this.optionValue(), labelText, this.disabled());
  }

  ngOnDestroy(): void {
    this.context.unregisterOption(this.optionId);
  }

  /** @internal */
  protected onClick(): void {
    if (this.disabled()) return;
    this.context.select(this.optionValue());
    this.context.markTouched();
  }

  /** @internal */
  protected onMouseEnter(): void {
    if (!this.disabled()) {
      this.context.activeOptionId.set(this.optionId);
    }
  }
}
