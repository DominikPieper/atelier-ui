<script lang="ts">
import type { InjectionKey } from 'vue';

export interface LlmRadioGroupContext {
  value: string;
  name: string;
  disabled: boolean;
  readonly: boolean;
  invalid: boolean;
  onSelect: (value: string) => void;
}

export const LlmRadioGroupKey: InjectionKey<LlmRadioGroupContext> = Symbol('LlmRadioGroup');

export interface LlmRadioGroupProps {
  value?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  errors?: string[];
}
</script>

<script setup lang="ts">
import { computed, provide } from 'vue';
import './llm-radio-group.css';

defineOptions({ name: 'LlmRadioGroup' });

const props = withDefaults(defineProps<LlmRadioGroupProps>(), {
  value: '',
  name: '',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  errors: () => [],
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

provide(LlmRadioGroupKey, {
  get value() { return props.value ?? ''; },
  get name() { return props.name ?? ''; },
  get disabled() { return props.disabled ?? false; },
  get readonly() { return props.readonly ?? false; },
  get invalid() { return props.invalid ?? false; },
  onSelect(v: string) {
    if (!props.disabled && !props.readonly) {
      emit('update:value', v);
    }
  },
});

const classes = computed(() => [
  'llm-radio-group',
  props.invalid && 'is-invalid',
  props.disabled && 'is-disabled',
]);
</script>

<template>
  <div
    :class="classes"
    role="radiogroup"
    :aria-invalid="invalid || undefined"
    :aria-required="required || undefined"
  >
    <slot />
    <div v-if="errors.length > 0" class="errors" role="alert">
      <p v-for="(error, index) in errors" :key="index" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
