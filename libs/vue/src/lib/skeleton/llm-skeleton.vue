<script setup lang="ts">
import { computed } from 'vue';
import './llm-skeleton.css';

defineOptions({ name: 'LlmSkeleton' });

interface LlmSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  animated?: boolean;
}

const props = withDefaults(defineProps<LlmSkeletonProps>(), {
  variant: 'text',
  width: '100%',
  height: undefined,
  animated: true,
});

function computeHeight(variant: string, width: string, height?: string): string {
  if (height) return height;
  switch (variant) {
    case 'text': return '1em';
    case 'circular': return width;
    case 'rectangular': return '100px';
    default: return '1em';
  }
}

const classes = computed(() => [
  'llm-skeleton',
  `variant-${props.variant}`,
  props.animated && 'is-animated',
].filter(Boolean));

const inlineStyle = computed(() => ({
  width: props.width,
  height: computeHeight(props.variant, props.width, props.height),
}));
</script>

<template>
  <div :class="classes" :style="inlineStyle" aria-hidden="true" />
</template>
