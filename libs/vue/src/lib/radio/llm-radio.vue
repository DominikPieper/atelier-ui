<script setup lang="ts">
import { computed, inject } from 'vue';
import { LlmRadioGroupKey } from '../radio-group/llm-radio-group.vue';
import './llm-radio.css';

defineOptions({ name: 'LlmRadio' });

interface LlmRadioProps {
  radioValue: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<LlmRadioProps>(), {
  disabled: false,
});

const ctx = inject(LlmRadioGroupKey, {
  value: '',
  name: '',
  disabled: false,
  readonly: false,
  invalid: false,
  onSelect: () => undefined,
});

const isDisabled = computed(() => props.disabled || ctx.disabled);
const isChecked = computed(() => ctx.value === props.radioValue);

const classes = computed(() => [
  'llm-radio',
  isDisabled.value && 'is-disabled',
  isChecked.value && 'is-checked',
  ctx.invalid && 'is-invalid',
].filter(Boolean));

function onChange() {
  if (!isDisabled.value && !ctx.readonly) {
    ctx.onSelect(props.radioValue);
  }
}
</script>

<template>
  <label :class="classes">
    <input
      type="radio"
      :name="ctx.name || undefined"
      :value="radioValue"
      :checked="isChecked"
      :disabled="isDisabled"
      class="radio-input"
      @change="onChange"
    />
    <span class="radio-indicator" aria-hidden="true" />
    <span v-if="$slots.default" class="radio-text">
      <slot />
    </span>
  </label>
</template>
