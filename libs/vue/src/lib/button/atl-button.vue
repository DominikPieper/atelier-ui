<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import '@atelier-ui/styles/button/atl-button.css';

defineOptions({ name: 'AtlButton' });

interface AtlButtonProps {
  /** Visual style of the button. */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  /** Size of the button. */
  size?: 'sm' | 'md' | 'lg';
  /** Disables the button, preventing interaction. */
  disabled?: boolean;
  /** Shows a loading spinner and disables interaction. */
  loading?: boolean;
  /** Native `type` attribute of the button. */
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<AtlButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
});

const isDisabled = computed(() => props.disabled || props.loading);

const classes = computed(() =>
  [
    'atl-button',
    `variant-${props.variant}`,
    `size-${props.size}`,
    isDisabled.value && 'is-disabled',
    props.loading && 'is-loading',
  ].filter(Boolean),
);

// Dev-mode warning when a button has no accessible name. Vue's <slot>
// projection means we can't enforce this at the type level (unlike the
// React adapter), so we check after mount.
const buttonRef = ref<HTMLButtonElement | null>(null);
onMounted(() => {
  if (import.meta.env?.DEV !== true) return;
  const el = buttonRef.value;
  if (!el) return;
  const hasText = (el.textContent ?? '').trim().length > 0;
  const hasAriaLabel =
    el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
  if (!hasText && !hasAriaLabel) {
    console.warn(
      '[AtlButton] icon-only button is missing an accessible name — ' +
        'add an aria-label attribute so screen readers announce its purpose.',
      el,
    );
  }
});
</script>

<template>
  <button
    ref="buttonRef"
    :class="classes"
    :type="type"
    :disabled="isDisabled"
    :aria-disabled="isDisabled || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
