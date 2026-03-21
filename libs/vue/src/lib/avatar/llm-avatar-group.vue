<script setup lang="ts">
import { computed, type VNode } from 'vue';
import './llm-avatar.css';

defineOptions({ name: 'LlmAvatarGroup' });

interface LlmAvatarGroupProps {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<LlmAvatarGroupProps>(), {
  max: 5,
  size: 'md',
});

const slots = defineSlots<{ default?(): VNode[] }>();

const allChildren = computed(() => slots.default?.() ?? []);
const visibleChildren = computed(() => allChildren.value.slice(0, props.max));
const overflowCount = computed(() => Math.max(0, allChildren.value.length - props.max));
</script>

<template>
  <div class="llm-avatar-group" :class="`size-${size}`">
    <component
      :is="child"
      v-for="(child, i) in visibleChildren"
      :key="i"
    />
    <div
      v-if="overflowCount > 0"
      :class="`overflow-badge size-${size}`"
      :aria-label="`+${overflowCount} more`"
    >
      +{{ overflowCount }}
    </div>
  </div>
</template>
