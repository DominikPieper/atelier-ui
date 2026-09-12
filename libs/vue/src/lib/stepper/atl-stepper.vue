<script lang="ts">
import type { InjectionKey, Ref } from 'vue';
import AtlIcon from '../icon/atl-icon.vue';

export interface StepInfo {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  error: boolean;
  optional: boolean;
  disabled: boolean;
}

export interface AtlStepperContext {
  activeStep: Ref<number>;
  steps: Ref<StepInfo[]>;
  linear: Ref<boolean>;
  registerStep(step: StepInfo): void;
  unregisterStep(id: string): void;
  updateStep(id: string, info: Partial<StepInfo>): void;
  goTo(index: number): void;
  next(): void;
  prev(): void;
}

export const AtlStepperKey: InjectionKey<AtlStepperContext> =
  Symbol('AtlStepper');
</script>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import './atl-stepper.css';

defineOptions({ name: 'AtlStepper' });

const props = withDefaults(
  defineProps<{
    activeStep?: number;
    orientation?: 'horizontal' | 'vertical';
    linear?: boolean;
  }>(),
  {
    activeStep: 0,
    orientation: 'horizontal',
    linear: false,
  },
);

const emit = defineEmits<{
  'update:activeStep': [index: number];
}>();

const internalStep = ref(props.activeStep);
const steps = ref<StepInfo[]>([]);
const linearRef = computed(() => props.linear);

watch(
  () => props.activeStep,
  (val) => {
    internalStep.value = val;
  },
);

function registerStep(step: StepInfo) {
  steps.value.push(step);
}

function unregisterStep(id: string) {
  steps.value = steps.value.filter((s) => s.id !== id);
}

function updateStep(id: string, info: Partial<StepInfo>) {
  const idx = steps.value.findIndex((s) => s.id === id);
  if (idx !== -1) {
    steps.value[idx] = { ...steps.value[idx], ...info };
  }
}

// Whether step `index` can be activated right now: not itself disabled, and —
// in linear mode — either at/behind the active step, or ahead of it with every
// step before it completed or optional. Drives both goTo()'s guard and the
// header button's native `disabled` state, so an unreachable step is also not
// focusable — no roving-tabindex bookkeeping needed, since the header is a
// list, not a tab widget.
function isReachable(index: number): boolean {
  const step = steps.value[index];
  if (!step || step.disabled) return false;
  if (!props.linear) return true;
  if (index <= internalStep.value) return true;
  return steps.value.slice(0, index).every((s) => s.completed || s.optional);
}

function goTo(index: number) {
  if (index < 0 || index >= steps.value.length) return;
  if (!isReachable(index)) return;
  internalStep.value = index;
  emit('update:activeStep', index);
}

function next() {
  goTo(internalStep.value + 1);
}

function prev() {
  const p = internalStep.value - 1;
  if (p >= 0 && !steps.value[p]?.disabled) {
    internalStep.value = p;
    emit('update:activeStep', p);
  }
}

provide(AtlStepperKey, {
  activeStep: internalStep,
  steps,
  linear: linearRef,
  registerStep,
  unregisterStep,
  updateStep,
  goTo,
  next,
  prev,
});

const classes = computed(() => [
  'atl-stepper',
  `orientation-${props.orientation}`,
]);

function isConnectorActive(i: number) {
  return internalStep.value > i || steps.value[i]?.completed;
}
</script>

<template>
  <div :class="classes">
    <!-- Explicit role="list" is a deliberate Safari/VoiceOver workaround, not
    a defect: .stepper-header also sets `list-style: none`, and Safari strips
    <ol>/<ul>'s implicit `list` role once list-style is removed. The static
    rule can't see the paired CSS. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ol class="stepper-header" role="list" aria-label="Progress">
      <template v-for="(step, i) in steps" :key="step.id">
        <li
          class="step-item"
          :class="{
            'is-active': internalStep === i,
            'is-completed': step.completed && internalStep !== i,
            'is-error': step.error,
            'is-disabled': step.disabled,
          }"
        >
          <button
            :id="`atl-step-${i}`"
            type="button"
            class="step-circle"
            :aria-label="step.label"
            :aria-current="internalStep === i ? 'step' : undefined"
            :disabled="!isReachable(i)"
            @click="goTo(i)"
          >
            <template v-if="step.completed && !step.error">
              <AtlIcon name="check" size="sm" />
            </template>
            <template v-else-if="step.error">
              <AtlIcon name="close" size="sm" />
            </template>
            <template v-else>{{ i + 1 }}</template>
          </button>
          <div class="step-text">
            <span class="step-label">{{ step.label }}</span>
            <span v-if="step.description" class="step-description">{{
              step.description
            }}</span>
            <span v-if="step.optional && !step.completed" class="step-optional"
              >Optional</span
            >
          </div>
        </li>
        <li
          v-if="i < steps.length - 1"
          class="step-connector"
          aria-hidden="true"
          :class="{ 'is-active': isConnectorActive(i) }"
        />
      </template>
    </ol>
    <div class="stepper-content">
      <slot />
    </div>
  </div>
</template>
