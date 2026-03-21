<script setup lang="ts">
defineOptions({ name: 'LlmOption' });

interface LlmOptionProps {
  optionValue: string;
  disabled?: boolean;
}

withDefaults(defineProps<LlmOptionProps>(), {
  disabled: false,
});
</script>

<template>
  <option :value="optionValue" :disabled="disabled">
    <slot />
  </option>
</template>
