import { InjectionToken } from '@angular/core';
import type { Signal, WritableSignal } from '@angular/core';

export interface TabInfo {
  id: string;
  label: string;
  disabled: boolean;
  panelId: string;
  tabId: string;
}

export interface LlmTabGroupContext {
  readonly selectedIndex: WritableSignal<number>;
  readonly tabs: Signal<TabInfo[]>;
  registerTab(info: TabInfo): void;
  unregisterTab(id: string): void;
}

export const LLM_TAB_GROUP = new InjectionToken<LlmTabGroupContext>('LLM_TAB_GROUP');
