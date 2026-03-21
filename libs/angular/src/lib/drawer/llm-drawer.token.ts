import { InjectionToken } from '@angular/core';

export interface LlmDrawerContext {
  headerId: string;
  close: () => void;
}

export const LLM_DRAWER = new InjectionToken<LlmDrawerContext>('LLM_DRAWER');
