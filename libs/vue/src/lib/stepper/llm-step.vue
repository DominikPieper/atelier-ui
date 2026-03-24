<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, useId, watch } from 'vue';
import { LlmStepperKey } from './llm-stepper.vue';

defineOptions({ name: 'LlmStep' });

interface LlmStepProps {
  label: string;
  description?: string;
  completed?: boolean;
  error?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<LlmStepProps>(), {
  completed: false,
  error: false,
  optional: false,
  disabled: false,
});

const stepper = inject(LlmStepperKey)!;
const id = useId();

onMounted(() => {
  stepper.registerStep({
    id,
    label: props.label,
    description: props.description,
    completed: props.completed,
    error: props.error,
    optional: props.optional,
    disabled: props.disabled,
  });
});

onBeforeUnmount(() => {
  stepper.unregisterStep(id);
});

// Sync input changes to parent
watch(
  () => ({
    label: props.label,
    description: props.description,
    completed: props.completed,
    error: props.error,
    optional: props.optional,
    disabled: props.disabled,
  }),
  (val) => {
    stepper.updateStep(id, val);
  }
);

const myIndex = computed(() => stepper.steps.value.findIndex((s) => s.id === id));
const isActive = computed(() => myIndex.value === stepper.activeStep.value);
</script>

<template>
  <div
    v-if="myIndex >= 0"
    :id="`llm-step-panel-${myIndex}`"
    role="tabpanel"
    :aria-labelledby="`llm-step-${myIndex}`"
    :hidden="!isActive"
    tabindex="0"
  >
    <slot />
  </div>
</template>
