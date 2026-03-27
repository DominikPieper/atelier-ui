import { InjectionToken } from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';

/** @internal — shape required by LlmAccordionGroup's FocusKeyManager */
export interface AccordionItem extends FocusableOption {
  readonly id: string;
  focus(): void; // matches FocusableOption
  disabled?: boolean; // matches FocusableOption
}

export interface LlmAccordionGroupContext {
  register(item: AccordionItem): void;
  unregister(item: AccordionItem): void;
  handleKeydown(event: KeyboardEvent, item: AccordionItem): void;
}

export const LLM_ACCORDION_GROUP = new InjectionToken<LlmAccordionGroupContext>('LLM_ACCORDION_GROUP');
