<script lang="ts">
import type { InjectionKey } from 'vue';

export interface LlmRadioGroupContext {
  value: string;
  name: string;
  disabled: boolean;
  readonly: boolean;
  invalid: boolean;
  onSelect: (value: string) => void;
}

export const LlmRadioGroupKey: InjectionKey<LlmRadioGroupContext> = Symbol('LlmRadioGroup');

export interface LlmRadioGroupProps {
  value?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  errors?: string[];
}
</script>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import './llm-radio-group.css';

defineOptions({ name: 'LlmRadioGroup' });

const props = withDefaults(defineProps<LlmRadioGroupProps>(), {
  value: '',
  name: '',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  errors: () => [],
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

provide(LlmRadioGroupKey, {
  get value() { return props.value ?? ''; },
  get name() { return props.name ?? ''; },
  get disabled() { return props.disabled ?? false; },
  get readonly() { return props.readonly ?? false; },
  get invalid() { return props.invalid ?? false; },
  onSelect(v: string) {
    if (!props.disabled && !props.readonly) {
      emit('update:value', v);
    }
  },
});

const classes = computed(() => [
  'llm-radio-group',
  props.invalid && 'is-invalid',
  props.disabled && 'is-disabled',
]);

const groupRef = ref<HTMLDivElement | null>(null);

// Roving arrow-key navigation per the WAI-ARIA radiogroup pattern: Arrow
// Down/Right move to the next enabled radio, Up/Left to the previous, both
// wrapping, and the navigated radio is selected and focused.
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || props.readonly) return;
  const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
  const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
  if (!forward && !backward) return;
  const radios = Array.from(
    groupRef.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []
  ).filter((radio) => !radio.disabled);
  if (radios.length === 0) return;
  event.preventDefault();
  const currentIdx = radios.findIndex((radio) => radio.value === props.value);
  const start = currentIdx === -1 ? (forward ? -1 : 0) : currentIdx;
  const nextIdx = (start + (forward ? 1 : -1) + radios.length) % radios.length;
  const target = radios[nextIdx];
  target.focus();
  emit('update:value', target.value);
}
</script>

<template>
  <div
    ref="groupRef"
    :class="classes"
    role="radiogroup"
    :aria-invalid="invalid || undefined"
    :aria-required="required || undefined"
    @keydown="onKeydown"
  >
    <slot />
    <div v-if="errors.length > 0" class="errors" role="alert">
      <p v-for="(error, index) in errors" :key="index" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>
