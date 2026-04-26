<script setup lang="ts">
import { computed } from 'vue';
import './llm-table.css';

defineOptions({ name: 'LlmTable' });

interface Props {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  /**
   * Accessible name for the scrollable table region. Surfaces to
   * screen readers as the region's label so keyboard users who
   * scroll the wrapper know what they're scrolling. Defaults to
   * `"Table"` if unset.
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  stickyHeader: false,
  ariaLabel: undefined,
});

const classes = computed(() => [
  'llm-table',
  `variant-${props.variant}`,
  `size-${props.size}`,
  props.stickyHeader && 'is-sticky-header',
]);
</script>

<template>
  <div :class="classes">
    <!-- Scrollable wrapper: tabindex=0 + role/aria-label so keyboard
         users can scroll wide tables horizontally and screen readers
         announce the region (axe: scrollable-region-focusable). -->
    <div
      class="llm-table-wrapper"
      tabindex="0"
      role="region"
      :aria-label="ariaLabel ?? 'Table'"
    >
      <table>
        <slot />
      </table>
    </div>
  </div>
</template>
