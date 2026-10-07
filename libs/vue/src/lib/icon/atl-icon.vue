<script setup lang="ts">
import { computed } from 'vue';
import type { AtlIconName, AtlIconSize } from '../spec';
import {
  ATL_ICON_GEOMETRY,
  ATL_ICON_STROKE_WIDTH,
  ATL_ICON_VIEWBOX,
} from '../icons';
import '@atelier-ui/styles/icon/atl-icon.css';

defineOptions({ name: 'AtlIcon' });

interface AtlIconProps {
  /** The icon to render. Required. */
  name: AtlIconName;
  /** Icon size: `sm` 16px, `md` 20px, `lg` 24px. The same 24-unit geometry is scaled. */
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

const classes = computed(() => ['atl-icon', `size-${props.size}`]);
const geometry = computed(() => ATL_ICON_GEOMETRY[props.name]);
const isStroke = computed(() => geometry.value.kind === 'stroke');
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <svg
      :viewBox="ATL_ICON_VIEWBOX"
      :fill="isStroke ? 'none' : 'currentColor'"
      :stroke="isStroke ? 'currentColor' : undefined"
      :stroke-width="isStroke ? ATL_ICON_STROKE_WIDTH : undefined"
      :stroke-linecap="isStroke ? 'round' : undefined"
      :stroke-linejoin="isStroke ? 'round' : undefined"
      aria-hidden="true"
      focusable="false"
    >
      <path v-for="d in geometry.paths" :key="d" :d="d" />
    </svg>
  </span>
</template>
