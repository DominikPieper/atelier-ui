<script lang="ts">
import type { InjectionKey } from 'vue';

export interface AtlRadioGroupContext {
  value: string;
  name: string;
  disabled: boolean;
  readonly: boolean;
  invalid: boolean;
  onSelect: (value: string) => void;
}

export const AtlRadioGroupKey: InjectionKey<AtlRadioGroupContext> =
  Symbol('AtlRadioGroup');

export interface AtlRadioGroupProps {
  /** The selected radio value. Two-way bound via `v-model:value` (emits `update:value`). */
  value?: string;
  /** Shared `name` attribute applied to all child radio inputs. */
  name?: string;
  /** Whether the whole group is disabled. */
  disabled?: boolean;
  /** Whether the selection can be read but not changed. Enforced by the group, since HTML ignores `readonly` on a radio input. */
  readonly?: boolean;
  /** Whether the group has validation errors; sets `aria-invalid`. */
  invalid?: boolean;
  /** Whether the group is required; sets `aria-required`. */
  required?: boolean;
  /** Validation error messages shown below the group. */
  errors?: ReadonlyArray<string | AtlErrorItem>;
  /**
   * Accessible name of the group, written as `aria-label` on the element that carries `role="radiogroup"`. A `<label for>` cannot name a group, so a group needs this or `aria-labelledby`. Declared as an explicit prop, like `AtlSelect`'s `ariaLabel`.
   */
  ariaLabel?: string;
  /** Id of the visible caption that names the group. Use instead of `aria-label` when the text is on screen. */
  ariaLabelledby?: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import '@atelier-ui/styles/radio-group/atl-radio-group.css';
import type { AtlErrorItem } from '../spec';
import { errorMessage } from '../error-message';
import { warnIfUnnamedHost } from '../a11y-dev-warn';

defineOptions({ name: 'AtlRadioGroup' });

const props = withDefaults(defineProps<AtlRadioGroupProps>(), {
  value: '',
  name: '',
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  errors: () => [],
  ariaLabel: undefined,
  ariaLabelledby: undefined,
});

const emit = defineEmits<{
  'update:value': [value: string];
}>();

provide(AtlRadioGroupKey, {
  get value() {
    return props.value ?? '';
  },
  get name() {
    return props.name ?? '';
  },
  get disabled() {
    return props.disabled ?? false;
  },
  get readonly() {
    return props.readonly ?? false;
  },
  get invalid() {
    return props.invalid ?? false;
  },
  onSelect(v: string) {
    if (!props.disabled && !props.readonly) {
      emit('update:value', v);
    }
  },
});

const classes = computed(() => [
  'atl-radio-group',
  props.invalid && 'is-invalid',
  props.disabled && 'is-disabled',
  props.readonly && 'is-readonly',
]);

const groupRef = ref<HTMLDivElement | null>(null);

// A group has no <label for>. `aria-label` / `aria-labelledby` land on this
// root, which carries role="radiogroup"; warn in dev mode when neither is there
// (ADR-0171).
onMounted(() =>
  warnIfUnnamedHost(
    groupRef.value,
    'AtlRadioGroup',
    'set aria-label, or aria-labelledby pointing at a visible caption',
  ),
);

// Roving arrow-key navigation per the WAI-ARIA radiogroup pattern: Arrow
// Down/Right move to the next enabled radio, Up/Left to the previous, both
// wrapping, and the navigated radio is selected and focused.
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || props.readonly) return;
  const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
  const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
  if (!forward && !backward) return;
  const radios = Array.from(
    groupRef.value?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ??
      [],
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
  <!-- role="radiogroup" is a composite-widget container, not itself a tab
  stop: this is the ARIA APG roving-tabindex pattern — @keydown here is
  event-delegation to move focus among the native <input type="radio">
  children, which are natively focusable/operable on their own. The
  container deliberately stays out of the tab sequence. -->
  <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -->
  <div
    ref="groupRef"
    :class="classes"
    role="radiogroup"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="ariaLabelledby || undefined"
    :aria-invalid="invalid || undefined"
    :aria-required="required || undefined"
    @keydown="onKeydown"
  >
    <slot />
    <div v-if="errors.length > 0" class="errors" role="alert">
      <p v-for="(error, index) in errors" :key="index" class="error-message">
        {{ errorMessage(error) }}
      </p>
    </div>
  </div>
</template>
