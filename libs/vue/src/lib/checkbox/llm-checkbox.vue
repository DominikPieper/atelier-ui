<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import './llm-checkbox.css';

defineOptions({ name: 'LlmCheckbox' });

interface LlmCheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<LlmCheckboxProps>(), {
  checked: false,
  indeterminate: false,
  invalid: false,
  errors: () => [],
  disabled: false,
  readonly: false,
  required: false,
  name: '',
  id: '',
});

const emit = defineEmits<{
  'update:checked': [value: boolean];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2)}`);

watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value) inputRef.value.indeterminate = val;
  }
);

onMounted(() => {
  if (inputRef.value) inputRef.value.indeterminate = props.indeterminate;
});

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:checked', target.checked);
}
</script>

<template>
  <div class="llm-checkbox" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
    <label :for="inputId" class="checkbox-label">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        :checked="checked"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :aria-invalid="invalid || undefined"
        @change="onChange"
      />
      <slot />
    </label>
    <ul v-if="errors.length" class="errors" aria-live="polite">
      <li v-for="(error, i) in errors" :key="i" class="error">{{ error }}</li>
    </ul>
  </div>
</template>
