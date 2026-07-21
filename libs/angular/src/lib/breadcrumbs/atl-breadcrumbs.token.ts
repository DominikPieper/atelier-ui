import { InjectionToken, Signal } from '@angular/core';

export interface AtlBreadcrumbsContext {
  registerItem(): number;
  unregisterItem(id: number): void;
  readonly lastItemId: Signal<number>;
}

export const ATL_BREADCRUMBS = new InjectionToken<AtlBreadcrumbsContext>('ATL_BREADCRUMBS');
