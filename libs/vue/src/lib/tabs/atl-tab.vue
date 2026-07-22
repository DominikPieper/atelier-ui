<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useId } from 'vue';
import { AtlTabGroupKey } from './atl-tab-group.vue';

defineOptions({ name: 'AtlTab' });

interface AtlTabProps {
  label: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<AtlTabProps>(), {
  disabled: false,
});

const group = inject(AtlTabGroupKey)!;
const id = useId();

onMounted(() => {
  group.registerTab({ id, label: props.label, disabled: props.disabled });
});

onBeforeUnmount(() => {
  group.unregisterTab(id);
});

const myIndex = computed(() => group.tabs.value.findIndex((t) => t.id === id));
const isActive = computed(() => myIndex.value === group.selectedIndex.value);

// Derive the ids the group renders on its tab buttons/aria-controls, so the
// panel carries the id the button points at and is labelled by its tab.
const panelId = computed(() =>
  myIndex.value >= 0 ? `${group.groupId}-panel-${myIndex.value}` : undefined
);
const tabId = computed(() =>
  myIndex.value >= 0 ? `${group.groupId}-tab-${myIndex.value}` : undefined
);
</script>

<template>
  <div
    v-if="myIndex >= 0"
    :id="panelId"
    role="tabpanel"
    :hidden="!isActive"
    class="tab-panel"
    :aria-labelledby="tabId"
    tabindex="0"
  >
    <slot />
  </div>
</template>
