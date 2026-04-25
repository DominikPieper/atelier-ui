<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { LlmChatKey } from './llm-chat.vue';

defineOptions({ name: 'LlmChatInput' });

interface LlmChatInputProps {
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<LlmChatInputProps>(), {
  value: undefined,
  placeholder: '',
  ariaLabel: 'Message your AI assistant',
});

const emit = defineEmits<{
  'update:value': [value: string];
  send: [text: string];
  stop: [];
}>();

const ctx = inject(LlmChatKey, {
  headerId: '',
  status: ref('idle' as const),
  close: () => undefined,
  toggle: () => undefined,
});

const internal = ref('');
const isControlled = computed(() => props.value !== undefined);
const current = computed({
  get: () => (isControlled.value ? (props.value ?? '') : internal.value),
  set: (next: string) => {
    if (!isControlled.value) internal.value = next;
    emit('update:value', next);
  },
});

const isStreaming = computed(() => ctx.status.value === 'streaming');

const effectivePlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  switch (ctx.status.value) {
    case 'streaming': return 'Waiting for response…';
    case 'error': return 'Try again…';
    default: return 'Message your AI assistant…';
  }
});

function emitSend() {
  const text = current.value.trim();
  if (!text || isStreaming.value) return;
  emit('send', text);
  current.value = '';
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    emitSend();
  }
}

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  current.value = target.value;
}
</script>

<template>
  <div class="llm-chat-input">
    <textarea
      class="field"
      rows="1"
      :value="current"
      :placeholder="effectivePlaceholder"
      :disabled="isStreaming"
      :aria-label="props.ariaLabel"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      v-if="isStreaming"
      type="button"
      class="action-btn variant-danger size-md"
      @click="emit('stop')"
    >
      Stop
    </button>
    <button
      v-else
      type="button"
      class="action-btn variant-primary size-md"
      :disabled="!current.trim()"
      @click="emitSend"
    >
      Send
    </button>
  </div>
</template>
