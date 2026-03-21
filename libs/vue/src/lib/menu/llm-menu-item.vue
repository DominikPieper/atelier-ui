<script setup lang="ts">
import { computed, inject } from 'vue';
import { LlmMenuTriggerKey } from './llm-menu-trigger.vue';

defineOptions({ name: 'LlmMenuItem' });

interface LlmMenuItemProps {
  disabled?: boolean;
}

const props = withDefaults(defineProps<LlmMenuItemProps>(), {
  disabled: false,
});

const emit = defineEmits<{
  triggered: [];
}>();

const triggerCtx = inject(LlmMenuTriggerKey, null);

function onClick() {
  if (props.disabled) return;
  emit('triggered');
  triggerCtx?.close();
}

const classes = computed(() => ['llm-menu-item', props.disabled && 'is-disabled']);
</script>

<template>
  <button
    :class="classes"
    role="menuitem"
    type="button"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>
