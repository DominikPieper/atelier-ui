import { InjectionToken } from '@angular/core';

/** @internal — shape required by LlmAccordionGroup's FocusKeyManager */
export interface AccordionItem {
  readonly id: string;
  focusTrigger(): void;
  isItemDisabled(): boolean;
}

export interface LlmAccordionGroupContext {
  register(item: AccordionItem): void;
  unregister(item: AccordionItem): void;
  handleKeydown(event: KeyboardEvent, item: AccordionItem): void;
}

export const LLM_ACCORDION_GROUP = new InjectionToken<LlmAccordionGroupContext>('LLM_ACCORDION_GROUP');
