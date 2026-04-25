<script lang="ts">
import type { InjectionKey, Ref } from 'vue';
import type { LlmChatStatus, LlmChatVariant } from '../spec';

export interface LlmChatContext {
  headerId: string;
  status: Ref<LlmChatStatus>;
  close: () => void;
  toggle: () => void;
}

export const LlmChatKey: InjectionKey<LlmChatContext> = Symbol('LlmChat');

export interface LlmChatProps {
  variant?: LlmChatVariant;
  status?: LlmChatStatus;
  open?: boolean;
}
</script>

<script setup lang="ts">
import { computed, nextTick, provide, ref, toRef, useId, useTemplateRef, watch } from 'vue';
import './llm-chat.css';

defineOptions({ name: 'LlmChat' });

const props = withDefaults(defineProps<LlmChatProps>(), {
  variant: 'drawer',
  status: 'idle',
  open: false,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const hostRef = useTemplateRef<HTMLDivElement>('hostRef');
const headerId = useId();
const statusRef = toRef(props, 'status');

function close() { emit('update:open', false); }
function toggle() { emit('update:open', !props.open); }

provide(LlmChatKey, {
  headerId,
  status: statusRef,
  close,
  toggle,
});

watch(
  () => props.open,
  (isOpen) => {
    if (props.variant !== 'drawer') return;
    const dialog = dialogRef.value;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  },
  { flush: 'post' },
);

// Auto-focus the input on open for drawer / popup. Inline keeps user focus.
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    if (props.variant === 'inline') return;
    await nextTick();
    requestAnimationFrame(() => {
      hostRef.value?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    });
  },
  { flush: 'post', immediate: true },
);

function onDialogClose() { emit('update:open', false); }
function onDialogCancel(event: Event) {
  event.preventDefault();
  emit('update:open', false);
}
function onBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) emit('update:open', false);
}

const hostClasses = computed(() => [
  'llm-chat',
  `variant-${props.variant}`,
  `status-${props.status}`,
  props.open && 'is-open',
]);
</script>

<template>
  <div ref="hostRef" :class="hostClasses">
    <template v-if="variant === 'drawer'">
      <dialog
        ref="dialogRef"
        :aria-labelledby="headerId"
        aria-modal="true"
        @close="onDialogClose"
        @cancel="onDialogCancel"
        @click="onBackdropClick"
      >
        <div class="surface drawer-surface" @click.stop>
          <slot />
        </div>
      </dialog>
    </template>
    <template v-else-if="variant === 'popup'">
      <div
        v-if="open"
        class="surface popup-surface"
        role="dialog"
        :aria-labelledby="headerId"
      >
        <slot />
      </div>
      <button
        type="button"
        class="fab-bubble"
        :aria-label="open ? 'Close AI assistant' : 'Open AI assistant'"
        :aria-expanded="open"
        @click="toggle"
      >
        <span aria-hidden="true">AI</span>
      </button>
    </template>
    <template v-else>
      <section class="surface inline-surface" :aria-labelledby="headerId">
        <slot />
      </section>
    </template>
  </div>
</template>
