<script setup lang="ts">
defineOptions({ name: 'LlmChatTyping' });
</script>

<template>
  <div class="llm-chat-typing" role="status" aria-live="polite">
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
    <span class="sr-only">Assistant is typing</span>
  </div>
</template>
