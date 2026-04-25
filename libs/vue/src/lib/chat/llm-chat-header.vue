<script setup lang="ts">
import { inject, ref } from 'vue';
import { LlmChatKey } from './llm-chat.vue';

defineOptions({ name: 'LlmChatHeader' });

const ctx = inject(LlmChatKey, {
  headerId: '',
  status: ref('idle' as const),
  close: () => undefined,
  toggle: () => undefined,
});
</script>

<template>
  <div :id="ctx.headerId" class="llm-chat-header">
    <div class="title-block">
      <slot />
    </div>
    <button
      type="button"
      class="close-btn"
      aria-label="Close chat"
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
