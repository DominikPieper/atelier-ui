<script setup lang="ts">
import { computed } from 'vue';
import './atl-alert.css';
import type { AtlIconName } from '../spec';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlAlert' });

type AtlAlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AtlAlertProps {
  variant?: AtlAlertVariant;
  dismissible?: boolean;
}

// Which AtlIcon each variant carries. Names, not glyphs: a glyph in a string map
// was the fifth way this library drew an icon, and the one check:iconography
// missed (ADR-0050).
const VARIANT_ICON_NAMES: Partial<Record<AtlAlertVariant, AtlIconName>> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const props = withDefaults(defineProps<AtlAlertProps>(), {
  variant: 'info',
  dismissible: false,
});

const emit = defineEmits<{
  dismissed: [];
}>();

const classes = computed(() => ['atl-alert', `variant-${props.variant}`]);

const ariaLive = computed(() =>
  props.variant === 'danger' || props.variant === 'warning' ? 'assertive' : 'polite'
);

const variantIconName = computed(() => VARIANT_ICON_NAMES[props.variant]);
</script>

<template>
  <div :class="classes" role="alert" :aria-live="ariaLive">
    <span class="content">
      <AtlIcon v-if="variantIconName" class="variant-icon" :name="variantIconName" size="sm" />
      <slot />
    </span>
    <button
      v-if="dismissible"
      class="dismiss"
      type="button"
      aria-label="Dismiss"
      @click="emit('dismissed')"
    >
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
