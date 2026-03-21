<script setup lang="ts">
import { inject } from 'vue';
import { LlmDrawerKey } from './llm-drawer.vue';

defineOptions({ name: 'LlmDrawerHeader' });

const ctx = inject(LlmDrawerKey, { headerId: '', close: () => undefined });
</script>

<template>
  <div :id="ctx.headerId" class="llm-drawer-header">
    <span class="header-content"><slot /></span>
    <button
      class="close-btn"
      type="button"
      aria-label="Close drawer"
      @click="ctx.close()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>
