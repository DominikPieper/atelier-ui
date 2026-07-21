<script setup lang="ts">
import { computed } from 'vue';
import './atl-badge.css';

defineOptions({ name: 'AtlBadge' });

type AtlBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface AtlBadgeProps {
  variant?: AtlBadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_ICONS: Record<AtlBadgeVariant, string | null> = {
  default: null,
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
};

const props = withDefaults(defineProps<AtlBadgeProps>(), {
  variant: 'default',
  size: 'md',
});

const classes = computed(() => [
  'atl-badge',
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
