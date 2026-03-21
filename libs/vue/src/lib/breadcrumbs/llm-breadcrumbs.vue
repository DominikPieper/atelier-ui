<script setup lang="ts">
import './llm-breadcrumbs.css';

defineOptions({ name: 'LlmBreadcrumbs' });
</script>

<template>
  <nav class="llm-breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs-list">
      <slot />
    </ol>
  </nav>
</template>
