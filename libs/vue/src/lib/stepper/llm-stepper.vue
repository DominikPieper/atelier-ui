<script lang="ts">
import type { InjectionKey, Ref } from 'vue';

export interface StepInfo {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  error: boolean;
  optional: boolean;
  disabled: boolean;
}

export interface LlmStepperContext {
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

export const LlmStepperKey: InjectionKey<LlmStepperContext> = Symbol('LlmStepper');
</script>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import './llm-stepper.css';

defineOptions({ name: 'LlmStepper' });

interface LlmStepperProps {
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
  linear?: boolean;
}

const props = withDefaults(defineProps<LlmStepperProps>(), {
  activeStep: 0,
  orientation: 'horizontal',
  linear: false,
});

const emit = defineEmits<{
  'update:activeStep': [index: number];
}>();

const internalStep = ref(props.activeStep);
const steps = ref<StepInfo[]>([]);
const linearRef = computed(() => props.linear);

watch(
  () => props.activeStep,
  (val) => { internalStep.value = val; }
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

function goTo(index: number) {
  if (index < 0 || index >= steps.value.length) return;
  if (steps.value[index].disabled) return;
  if (props.linear && index > internalStep.value) {
    const canAdvance = steps.value.slice(0, index).every((s) => s.completed || s.optional);
    if (!canAdvance) return;
  }
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

provide(LlmStepperKey, {
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

const classes = computed(() => ['llm-stepper', `orientation-${props.orientation}`]);

function isConnectorActive(i: number) {
  return internalStep.value > i || steps.value[i]?.completed;
}
</script>

<template>
  <div :class="classes">
    <div class="stepper-header" role="tablist">
      <template v-for="(step, i) in steps" :key="step.id">
        <div
          class="step-item"
          :class="{
            'is-active': internalStep === i,
            'is-completed': step.completed && internalStep !== i,
            'is-error': step.error,
            'is-disabled': step.disabled,
          }"
        >
          <button
            type="button"
            role="tab"
            class="step-circle"
            :id="`llm-step-${i}`"
            :aria-label="step.label"
            :aria-selected="internalStep === i"
            :aria-controls="`llm-step-panel-${i}`"
            :aria-disabled="step.disabled || undefined"
            :tabindex="internalStep === i ? 0 : -1"
            :disabled="step.disabled || undefined"
            @click="goTo(i)"
          >
            <template v-if="step.completed && !step.error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </template>
            <template v-else-if="step.error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </template>
            <template v-else>{{ i + 1 }}</template>
          </button>
          <div class="step-text">
            <span class="step-label">{{ step.label }}</span>
            <span v-if="step.description" class="step-description">{{ step.description }}</span>
            <span v-if="step.optional && !step.completed" class="step-optional">Optional</span>
          </div>
        </div>
        <div
          v-if="i < steps.length - 1"
          class="step-connector"
          :class="{ 'is-active': isConnectorActive(i) }"
        />
      </template>
    </div>
    <div class="stepper-content">
      <slot />
    </div>
  </div>
</template>
