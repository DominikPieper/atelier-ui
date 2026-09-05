<script setup lang="ts">
import { computed, useId } from 'vue';
import './atl-input.css';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlInput' });

interface AtlInputProps {
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

const inputId = computed(() => props.id || (props.label ? `input-${generatedId}` : undefined));

function onInput(event: Event) {
  emit('update:value', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="atl-input" :class="{ 'is-invalid': invalid, 'is-disabled': disabled, 'is-readonly': readonly }">
    <label v-if="label" :for="inputId">{{ label }}</label>
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
        :aria-label="ariaLabel || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="errors.length > 0 ? errorsId : undefined"
        :aria-required="required || undefined"
        @input="onInput"
      />
      <AtlIcon v-if="invalid" name="danger" size="sm" class="invalid-icon" />
    </div>
    <div v-if="errors.length" :id="errorsId" class="errors" aria-live="polite">
      <p v-for="(error, i) in errors" :key="i" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
