<script setup lang="ts">
import { computed } from 'vue';
import './llm-card.css';

defineOptions({ name: 'LlmCard' });

interface LlmCardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<LlmCardProps>(), {
  variant: 'elevated',
  padding: 'md',
});

const classes = computed(() => [
  'llm-card',
  `variant-${props.variant}`,
  `padding-${props.padding}`,
]);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
