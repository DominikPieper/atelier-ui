<script setup lang="ts">
defineOptions({ name: 'AtlChatSuggestion' });

interface AtlChatSuggestionProps {
  label: string;
  hint?: string;
}

const props = defineProps<AtlChatSuggestionProps>();

const emit = defineEmits<{
  selected: [label: string];
}>();
</script>

<template>
  <div class="atl-chat-suggestion">
    <button type="button" class="chip" @click="emit('selected', props.label)">
      <span class="chip-label">{{ props.label }}</span>
      <span v-if="props.hint" class="chip-hint">{{ props.hint }}</span>
    </button>
  </div>
</template>
