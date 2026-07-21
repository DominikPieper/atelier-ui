<script setup lang="ts">
import { computed } from 'vue';
import type { AtlIconName, AtlIconSize } from '../spec';
import './atl-icon.css';

defineOptions({ name: 'AtlIcon' });

interface AtlIconProps {
  name: AtlIconName;
  size?: AtlIconSize;
  /**
   * Accessible label. When provided, the icon is announced as an image with
   * this label. When omitted, the icon is hidden from assistive tech.
   */
  label?: string;
}

const props = withDefaults(defineProps<AtlIconProps>(), {
  size: 'md',
  label: undefined,
});

const ICON_GLYPHS: Record<AtlIconName, string> = {
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

const classes = computed(() => ['atl-icon', `size-${props.size}`]);
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
