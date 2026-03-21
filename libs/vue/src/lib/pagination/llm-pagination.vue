<script setup lang="ts">
import { computed } from 'vue';
import './llm-pagination.css';

defineOptions({ name: 'LlmPagination' });

interface LlmPaginationProps {
  page?: number;
  pageCount?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
}

const props = withDefaults(defineProps<LlmPaginationProps>(), {
  page: 1,
  pageCount: 1,
  siblingCount: 1,
  showFirstLast: true,
});

const emit = defineEmits<{
  pageChange: [page: number];
}>();

type PageItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string };

function buildPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  if (pageCount <= 1) return [{ type: 'page', page: 1 }];
  const items: PageItem[] = [];
  items.push({ type: 'page', page: 1 });
  const left = Math.max(2, page - siblingCount);
  const right = Math.min(pageCount - 1, page + siblingCount);
  if (left > 2) items.push({ type: 'ellipsis', key: 'ellipsis-start' });
  for (let p = left; p <= right; p++) items.push({ type: 'page', page: p });
  if (right < pageCount - 1) items.push({ type: 'ellipsis', key: 'ellipsis-end' });
  if (pageCount > 1) items.push({ type: 'page', page: pageCount });
  return items;
}

const pageItems = computed(() => buildPageItems(props.page, props.pageCount, props.siblingCount));

function goTo(p: number) {
  const clamped = Math.min(Math.max(p, 1), props.pageCount);
  if (clamped !== props.page) {
    emit('pageChange', clamped);
  }
}
</script>

<template>
  <nav class="llm-pagination" aria-label="Pagination">
    <button
      v-if="showFirstLast"
      class="page-btn nav-btn"
      :disabled="page <= 1"
      aria-label="First page"
      @click="goTo(1)"
    >
      «
    </button>
    <button
      class="page-btn nav-btn"
      :disabled="page <= 1"
      aria-label="Previous page"
      @click="goTo(page - 1)"
    >
      ‹
    </button>

    <template v-for="item in pageItems" :key="item.type === 'page' ? item.page : item.key">
      <span v-if="item.type === 'ellipsis'" class="ellipsis" aria-hidden="true">…</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: item.page === page }"
        :aria-label="`Page ${item.page}`"
        :aria-current="item.page === page ? 'page' : undefined"
        @click="goTo(item.page)"
      >
        {{ item.page }}
      </button>
    </template>

    <button
      class="page-btn nav-btn"
      :disabled="page >= pageCount"
      aria-label="Next page"
      @click="goTo(page + 1)"
    >
      ›
    </button>
    <button
      v-if="showFirstLast"
      class="page-btn nav-btn"
      :disabled="page >= pageCount"
      aria-label="Last page"
      @click="goTo(pageCount)"
    >
      »
    </button>
  </nav>
</template>
