<script setup lang="ts">
import { computed } from 'vue';
import './llm-input.css';

defineOptions({ name: 'LlmInput' });

interface LlmInputProps {
  value?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  label?: string;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<LlmInputProps>(), {
  value: '',
  type: 'text',
  placeholder: '',
  invalid: false,
  errors: () => [],
  disabled: false,
  readonly: false,
  required: false,
  label: '',
  name: '',
  id: '',
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const inputId = computed(() => props.id || (props.label ? `input-${Math.random().toString(36).slice(2)}` : undefined));

function onInput(event: Event) {
  emit('update:value', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="llm-input" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    <div class="input-field">
      <input
        :id="inputId"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :aria-invalid="invalid || undefined"
        @input="onInput"
      />
    </div>
    <ul v-if="errors.length" class="errors" aria-live="polite">
      <li v-for="(error, i) in errors" :key="i" class="error">{{ error }}</li>
    </ul>
  </div>
</template>
