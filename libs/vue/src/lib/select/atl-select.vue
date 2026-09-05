<script setup lang="ts">
import { computed, useId } from 'vue';
import './atl-select.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlSelect' });

interface AtlSelectProps {
  value?: string;
  placeholder?: string;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
  /**
   * Accessible name for the native select, for when there is no visible
   * `label`. Declared as an explicit prop (not left to Vue's default
   * attribute fallthrough) so it lands on the native `<select>` — the
   * fallthrough target for an undeclared attribute is this component's
   * root `<div>`, which has no role and would leave the select unnamed.
   * camelCase here, like every other prop — see AtlInput's identical
   * `ariaLabel` for why (Vue camelizes both sides of prop-name matching, so
   * `props['aria-label']` in the script is never populated).
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AtlSelectProps>(), {
  value: '',
  placeholder: undefined,
  invalid: false,
  errors: () => [],
  disabled: false,
  required: false,
  label: undefined,
  name: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const selectId = useId();
const errorsId = useId();

const wrapperClasses = computed(() => [
  'atl-select',
  props.invalid && 'is-invalid',
  props.disabled && 'is-disabled',
]);

function onChange(event: Event) {
  if (props.disabled) return;
  emit('update:value', (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div :class="wrapperClasses">
    <label v-if="label" :for="selectId">{{ label }}</label>
    <div class="select-wrapper">
      <select
        :id="selectId"
        :name="name"
        :value="value"
        :disabled="disabled"
        :required="required"
        :aria-label="ariaLabel || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        class="select-native"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
        <slot />
      </select>
      <AtlIcon v-if="invalid" name="danger" size="sm" class="invalid-icon" />
      <span class="select-arrow" aria-hidden="true"><AtlIcon name="chevron-down" size="sm" /></span>
    </div>
    <div v-if="errors.length > 0" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, index) in errors" :key="index" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
