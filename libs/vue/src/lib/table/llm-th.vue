<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LlmTh' });

type SortDirection = 'asc' | 'desc' | null;

interface Props {
  sortable?: boolean;
  sortDirection?: SortDirection;
  align?: 'start' | 'center' | 'end';
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sortable: false,
  sortDirection: null,
  align: 'start',
});

const emit = defineEmits<{
  sort: [direction: SortDirection];
}>();

const classes = computed(() =>
  [
    `align-${props.align}`,
    props.sortDirection && 'is-sorted',
    props.sortDirection === 'asc' && 'sort-asc',
    props.sortDirection === 'desc' && 'sort-desc',
  ].filter(Boolean),
);

const ariaSort = computed(() => {
  if (!props.sortable) return undefined;
  if (props.sortDirection === 'asc') return 'ascending';
  if (props.sortDirection === 'desc') return 'descending';
  return 'none';
});

function cycleSort() {
  const next: SortDirection =
    props.sortDirection === null ? 'asc' : props.sortDirection === 'asc' ? 'desc' : null;
  emit('sort', next);
}
</script>

<template>
  <th :class="classes" :aria-sort="ariaSort" :style="width ? { width } : undefined">
    <button v-if="sortable" type="button" class="llm-th-sort-btn" @click="cycleSort">
      <slot />
      <svg
        class="llm-th-sort-icon"
        aria-hidden="true"
        width="12"
        height="16"
        viewBox="0 0 12 16"
        fill="none"
      >
        <path class="llm-th-sort-asc-arrow" d="M6 2L11 8H1L6 2Z" fill="currentColor" />
        <path class="llm-th-sort-desc-arrow" d="M6 14L1 8H11L6 14Z" fill="currentColor" />
      </svg>
    </button>
    <slot v-else />
  </th>
</template>
