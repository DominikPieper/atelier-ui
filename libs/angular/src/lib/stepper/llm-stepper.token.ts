import { InjectionToken } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';

export interface StepInfo {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  error: boolean;
  optional: boolean;
  disabled: boolean;
}

export interface LlmStepperContext {
  readonly activeStep: WritableSignal<number>;
  readonly steps: Signal<StepInfo[]>;
  readonly linear: Signal<boolean>;
  registerStep(info: StepInfo): void;
  unregisterStep(id: string): void;
  updateStep(id: string, info: Partial<StepInfo>): void;
  goTo(index: number): void;
  next(): void;
  prev(): void;
}

export const LLM_STEPPER = new InjectionToken<LlmStepperContext>('LLM_STEPPER');
