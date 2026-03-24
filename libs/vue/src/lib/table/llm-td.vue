<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LlmTd' });

interface Props {
  align?: 'start' | 'center' | 'end';
}

const props = withDefaults(defineProps<Props>(), {
  align: 'start',
});

const classes = computed(() => [`align-${props.align}`]);
</script>

<template>
  <td :class="classes">
    <slot />
  </td>
</template>
