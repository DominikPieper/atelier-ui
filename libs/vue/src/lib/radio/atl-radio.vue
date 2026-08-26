<script setup lang="ts">
import { computed, inject } from 'vue';
import { AtlRadioGroupKey } from '../radio-group/atl-radio-group.vue';
import './atl-radio.css';

defineOptions({ name: 'AtlRadio' });

interface AtlRadioProps {
  radioValue: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<AtlRadioProps>(), {
  disabled: false,
});

const ctx = inject(AtlRadioGroupKey, {
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
  'atl-radio',
  isDisabled.value && 'is-disabled',
  isChecked.value && 'is-checked',
  ctx.invalid && 'is-invalid',
].filter(Boolean));

function onChange() {
  if (!isDisabled.value && !ctx.readonly) {
    ctx.onSelect(props.radioValue);
  }
}

// HTML ignores `readonly` on a radio, so the guard above stops the model but not
// the input's own DOM state — and nothing re-renders to correct it, since nothing
// changed. Cancelling the click makes the browser restore the previous selection
// (verified in chromium). See ADR-0045.
function onClick(event: MouseEvent) {
  if (ctx.readonly) event.preventDefault();
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
      @click="onClick"
      class="radio-input"
      @change="onChange"
    />
    <span class="radio-indicator" aria-hidden="true" />
    <span v-if="$slots.default" class="radio-text">
      <slot />
    </span>
  </label>
</template>
