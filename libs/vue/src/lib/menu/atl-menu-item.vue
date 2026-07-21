<script setup lang="ts">
import { computed, inject } from 'vue';
import { AtlMenuTriggerKey } from './atl-menu-trigger.vue';

defineOptions({ name: 'AtlMenuItem' });

interface AtlMenuItemProps {
  disabled?: boolean;
}

const props = withDefaults(defineProps<AtlMenuItemProps>(), {
  disabled: false,
});

const emit = defineEmits<{
  triggered: [];
}>();

const triggerCtx = inject(AtlMenuTriggerKey, null);

function onClick() {
  if (props.disabled) return;
  emit('triggered');
  triggerCtx?.close();
}

const classes = computed(() => ['atl-menu-item', props.disabled && 'is-disabled']);
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
