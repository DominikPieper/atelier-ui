<script setup lang="ts">
import { computed } from 'vue';
import './llm-badge.css';

defineOptions({ name: 'LlmBadge' });

interface LlmBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<LlmBadgeProps>(), {
  variant: 'default',
  size: 'md',
});

const classes = computed(() => [
  'llm-badge',
  `variant-${props.variant}`,
  `size-${props.size}`,
]);
</script>

<template>
  <span :class="classes" role="status">
    <slot />
  </span>
</template>
