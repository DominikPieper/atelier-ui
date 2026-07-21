<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

defineOptions({ name: 'AtlChatMessages' });

const root = useTemplateRef<HTMLDivElement>('root');
let observer: MutationObserver | null = null;

onMounted(() => {
  const el = root.value;
  if (!el) return;
  const stickToBottom = () => { el.scrollTop = el.scrollHeight; };
  stickToBottom();
  observer = new MutationObserver(stickToBottom);
  observer.observe(el, { childList: true, subtree: true, characterData: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div ref="root" class="atl-chat-messages">
    <slot />
  </div>
</template>
