<script setup lang="ts">
import { computed } from 'vue';
import type { ToastData } from './llm-toast';

defineOptions({ name: 'LlmToastItem' });

interface LlmToastItemProps {
  data: ToastData;
}

const props = defineProps<LlmToastItemProps>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const classes = computed(() => ['llm-toast', `variant-${props.data.variant}`]);
</script>

<template>
  <div :class="classes" role="status">
    <span class="message">{{ data.message }}</span>
    <button
      v-if="data.dismissible"
      class="dismiss"
      type="button"
      aria-label="Dismiss"
      @click="emit('dismiss', data.id)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>
