<script setup lang="ts">
defineOptions({ name: 'LlmTbody' });

interface Props {
  empty?: boolean;
  colSpan?: number;
}

withDefaults(defineProps<Props>(), {
  empty: false,
  colSpan: 1,
});
</script>

<template>
  <tbody>
    <template v-if="!empty">
      <slot />
    </template>
    <tr v-else>
      <td :colspan="colSpan" class="llm-tbody-empty-cell">
        <slot name="empty" />
      </td>
    </tr>
  </tbody>
</template>
