<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LlmMenu' });

interface LlmMenuProps {
  variant?: 'default' | 'compact';
}

const props = withDefaults(defineProps<LlmMenuProps>(), {
  variant: 'default',
});

const classes = computed(() => ['llm-menu', `variant-${props.variant}`]);
</script>

<template>
  <div :class="classes" role="menu">
    <slot />
  </div>
</template>
