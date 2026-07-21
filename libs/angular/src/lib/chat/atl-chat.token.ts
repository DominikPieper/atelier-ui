import { InjectionToken, Signal } from '@angular/core';
import type { AtlChatStatus, AtlChatVariant } from '../spec';

/**
 * Context token used by `atl-chat` sub-components (header, input) to
 * read parent state and dispatch close/toggle actions without a direct
 * component reference.
 */
export interface AtlChatContext {
  readonly headerId: string;
  readonly variant: Signal<AtlChatVariant>;
  readonly status: Signal<AtlChatStatus>;
  close(): void;
  toggle(): void;
}

export const ATL_CHAT = new InjectionToken<AtlChatContext>('ATL_CHAT');
