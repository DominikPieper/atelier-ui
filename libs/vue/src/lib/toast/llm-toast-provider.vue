<script setup lang="ts">
import { provide, ref } from 'vue';
import { LlmToastKey } from './llm-toast';
import type { ToastData, ToastOptions } from './llm-toast';

defineOptions({ name: 'LlmToastProvider' });

const toasts = ref<ToastData[]>([]);
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function show(message: string, options: ToastOptions = {}): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const duration = options.duration ?? 5000;
  const toast: ToastData = {
    id,
    message,
    variant: options.variant ?? 'default',
    duration,
    dismissible: options.dismissible ?? true,
  };
  toasts.value = [...toasts.value, toast];

  if (duration > 0) {
    const timer = setTimeout(() => {
      dismiss(id);
    }, duration);
    timers.set(id, timer);
  }

  return id;
}

function dismiss(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function clear() {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
  toasts.value = [];
}

provide(LlmToastKey, { toasts, show, dismiss, clear });
</script>

<template>
  <slot />
</template>
