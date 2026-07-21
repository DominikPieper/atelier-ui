<script setup lang="ts">
import AtlCheckbox from '../checkbox/atl-checkbox.vue';

defineOptions({ name: 'AtlTr' });

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
    <td v-if="selectable" class="atl-tr-select-cell">
      <AtlCheckbox :checked="selected" @update:checked="emit('update:selected', $event)" />
    </td>
    <slot />
  </tr>
</template>
