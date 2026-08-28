<script setup lang="ts">
import { ref, watch, onMounted, computed, useId } from 'vue';
import './atl-checkbox.css';

defineOptions({ name: 'AtlCheckbox' });

interface AtlCheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  errors?: string[];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

const props = withDefaults(defineProps<AtlCheckboxProps>(), {
  checked: false,
  indeterminate: false,
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

const inputRef = ref<HTMLInputElement | null>(null);

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2)}`);
const errorsId = useId();

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
  <div class="atl-checkbox" :class="{ 'is-invalid': invalid, 'is-disabled': disabled }">
    <label :for="inputId" class="checkbox-label">
      <input
        :id="inputId"
        ref="inputRef"
        type="checkbox"
        :checked="checked"
        :disabled="disabled"
        :required="required"
        :name="name"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        @change="onChange"
      />
      <slot />
    </label>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
