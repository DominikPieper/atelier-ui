<script setup lang="ts">
import { computed, useId } from 'vue';
import './atl-toggle.css';

defineOptions({ name: 'AtlToggle' });

interface AtlToggleProps {
  checked?: boolean;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<AtlToggleProps>(), {
  checked: false,
  invalid: false,
  errors: () => [],
  disabled: false,
  required: false,
  name: '',
  id: '',
});

const emit = defineEmits<{
  'update:checked': [value: boolean];
}>();

const inputId = computed(() => props.id || `toggle-${Math.random().toString(36).slice(2)}`);
const errorsId = useId();

function onChange(event: Event) {
  emit('update:checked', (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <div class="atl-toggle" :class="{ 'is-checked': checked, 'is-invalid': invalid, 'is-disabled': disabled }">
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
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        @change="onChange"
      />
      <span class="track">
        <span class="thumb" />
      </span>
      <slot />
    </label>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
