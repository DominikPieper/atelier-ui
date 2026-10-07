<script setup lang="ts">
import { computed, useId } from 'vue';
import '@atelier-ui/styles/toggle/atl-toggle.css';
import type { AtlErrorItem } from '../spec';
import { errorMessage } from '../error-message';

defineOptions({ name: 'AtlToggle' });

interface AtlToggleProps {
  /** The checked state. Two-way bound via `v-model:checked` (emits `update:checked`). */
  checked?: boolean;
  /** Whether the toggle has validation errors; sets `aria-invalid`. */
  invalid?: boolean;
  /** Validation error messages shown below the control and linked to it via `aria-describedby`. */
  errors?: ReadonlyArray<string | AtlErrorItem>;
  /** Whether the toggle is disabled. */
  disabled?: boolean;
  /** Whether the toggle is required. */
  required?: boolean;
  /** The input's `name` attribute. */
  name?: string;
  /** Explicit id for the native input. Wins over the auto-generated id, so an external `<label for>` can point at it. */
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

// useId(), not Math.random(): a random id inside a computed() re-rolls on every
// re-evaluation and differs between server and client render, breaking SSR
// hydration. useId() is stable per component instance.
const generatedId = useId();
const inputId = computed(() => props.id || `toggle-${generatedId}`);
const errorsId = useId();

function onChange(event: Event) {
  emit('update:checked', (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <div
    class="atl-toggle"
    :class="{
      'is-checked': checked,
      'is-invalid': invalid,
      'is-disabled': disabled,
    }"
  >
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
      <p v-for="(error, i) in errors" :key="i" class="error-message">
        {{ errorMessage(error) }}
      </p>
    </div>
  </div>
</template>
