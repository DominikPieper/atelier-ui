<script setup lang="ts">
import { ref, watch, onMounted, computed, useId } from 'vue';
import '@atelier-ui/styles/checkbox/atl-checkbox.css';
import type { AtlErrorItem } from '../spec';
import { errorMessage } from '../error-message';

defineOptions({ name: 'AtlCheckbox' });

interface AtlCheckboxProps {
  /** The checked state. Two-way bound via `v-model:checked` (emits `update:checked`). */
  checked?: boolean;
  /** Tri-state indeterminate mode (e.g. "select all"), shown as a dash. Applied to the native input's DOM property. */
  indeterminate?: boolean;
  /** Whether the checkbox has validation errors; sets `aria-invalid`. */
  invalid?: boolean;
  /** Validation error messages shown below the control and linked to it via `aria-describedby`. */
  errors?: ReadonlyArray<string | AtlErrorItem>;
  /** Whether the checkbox is disabled. */
  disabled?: boolean;
  /** Whether the checkbox is required. */
  required?: boolean;
  /** The input's `name` attribute. */
  name?: string;
  /** Explicit id for the native input. Wins over the auto-generated id, so an external `<label for>` can point at it. */
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

const errorsId = useId();
// useId(), not Math.random(): a random id inside a computed() re-rolls on every
// re-evaluation and differs between server and client render, breaking SSR
// hydration. useId() is stable per component instance.
const generatedId = useId();

const inputId = computed(() => props.id || `checkbox-${generatedId}`);

watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value) inputRef.value.indeterminate = val;
  },
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
  <div
    class="atl-checkbox"
    :class="{ 'is-invalid': invalid, 'is-disabled': disabled }"
  >
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
      <p v-for="(error, i) in errors" :key="i" class="error-message">
        {{ errorMessage(error) }}
      </p>
    </div>
  </div>
</template>
