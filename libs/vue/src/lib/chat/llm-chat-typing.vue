<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LlmChatTyping' });

interface LlmChatTypingProps {
  /** When true, renders as an inline cursor without bubble chrome. */
  inline?: boolean;
}

const props = withDefaults(defineProps<LlmChatTypingProps>(), {
  inline: false,
});

const classes = computed(() => [
  'llm-chat-typing',
  props.inline && 'is-inline',
]);
</script>

<template>
  <div :class="classes" role="status" aria-live="polite">
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
    <span class="sr-only">Assistant is typing</span>
  </div>
</template>
