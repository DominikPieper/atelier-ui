import { InjectionToken } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';

/** @internal — shape required by LlmRadioGroup's FocusKeyManager */
export interface RadioItem extends FocusableOption {
  focus(): void; // matches FocusableOption
  disabled?: boolean; // matches FocusableOption
  readonly radioValue: Signal<string>;
}

export interface LlmRadioGroupContext {
  readonly value: WritableSignal<string>;
  readonly name: Signal<string>;
  readonly disabled: Signal<boolean>;
  select(v: string): void;
  markTouched(): void;
  registerItem(item: RadioItem): void;
  unregisterItem(item: RadioItem): void;
}

export const LLM_RADIO_GROUP = new InjectionToken<LlmRadioGroupContext>('LLM_RADIO_GROUP');
