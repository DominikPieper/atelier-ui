<script setup lang="ts">
import { computed } from 'vue';
import './llm-alert.css';

defineOptions({ name: 'LlmAlert' });

interface LlmAlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  dismissible?: boolean;
}

const props = withDefaults(defineProps<LlmAlertProps>(), {
  variant: 'info',
  dismissible: false,
});

const emit = defineEmits<{
  dismissed: [];
}>();

const classes = computed(() => ['llm-alert', `variant-${props.variant}`]);

const ariaLive = computed(() =>
  props.variant === 'danger' || props.variant === 'warning' ? 'assertive' : 'polite'
);
</script>

<template>
  <div :class="classes" role="alert" :aria-live="ariaLive">
    <span class="content"><slot /></span>
    <button
      v-if="dismissible"
      class="dismiss"
      type="button"
      aria-label="Dismiss"
      @click="emit('dismissed')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
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
