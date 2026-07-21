<script lang="ts">
import type { InjectionKey, Ref } from 'vue';

export interface AtlTabInfo {
  id: string;
  label: string;
  disabled: boolean;
}

export interface AtlTabGroupContext {
  selectedIndex: Ref<number>;
  tabs: Ref<AtlTabInfo[]>;
  registerTab: (tab: AtlTabInfo) => void;
  unregisterTab: (id: string) => void;
  selectTab: (index: number) => void;
}

export const AtlTabGroupKey: InjectionKey<AtlTabGroupContext> = Symbol('AtlTabGroup');

export interface AtlTabGroupProps {
  selectedIndex?: number;
  variant?: 'default' | 'pills';
}
</script>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import './atl-tabs.css';

defineOptions({ name: 'AtlTabGroup' });

const props = withDefaults(defineProps<AtlTabGroupProps>(), {
  selectedIndex: 0,
  variant: 'default',
});

const emit = defineEmits<{
  'update:selectedIndex': [index: number];
}>();

const internalIndex = ref(props.selectedIndex);
const tabs = ref<AtlTabInfo[]>([]);

watch(
  () => props.selectedIndex,
  (val) => {
    internalIndex.value = val;
  }
);

function registerTab(tab: AtlTabInfo) {
  tabs.value.push(tab);
}

function unregisterTab(id: string) {
  tabs.value = tabs.value.filter((t) => t.id !== id);
}

function selectTab(index: number) {
  internalIndex.value = index;
  emit('update:selectedIndex', index);
}

provide(AtlTabGroupKey, {
  selectedIndex: internalIndex,
  tabs,
  registerTab,
  unregisterTab,
  selectTab,
});

function onKeydown(event: KeyboardEvent) {
  const enabledIndices = tabs.value
    .map((t, i) => ({ i, disabled: t.disabled }))
    .filter((x) => !x.disabled)
    .map((x) => x.i);

  const currentPos = enabledIndices.indexOf(internalIndex.value);

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    const next = enabledIndices[(currentPos + 1) % enabledIndices.length];
    if (next !== undefined) selectTab(next);
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    const prev = enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    if (prev !== undefined) selectTab(prev);
  } else if (event.key === 'Home') {
    event.preventDefault();
    if (enabledIndices[0] !== undefined) selectTab(enabledIndices[0]);
  } else if (event.key === 'End') {
    event.preventDefault();
    const last = enabledIndices[enabledIndices.length - 1];
    if (last !== undefined) selectTab(last);
  }
}

const groupId = `atl-tab-group-${Math.random().toString(36).slice(2, 9)}`;
const classes = computed(() => ['atl-tab-group', `variant-${props.variant}`]);
</script>

<template>
  <div :class="classes">
    <div class="tablist" role="tablist" @keydown="onKeydown">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        role="tab"
        :id="`${groupId}-tab-${index}`"
        :aria-selected="index === internalIndex"
        :aria-controls="`${groupId}-panel-${index}`"
        :tabindex="index === internalIndex ? 0 : -1"
        :disabled="tab.disabled"
        :class="['tab-button', index === internalIndex && 'is-active', tab.disabled && 'is-disabled']"
        type="button"
        @click="!tab.disabled && selectTab(index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-panels">
      <slot :group-id="groupId" />
    </div>
  </div>
</template>
