import { inject } from 'vue';
import type { InjectionKey, Ref } from 'vue';

export interface ToastOptions {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
  dismissible?: boolean;
}

export interface ToastData {
  id: string;
  message: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  duration: number;
  dismissible: boolean;
}

export interface AtlToastContext {
  toasts: Ref<ToastData[]>;
  show: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const AtlToastKey: InjectionKey<AtlToastContext> = Symbol('AtlToast');

export function useAtlToast(): Pick<AtlToastContext, 'show' | 'dismiss' | 'clear'> {
  const ctx = inject(AtlToastKey);
  if (!ctx) {
    throw new Error(
      'useAtlToast() must be called inside a component that is a descendant of AtlToastProvider.'
    );
  }
  return { show: ctx.show, dismiss: ctx.dismiss, clear: ctx.clear };
}
