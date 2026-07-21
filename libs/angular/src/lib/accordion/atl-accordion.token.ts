import { InjectionToken } from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';

/** @internal — shape required by AtlAccordionGroup's FocusKeyManager */
export interface AccordionItem extends FocusableOption {
  readonly id: string;
  focus(): void; // matches FocusableOption
  disabled?: boolean; // matches FocusableOption
}

export interface AtlAccordionGroupContext {
  register(item: AccordionItem): void;
  unregister(item: AccordionItem): void;
  handleKeydown(event: KeyboardEvent, item: AccordionItem): void;
}

export const ATL_ACCORDION_GROUP = new InjectionToken<AtlAccordionGroupContext>('ATL_ACCORDION_GROUP');
