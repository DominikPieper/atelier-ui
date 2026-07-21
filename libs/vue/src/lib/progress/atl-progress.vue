<script setup lang="ts">
import { computed } from 'vue';
import './atl-progress.css';

defineOptions({ name: 'AtlProgress' });

interface AtlProgressProps {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  /**
   * Accessible name — rendered as `aria-label` on the host.
   * Required by ARIA when there is no visible label nearby.
   */
  label?: string;
}

const props = withDefaults(defineProps<AtlProgressProps>(), {
  value: 0,
  max: 100,
  variant: 'default',
  size: 'md',
  indeterminate: false,
  label: undefined,
});

const clampedValue = computed(() => Math.min(Math.max(props.value, 0), props.max));

const fillWidth = computed(() =>
  props.indeterminate ? '100%' : `${(clampedValue.value / props.max) * 100}%`
);

const classes = computed(() => [
  'atl-progress',
  `variant-${props.variant}`,
  `size-${props.size}`,
  props.indeterminate && 'is-indeterminate',
].filter(Boolean));
</script>

<template>
  <div
    :class="classes"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="0"
    :aria-valuenow="indeterminate ? undefined : clampedValue"
    :aria-valuemax="indeterminate ? undefined : max"
  >
    <div class="track">
      <div class="fill" :style="{ width: fillWidth }" />
    </div>
  </div>
</template>
