import { InjectionToken, Signal } from '@angular/core';
import type { LlmChatStatus, LlmChatVariant } from '../spec';

/**
 * Context token used by `llm-chat` sub-components (header, input) to
 * read parent state and dispatch close/toggle actions without a direct
 * component reference.
 */
export interface LlmChatContext {
  readonly headerId: string;
  readonly variant: Signal<LlmChatVariant>;
  readonly status: Signal<LlmChatStatus>;
  close(): void;
  toggle(): void;
}

export const LLM_CHAT = new InjectionToken<LlmChatContext>('LLM_CHAT');
