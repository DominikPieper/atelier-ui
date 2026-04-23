<script setup lang="ts">
import { computed } from 'vue';
import './llm-badge.css';

defineOptions({ name: 'LlmBadge' });

type LlmBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface LlmBadgeProps {
  variant?: LlmBadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_ICONS: Record<LlmBadgeVariant, string | null> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

const props = withDefaults(defineProps<LlmBadgeProps>(), {
  variant: 'default',
  size: 'md',
});

const classes = computed(() => [
  'llm-badge',
  `variant-${props.variant}`,
  `size-${props.size}`,
]);

const variantIcon = computed(() => VARIANT_ICONS[props.variant]);
</script>

<template>
  <span :class="classes" role="status">
    <span v-if="variantIcon" class="variant-icon" aria-hidden="true">{{ variantIcon }}</span>
    <slot />
  </span>
</template>
