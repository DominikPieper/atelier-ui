<script setup lang="ts">
import { computed } from 'vue';
import './llm-toggle.css';

defineOptions({ name: 'LlmToggle' });

interface LlmToggleProps {
  checked?: boolean;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<LlmToggleProps>(), {
  checked: false,
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

const inputId = computed(() => props.id || `toggle-${Math.random().toString(36).slice(2)}`);

function onChange(event: Event) {
  if (props.readonly) return;
  emit('update:checked', (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <div class="llm-toggle" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
    <label :for="inputId" class="toggle-label">
      <input
        :id="inputId"
        type="checkbox"
        role="switch"
        :checked="checked"
        :disabled="disabled"
        :required="required"
        :name="name"
        :aria-invalid="invalid || undefined"
        :aria-checked="checked"
        @change="onChange"
      />
      <span class="track">
        <span class="thumb" />
      </span>
      <slot />
    </label>
    <ul v-if="errors.length" class="errors" aria-live="polite">
      <li v-for="(error, i) in errors" :key="i" class="error">{{ error }}</li>
    </ul>
  </div>
</template>
