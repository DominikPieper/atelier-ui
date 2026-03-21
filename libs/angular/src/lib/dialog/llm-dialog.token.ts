import { InjectionToken } from '@angular/core';

export interface LlmDialogContext {
  headerId: string;
  close: () => void;
}

export const LLM_DIALOG = new InjectionToken<LlmDialogContext>('LLM_DIALOG');
