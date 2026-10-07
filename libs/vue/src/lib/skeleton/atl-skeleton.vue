<script setup lang="ts">
import { computed } from 'vue';
import '@atelier-ui/styles/skeleton/atl-skeleton.css';

defineOptions({ name: 'AtlSkeleton' });

interface AtlSkeletonProps {
  /** Shape variant of the skeleton placeholder. */
  variant?: 'text' | 'circular' | 'rectangular';
  /** CSS width of the skeleton. */
  width?: string;
  /** CSS height. When unset, a sensible default is chosen per variant. */
  height?: string;
  /** Whether the shimmer animation is active. */
  animated?: boolean;
}

const props = withDefaults(defineProps<AtlSkeletonProps>(), {
  variant: 'text',
  width: '100%',
  height: undefined,
  animated: true,
});

function computeHeight(
  variant: string,
  width: string,
  height?: string,
): string {
  if (height) return height;
  switch (variant) {
    case 'text':
      return '1em';
    case 'circular':
      return width;
    case 'rectangular':
      return '100px';
    default:
      return '1em';
  }
}

const classes = computed(() =>
  [
    'atl-skeleton',
    `variant-${props.variant}`,
    props.animated && 'is-animated',
  ].filter(Boolean),
);

const inlineStyle = computed(() => ({
  width: props.width,
  height: computeHeight(props.variant, props.width, props.height),
}));
</script>

<template>
  <div :class="classes" :style="inlineStyle" aria-hidden="true" />
</template>
