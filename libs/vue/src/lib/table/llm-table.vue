<script setup lang="ts">
import { computed } from 'vue';
import './llm-table.css';

defineOptions({ name: 'LlmTable' });

interface Props {
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  stickyHeader: false,
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
    <div class="llm-table-wrapper">
      <table>
        <slot />
      </table>
    </div>
  </div>
</template>
