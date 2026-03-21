<script lang="ts">
import type { InjectionKey } from 'vue';

export interface LlmDrawerContext {
  headerId: string;
  close: () => void;
}

export const LlmDrawerKey: InjectionKey<LlmDrawerContext> = Symbol('LlmDrawer');

export interface LlmDrawerProps {
  open?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
}
</script>

<script setup lang="ts">
import { computed, onMounted, provide, ref, useId, watch } from 'vue';
import './llm-drawer.css';

defineOptions({ name: 'LlmDrawer' });

const props = withDefaults(defineProps<LlmDrawerProps>(), {
  open: false,
  position: 'right',
  size: 'md',
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const headerId = useId();

function close() {
  emit('update:open', false);
}

provide(LlmDrawerKey, {
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

const hostClasses = computed(() => [
  'llm-drawer-host',
  `position-${props.position}`,
  `size-${props.size}`,
  props.open && 'is-open',
]);
</script>

<template>
  <dialog
    ref="dialogRef"
    :class="hostClasses"
    :aria-labelledby="headerId"
    aria-modal="true"
    @close="onDialogClose"
    @cancel="onDialogCancel"
    @click="onBackdropClick"
  >
    <div class="panel" @click.stop>
      <slot />
    </div>
  </dialog>
</template>
