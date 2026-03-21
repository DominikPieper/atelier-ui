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

export interface LlmToastContext {
  toasts: Ref<ToastData[]>;
  show: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const LlmToastKey: InjectionKey<LlmToastContext> = Symbol('LlmToast');

export function useLlmToast(): Pick<LlmToastContext, 'show' | 'dismiss' | 'clear'> {
  const ctx = inject(LlmToastKey);
  if (!ctx) {
    throw new Error(
      'useLlmToast() must be called inside a component that is a descendant of LlmToastProvider.'
    );
  }
  return { show: ctx.show, dismiss: ctx.dismiss, clear: ctx.clear };
}
