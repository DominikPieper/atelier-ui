<script setup lang="ts">
import { computed } from 'vue';
import type { LlmChatMessageRole } from '../spec';

defineOptions({ name: 'LlmChatMessage' });

interface LlmChatMessageProps {
  role?: LlmChatMessageRole;
  failed?: boolean;
}

const props = withDefaults(defineProps<LlmChatMessageProps>(), {
  role: 'assistant',
  failed: false,
});

const classes = computed(() => [
  'llm-chat-message',
  `role-${props.role}`,
  props.failed && 'is-failed',
]);
</script>

<template>
  <div role="listitem" :class="classes">
    <slot />
  </div>
</template>
