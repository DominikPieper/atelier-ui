import { InjectionToken } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';

export interface LlmSelectContext {
  readonly value: WritableSignal<string>;
  readonly disabled: Signal<boolean>;
  readonly activeOptionId: WritableSignal<string | null>;
  select(v: string): void;
  markTouched(): void;
  registerOption(id: string, value: string, labelText: string, disabled: boolean): void;
  unregisterOption(id: string): void;
}

export const LLM_SELECT = new InjectionToken<LlmSelectContext>('LLM_SELECT');
