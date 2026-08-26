<script setup lang="ts">
import { inject, ref } from 'vue';
import { AtlChatKey } from './atl-chat.vue';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlChatHeader' });

const ctx = inject(AtlChatKey, {
  headerId: '',
  status: ref('idle' as const),
  close: () => undefined,
  toggle: () => undefined,
});
</script>

<template>
  <div :id="ctx.headerId" class="atl-chat-header">
    <div class="title-block">
      <slot />
    </div>
    <button
      type="button"
      class="close-btn"
      aria-label="Close chat"
      @click="ctx.close()"
    >
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
