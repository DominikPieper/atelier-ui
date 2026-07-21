<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'AtlMenu' });

interface AtlMenuProps {
  variant?: 'default' | 'compact';
}

const props = withDefaults(defineProps<AtlMenuProps>(), {
  variant: 'default',
});

const classes = computed(() => ['atl-menu', `variant-${props.variant}`]);
</script>

<template>
  <div :class="classes" role="menu">
    <slot />
  </div>
</template>
