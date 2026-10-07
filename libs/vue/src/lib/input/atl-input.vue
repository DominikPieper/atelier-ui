<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue';
import '@atelier-ui/styles/input/atl-input.css';
import { warnIfUnnamedControl } from '../a11y-dev-warn';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlInput' });

interface AtlInputProps {
  /** The current input value. Two-way bound via `v-model:value` (emits `update:value`). */
  value?: string;
  /** The type of input field. */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Whether the input has validation errors; sets `aria-invalid`. */
  invalid?: boolean;
  /** Validation error messages shown below the control and linked to it via `aria-describedby`. */
  errors?: string[];
  /** Whether the input is disabled. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readonly?: boolean;
  /** Whether the input is required. */
  required?: boolean;
  /** Visible caption rendered as a `<label>` associated with the input. Omit it when the field is named some other way (an external `<label>`, or `aria-label`); without one of these the input has no accessible name. */
  label?: string;
  /** The input's `name` attribute. */
  name?: string;
  /** Explicit id for the native input. Wins over the auto-generated id, so an external `<label for>` or `aria-describedby` can point at it. */
  id?: string;
  /**
   * Accessible name for the native input, for when there is no visible
   * `label`. Declared as an explicit prop (not left to Vue's default
   * attribute fallthrough) so it lands on the native `<input>` — the
   * fallthrough target for an undeclared attribute is this component's
   * root `<div>`, which has no role and would leave the input unnamed.
   * camelCase here, like every other prop: Vue's runtime camelizes BOTH
   * the declared option key and an incoming raw prop key before matching
   * them, so `props['aria-label']` in the script is never populated —
   * only the camelized `props.ariaLabel` is (measured; see ADR-0091). The
   * template still accepts either casing (`aria-label=` or `ariaLabel=`)
   * since Vue's template compiler does its own camelCase conversion.
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AtlInputProps>(), {
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
  ariaLabel: '',
});

const errorsId = useId();
// useId(), not Math.random(): a random id inside a computed() re-rolls on every
// re-evaluation and differs between server and client render, breaking SSR
// hydration. useId() is stable per component instance.
const generatedId = useId();

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const inputId = computed(
  () => props.id || (props.label ? `input-${generatedId}` : undefined),
);

const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() =>
  warnIfUnnamedControl(
    inputRef.value,
    'AtlInput',
    'set label or aria-label, or associate a <label for> with the input id',
  ),
);

function onInput(event: Event) {
  emit('update:value', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div
    class="atl-input"
    :class="{
      'is-invalid': invalid,
      'is-disabled': disabled,
      'is-readonly': readonly,
    }"
  >
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div class="input-field">
      <input
        ref="inputRef"
        :id="inputId"
        :type="type"
        :value="value"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :aria-label="ariaLabel || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        :aria-required="required || undefined"
        @input="onInput"
      />
      <AtlIcon v-if="invalid" name="danger" size="sm" class="invalid-icon" />
    </div>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">
        {{ error }}
      </p>
    </div>
  </div>
</template>
