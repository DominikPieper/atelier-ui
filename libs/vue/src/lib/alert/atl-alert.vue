<script setup lang="ts">
import { computed } from 'vue';
import './atl-alert.css';

defineOptions({ name: 'AtlAlert' });

type AtlAlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AtlAlertProps {
  variant?: AtlAlertVariant;
  dismissible?: boolean;
}

const VARIANT_ICONS: Record<AtlAlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  danger: '✕',
};

const props = withDefaults(defineProps<AtlAlertProps>(), {
  variant: 'info',
  dismissible: false,
});

const emit = defineEmits<{
  dismissed: [];
}>();

const classes = computed(() => ['atl-alert', `variant-${props.variant}`]);

const ariaLive = computed(() =>
  props.variant === 'danger' || props.variant === 'warning' ? 'assertive' : 'polite'
);

const variantIcon = computed(() => VARIANT_ICONS[props.variant]);
</script>

<template>
  <div :class="classes" role="alert" :aria-live="ariaLive">
    <span class="content">
      <span class="variant-icon" aria-hidden="true">{{ variantIcon }}</span>
      <slot />
    </span>
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
