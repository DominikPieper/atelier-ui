<script lang="ts">
import type { InjectionKey } from 'vue';

export interface LlmDialogContext {
  headerId: string;
  close: () => void;
}

export const LlmDialogKey: InjectionKey<LlmDialogContext> = Symbol('LlmDialog');

export interface LlmDialogProps {
  open?: boolean;
  closeOnBackdrop?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  ariaLabel?: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue';
import './llm-dialog.css';

defineOptions({ name: 'LlmDialog' });

const props = withDefaults(defineProps<LlmDialogProps>(), {
  open: false,
  closeOnBackdrop: true,
  size: 'md',
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const headerId = useId();

function close() {
  emit('update:open', false);
}

provide(LlmDialogKey, {
  headerId,
  close,
});

onMounted(() => {
  if (props.open && dialogRef.value) {
    dialogRef.value.showModal();
  }
});

watch(
  () => props.open,
  (isOpen) => {
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

function onDialogClose() {
  emit('update:open', false);
}

function onDialogCancel(event: Event) {
  event.preventDefault();
  emit('update:open', false);
}

function onBackdropClick(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === dialogRef.value) {
    emit('update:open', false);
  }
}

const panelClasses = computed(() => ['panel', `size-${props.size}`]);
</script>

<template>
  <dialog
    ref="dialogRef"
    class="llm-dialog"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="!ariaLabel ? headerId : undefined"
    aria-modal="true"
    @close="onDialogClose"
    @cancel="onDialogCancel"
    @click="onBackdropClick"
  >
    <div :class="panelClasses" @click.stop>
      <slot />
    </div>
  </dialog>
</template>
