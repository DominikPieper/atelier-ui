<script setup lang="ts">
import { computed } from 'vue';
import type { AtlChatMessageRole } from '../spec';

defineOptions({ name: 'AtlChatMessage' });

interface AtlChatMessageProps {
  role?: AtlChatMessageRole;
  failed?: boolean;
}

const props = withDefaults(defineProps<AtlChatMessageProps>(), {
  role: 'assistant',
  failed: false,
});

const classes = computed(() => [
  'atl-chat-message',
  `role-${props.role}`,
  props.failed && 'is-failed',
]);
</script>

<template>
  <div role="listitem" :class="classes">
    <slot />
  </div>
</template>
