import { InjectionToken } from '@angular/core';

export interface AtlDrawerContext {
  headerId: string;
  close: () => void;
}

export const ATL_DRAWER = new InjectionToken<AtlDrawerContext>('ATL_DRAWER');
