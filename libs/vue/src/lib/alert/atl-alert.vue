<script setup lang="ts">
import { computed } from 'vue';
import './atl-alert.css';
import AtlIcon from '../icon/atl-icon.vue';

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
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
