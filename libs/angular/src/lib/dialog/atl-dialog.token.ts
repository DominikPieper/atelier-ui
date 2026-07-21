import { InjectionToken } from '@angular/core';

export interface AtlDialogContext {
  headerId: string;
  close: () => void;
}

export const ATL_DIALOG = new InjectionToken<AtlDialogContext>('ATL_DIALOG');
