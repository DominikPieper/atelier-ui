<script setup lang="ts">
defineOptions({ name: 'AtlOption' });

interface AtlOptionProps {
  optionValue: string;
  disabled?: boolean;
}

withDefaults(defineProps<AtlOptionProps>(), {
  disabled: false,
});
</script>

<template>
  <option :value="optionValue" :disabled="disabled">
    <slot />
  </option>
</template>
