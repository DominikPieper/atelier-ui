<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useId } from 'vue';
import { LlmTabGroupKey } from './llm-tab-group.vue';

defineOptions({ name: 'LlmTab' });

interface LlmTabProps {
  label: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<LlmTabProps>(), {
  disabled: false,
});

const group = inject(LlmTabGroupKey)!;
const id = useId();

onMounted(() => {
  group.registerTab({ id, label: props.label, disabled: props.disabled });
});

onBeforeUnmount(() => {
  group.unregisterTab(id);
});

const myIndex = computed(() => group.tabs.value.findIndex((t) => t.id === id));
const isActive = computed(() => myIndex.value === group.selectedIndex.value);

// Derive IDs matching what the group renders
const groupPanelId = computed(() => {
  // We cannot access the groupId directly from here; rely on aria-labelledby via tab index
  return undefined;
});
</script>

<template>
  <div
    v-if="myIndex >= 0"
    role="tabpanel"
    :hidden="!isActive"
    class="tab-panel"
    :aria-labelledby="undefined"
    tabindex="0"
  >
    <slot />
  </div>
</template>
