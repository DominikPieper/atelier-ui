<script setup lang="ts">
import { computed, useId } from 'vue';
import './llm-select.css';

defineOptions({ name: 'LlmSelect' });

interface LlmSelectProps {
  value?: string;
  placeholder?: string;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
}

const props = withDefaults(defineProps<LlmSelectProps>(), {
  value: '',
  placeholder: undefined,
  invalid: false,
  errors: () => [],
  disabled: false,
  readonly: false,
  required: false,
  label: undefined,
  name: undefined,
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const selectId = useId();
const errorsId = useId();

const wrapperClasses = computed(() => [
  'llm-select',
  props.invalid && 'is-invalid',
  props.disabled && 'is-disabled',
]);

function onChange(event: Event) {
  if (props.readonly || props.disabled) return;
  emit('update:value', (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div :class="wrapperClasses">
    <label v-if="label" :for="selectId" class="select-label">{{ label }}</label>
    <div class="select-wrapper">
      <select
        :id="selectId"
        :name="name"
        :value="value"
        :disabled="disabled"
        :required="required"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        class="select-native"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
        <slot />
      </select>
      <span class="select-arrow" aria-hidden="true">▾</span>
    </div>
    <div v-if="errors.length > 0" :id="errorsId" class="errors" role="alert">
      <p v-for="(error, index) in errors" :key="index" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
