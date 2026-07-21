<script lang="ts">
import type { InjectionKey, Ref } from 'vue';

export interface AtlAccordionGroupProps {
  multi?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
}

export interface AtlAccordionGroupContext {
  multi: boolean;
  openItems: Ref<Set<string>>;
  toggleItem: (id: string) => void;
  registerItem: (id: string, el: HTMLButtonElement) => void;
  unregisterItem: (id: string) => void;
}

export const AtlAccordionGroupKey: InjectionKey<AtlAccordionGroupContext> =
  Symbol('AtlAccordionGroup');
</script>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import './atl-accordion.css';

defineOptions({ name: 'AtlAccordionGroup' });

const props = withDefaults(defineProps<AtlAccordionGroupProps>(), {
  multi: false,
  variant: 'default',
});

const openItems = ref<Set<string>>(new Set());
const itemButtons = new Map<string, HTMLButtonElement>();

function toggleItem(id: string) {
  const next = new Set(openItems.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    if (!props.multi) {
      next.clear();
    }
    next.add(id);
  }
  openItems.value = next;
}

function registerItem(id: string, el: HTMLButtonElement) {
  itemButtons.set(id, el);
}

function unregisterItem(id: string) {
  itemButtons.delete(id);
}

provide(AtlAccordionGroupKey, {
  get multi() {
    return props.multi;
  },
  openItems,
  toggleItem,
  registerItem,
  unregisterItem,
});

const classes = computed(() => ['atl-accordion-group', `variant-${props.variant}`]);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
