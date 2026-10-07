import { InjectionToken, Signal } from '@angular/core';

export interface AtlBreadcrumbsContext {
  /** Registers an item with the signal holding its explicit `current`, if any. */
  registerItem(explicit: Signal<boolean | undefined>): number;
  unregisterItem(id: number): void;
  readonly lastItemId: Signal<number>;
  /** Whether any registered item set `current` itself; if so the last-item default is off. */
  readonly hasExplicitCurrent: Signal<boolean>;
}

export const ATL_BREADCRUMBS = new InjectionToken<AtlBreadcrumbsContext>(
  'ATL_BREADCRUMBS',
);
