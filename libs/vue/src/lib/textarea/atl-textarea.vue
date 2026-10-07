<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick, useId } from 'vue';
import '@atelier-ui/styles/textarea/atl-textarea.css';
import { warnIfUnnamedControl } from '../a11y-dev-warn';
import AtlIcon from '../icon/atl-icon.vue';
import type { AtlErrorItem } from '../spec';
import { errorMessage } from '../error-message';

defineOptions({ name: 'AtlTextarea' });

interface AtlTextareaProps {
  /** The current textarea value. Two-way bound via `v-model:value` (emits `update:value`). */
  value?: string;
  /** Number of visible text rows. */
  rows?: number;
  /** Placeholder text shown when the textarea is empty. */
  placeholder?: string;
  /** Whether the textarea has validation errors; sets `aria-invalid`. */
  invalid?: boolean;
  /** Validation error messages shown below the control and linked to it via `aria-describedby`. */
  errors?: ReadonlyArray<string | AtlErrorItem>;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
  /** Whether the textarea is read-only. */
  readonly?: boolean;
  /** Whether the textarea is required. */
  required?: boolean;
  /** Visible caption rendered as a `<label>` associated with the textarea. Omit it when the field is named some other way (an external `<label>`, or `aria-label`); without one of these the textarea has no accessible name. */
  label?: string;
  /** Whether the textarea height grows automatically to fit its content. */
  autoResize?: boolean;
  /** The textarea's `name` attribute. */
  name?: string;
  /** Explicit id for the native textarea. Wins over the auto-generated id, so an external `<label for>` or `aria-describedby` can point at it. */
  id?: string;
  /**
   * Accessible name for the native textarea, for when there is no visible
   * `label`. Declared as an explicit prop (not left to Vue's default
   * attribute fallthrough) so it lands on the native `<textarea>` — the
   * fallthrough target for an undeclared attribute is this component's
   * root `<div>`, which has no role and would leave the textarea unnamed.
   * camelCase here, like every other prop — see AtlInput's identical
   * `ariaLabel` for why (Vue camelizes both sides of prop-name matching, so
   * `props['aria-label']` in the script is never populated).
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<AtlTextareaProps>(), {
  value: '',
  rows: 3,
  placeholder: '',
  invalid: false,
  errors: () => [],
  disabled: false,
  readonly: false,
  required: false,
  label: '',
  autoResize: false,
  name: '',
  id: '',
  ariaLabel: '',
});

const errorsId = useId();
// useId(), not Math.random(): a random id inside a computed() re-rolls on
// every re-evaluation and differs between server and client render, breaking
// SSR hydration (same bug as AtlInput's — see ADR-0091).
const generatedId = useId();

const emit = defineEmits<{
  'update:value': [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const textareaId = computed(
  () => props.id || (props.label ? `textarea-${generatedId}` : undefined),
);

function adjustHeight() {
  if (props.autoResize && textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
  }
}

watch(
  () => props.value,
  async () => {
    await nextTick();
    adjustHeight();
  },
);

onMounted(() => {
  adjustHeight();
  warnIfUnnamedControl(
    textareaRef.value,
    'AtlTextarea',
    'set label or aria-label, or associate a <label for> with the textarea id',
  );
});

function onInput(event: Event) {
  emit('update:value', (event.target as HTMLTextAreaElement).value);
  adjustHeight();
}
</script>

<template>
  <div
    class="atl-textarea"
    :class="{
      'is-invalid': invalid,
      'is-disabled': disabled,
      'is-readonly': readonly,
      'is-auto-resize': autoResize,
    }"
  >
    <label v-if="label" :for="textareaId">{{ label }}</label>
    <div class="textarea-field">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="value"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :aria-label="ariaLabel || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        @input="onInput"
      />
      <AtlIcon v-if="invalid" name="danger" size="sm" class="invalid-icon" />
    </div>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">
        {{ errorMessage(error) }}
      </p>
    </div>
  </div>
</template>
