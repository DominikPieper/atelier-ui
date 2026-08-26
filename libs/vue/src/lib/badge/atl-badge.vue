<script setup lang="ts">
import { computed } from 'vue';
import './atl-badge.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlBadge' });

type AtlBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface AtlBadgeProps {
  variant?: AtlBadgeVariant;
  size?: 'sm' | 'md';
}

// Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
// was the fifth way this library drew an icon, and the one check:iconography
// missed (ADR-0050).
const VARIANT_ICON_NAMES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const props = withDefaults(defineProps<AtlBadgeProps>(), {
  variant: 'default',
  size: 'md',
});

const classes = computed(() => [
  'atl-badge',
  `variant-${props.variant}`,
  `size-${props.size}`,
]);

const variantIconName = computed(() => VARIANT_ICON_NAMES[props.variant as keyof typeof VARIANT_ICON_NAMES]);
</script>

<template>
  <span :class="classes" role="status">
    <AtlIcon v-if="variantIconName" class="variant-icon" :name="variantIconName" size="sm" />
    <slot />
  </span>
</template>
