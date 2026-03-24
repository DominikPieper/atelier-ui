<script setup lang="ts">
import LlmCheckbox from '../checkbox/llm-checkbox.vue';

defineOptions({ name: 'LlmTr' });

interface Props {
  selected?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  selectable: false,
});

const emit = defineEmits<{
  'update:selected': [value: boolean];
}>();
</script>

<template>
  <tr
    :aria-selected="selectable ? selected : undefined"
    :class="{ 'is-selected': selected }"
  >
    <td v-if="selectable" class="llm-tr-select-cell">
      <LlmCheckbox :checked="selected" @update:checked="emit('update:selected', $event)" />
    </td>
    <slot />
  </tr>
</template>
