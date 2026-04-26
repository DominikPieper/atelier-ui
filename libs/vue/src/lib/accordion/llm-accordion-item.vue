<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { LlmAccordionGroupKey } from './llm-accordion-group.vue';

defineOptions({ name: 'LlmAccordionItem' });

interface LlmAccordionItemProps {
  expanded?: boolean;
  disabled?: boolean;
  /**
   * HTML heading level wrapping the trigger button. Default `3`.
   * Match your page's heading outline so heading order stays valid.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const props = withDefaults(defineProps<LlmAccordionItemProps>(), {
  expanded: undefined,
  disabled: false,
  headingLevel: 3,
});

const headingTag = computed(() => `h${props.headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

const emit = defineEmits<{
  'update:expanded': [expanded: boolean];
}>();

const id = useId();
const triggerId = `llm-accordion-trigger-${id}`;
const panelId = `llm-accordion-panel-${id}`;

const group = inject(LlmAccordionGroupKey, null);
const triggerRef = ref<HTMLButtonElement | null>(null);

// Determine if controlled by group or by external prop
const isExpanded = computed(() => {
  if (group) {
    return group.openItems.value.has(id);
  }
  return props.expanded ?? false;
});

function toggle() {
  if (props.disabled) return;
  if (group) {
    group.toggleItem(id);
  } else {
    emit('update:expanded', !isExpanded.value);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!group) return;
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.llm-accordion-item:not(.is-disabled) .accordion-trigger')
  );
  const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    buttons[(index + 1) % buttons.length]?.focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
  } else if (event.key === 'Home') {
    event.preventDefault();
    buttons[0]?.focus();
  } else if (event.key === 'End') {
    event.preventDefault();
    buttons[buttons.length - 1]?.focus();
  }
}

onMounted(() => {
  if (group && triggerRef.value) {
    group.registerItem(id, triggerRef.value);
  }
  // If expanded prop is true on mount and not in group, initialize
  if (!group && props.expanded) {
    // already reflected via computed
  }
});

// Sync initial expanded prop into group
watch(
  () => props.expanded,
  (val) => {
    if (!group || val === undefined) return;
    const isOpen = group.openItems.value.has(id);
    if (val && !isOpen) group.toggleItem(id);
    else if (!val && isOpen) group.toggleItem(id);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (group) {
    group.unregisterItem(id);
  }
});

const itemClasses = computed(() => [
  'llm-accordion-item',
  isExpanded.value && 'is-expanded',
  props.disabled && 'is-disabled',
]);

const chevronClasses = computed(() => ['chevron', isExpanded.value && 'is-expanded']);
</script>

<template>
  <div :class="itemClasses">
    <component :is="headingTag" class="accordion-heading">
      <button
        :id="triggerId"
        ref="triggerRef"
        class="accordion-trigger"
        type="button"
        :aria-expanded="isExpanded"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="toggle"
        @keydown="onKeydown"
      >
        <slot name="header" />
        <svg
          :class="chevronClasses"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </component>
    <div class="accordion-panel-wrapper" :class="isExpanded && 'is-expanded'">
      <div
        :id="panelId"
        role="region"
        :aria-labelledby="triggerId"
        class="accordion-panel"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
