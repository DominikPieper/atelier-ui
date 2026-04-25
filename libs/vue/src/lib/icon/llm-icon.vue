<script setup lang="ts">
import { computed } from 'vue';
import type { LlmIconName, LlmIconSize } from '../spec';
import './llm-icon.css';

defineOptions({ name: 'LlmIcon' });

interface LlmIconProps {
  name: LlmIconName;
  size?: LlmIconSize;
  /**
   * Accessible label. When provided, the icon is announced as an image with
   * this label. When omitted, the icon is hidden from assistive tech.
   */
  label?: string;
}

const props = withDefaults(defineProps<LlmIconProps>(), {
  size: 'md',
  label: undefined,
});

const ICON_GLYPHS: Record<LlmIconName, string> = {
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
  error: '!',
  'chevron-up': '▲',
  'chevron-down': '▼',
  'chevron-left': '‹',
  'chevron-right': '›',
  'sort-asc': '↑',
  'sort-desc': '↓',
  'arrow-right': '→',
  'arrow-left': '←',
  copy: '⎘',
  paste: '⎗',
  add: '⊕',
  edit: '✏',
  delete: '🗑',
  close: '×',
  more: '…',
  'default-toast': '💬',
};

const classes = computed(() => ['llm-icon', `size-${props.size}`]);
const glyph = computed(() => ICON_GLYPHS[props.name]);
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >{{ glyph }}</span>
</template>
