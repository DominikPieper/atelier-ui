<script setup lang="ts">
import './llm-breadcrumbs.css';

defineOptions({ name: 'LlmBreadcrumbs' });

const props = withDefaults(defineProps<{ separator?: string }>(), {
  separator: '/',
});
</script>

<template>
  <nav
    class="llm-breadcrumbs"
    aria-label="Breadcrumb"
    :style="{ '--llm-separator': `'${props.separator}'` }"
  >
    <ol class="breadcrumbs-list">
      <slot />
    </ol>
  </nav>
</template>
