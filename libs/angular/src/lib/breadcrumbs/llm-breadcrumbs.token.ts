import { InjectionToken, Signal } from '@angular/core';

export interface LlmBreadcrumbsContext {
  registerItem(): number;
  unregisterItem(id: number): void;
  readonly lastItemId: Signal<number>;
}

export const LLM_BREADCRUMBS = new InjectionToken<LlmBreadcrumbsContext>('LLM_BREADCRUMBS');
