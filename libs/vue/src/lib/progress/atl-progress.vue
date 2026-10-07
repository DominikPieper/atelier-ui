<script setup lang="ts">
import { computed } from 'vue';
import '@atelier-ui/styles/progress/atl-progress.css';

defineOptions({ name: 'AtlProgress' });

interface AtlProgressProps {
  /** Current value of the progress bar, clamped between 0 and `max`. */
  value?: number;
  /** Maximum value. */
  max?: number;
  /** Semantic color variant. */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Height size of the track. */
  size?: 'sm' | 'md' | 'lg';
  /** Shows an animated indeterminate (loading) state. */
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

const clampedValue = computed(() =>
  Math.min(Math.max(props.value, 0), props.max),
);

const fillWidth = computed(() =>
  props.indeterminate ? '100%' : `${(clampedValue.value / props.max) * 100}%`,
);

const classes = computed(() =>
  [
    'atl-progress',
    `variant-${props.variant}`,
    `size-${props.size}`,
    props.indeterminate && 'is-indeterminate',
  ].filter(Boolean),
);
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
