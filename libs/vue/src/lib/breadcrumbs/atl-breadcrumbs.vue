<script setup lang="ts">
import './atl-breadcrumbs.css';

defineOptions({ name: 'AtlBreadcrumbs' });

const props = withDefaults(defineProps<{ separator?: string }>(), {
  separator: '/',
});
</script>

<template>
  <nav
    class="atl-breadcrumbs"
    aria-label="Breadcrumb"
    :style="{ '--atl-separator': `'${props.separator}'` }"
  >
    <ol class="breadcrumbs-list">
      <slot />
    </ol>
  </nav>
</template>
