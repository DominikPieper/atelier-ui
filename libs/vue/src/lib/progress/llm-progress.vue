<script setup lang="ts">
import { computed } from 'vue';
import './llm-progress.css';

defineOptions({ name: 'LlmProgress' });

interface LlmProgressProps {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const props = withDefaults(defineProps<LlmProgressProps>(), {
  value: 0,
  max: 100,
  variant: 'default',
  size: 'md',
  indeterminate: false,
});

const clampedValue = computed(() => Math.min(Math.max(props.value, 0), props.max));

const fillWidth = computed(() =>
  props.indeterminate ? '100%' : `${(clampedValue.value / props.max) * 100}%`
);

const classes = computed(() => [
  'llm-progress',
  `variant-${props.variant}`,
  `size-${props.size}`,
  props.indeterminate && 'is-indeterminate',
].filter(Boolean));
</script>

<template>
  <div
    :class="classes"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuenow="indeterminate ? undefined : clampedValue"
    :aria-valuemax="indeterminate ? undefined : max"
  >
    <div class="track">
      <div class="fill" :style="{ width: fillWidth }" />
    </div>
  </div>
</template>
