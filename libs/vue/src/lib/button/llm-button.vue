<script setup lang="ts">
import { computed } from 'vue';
import './llm-button.css';

defineOptions({ name: 'LlmButton' });

interface LlmButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<LlmButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
});

const isDisabled = computed(() => props.disabled || props.loading);

const classes = computed(() => [
  'llm-button',
  `variant-${props.variant}`,
  `size-${props.size}`,
  isDisabled.value && 'is-disabled',
  props.loading && 'is-loading',
].filter(Boolean));
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="isDisabled"
    :aria-disabled="isDisabled || undefined"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </button>
</template>
