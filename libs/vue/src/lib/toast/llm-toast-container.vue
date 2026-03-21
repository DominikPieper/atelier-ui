<script setup lang="ts">
import { computed, inject } from 'vue';
import { LlmToastKey } from './llm-toast';
import LlmToastItem from './llm-toast-item.vue';
import './llm-toast.css';

defineOptions({ name: 'LlmToastContainer' });

interface LlmToastContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const props = withDefaults(defineProps<LlmToastContainerProps>(), {
  position: 'bottom-right',
});

const ctx = inject(LlmToastKey)!;
// Expose toasts as a computed so template can iterate without manual .value
const toasts = computed(() => ctx.toasts.value);

function dismiss(id: string) {
  ctx.dismiss(id);
}

const classes = computed(() => ['llm-toast-container', `position-${props.position}`]);
</script>

<template>
  <div :class="classes" aria-live="polite" role="status">
    <LlmToastItem
      v-for="toast in toasts"
      :key="toast.id"
      :data="toast"
      @dismiss="dismiss($event)"
    />
  </div>
</template>
