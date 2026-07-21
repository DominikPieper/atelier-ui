import { InjectionToken } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';

export interface AtlSelectContext {
  readonly value: WritableSignal<string>;
  readonly disabled: Signal<boolean>;
  readonly activeOptionId: WritableSignal<string | null>;
  select(v: string): void;
  markTouched(): void;
  registerOption(id: string, value: string, labelText: string, disabled: boolean): void;
  unregisterOption(id: string): void;
}

export const ATL_SELECT = new InjectionToken<AtlSelectContext>('ATL_SELECT');
