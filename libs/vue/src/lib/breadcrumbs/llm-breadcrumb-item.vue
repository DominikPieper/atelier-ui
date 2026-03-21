<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'LlmBreadcrumbItem' });

interface LlmBreadcrumbItemProps {
  href?: string;
  current?: boolean;
}

const props = withDefaults(defineProps<LlmBreadcrumbItemProps>(), {
  href: undefined,
  current: false,
});

const classes = computed(() => [
  'llm-breadcrumb-item',
  props.current && 'is-current',
].filter(Boolean));
</script>

<template>
  <li :class="classes">
    <a v-if="href && !current" :href="href" class="breadcrumb-link">
      <slot />
    </a>
    <span
      v-else
      class="breadcrumb-current"
      :aria-current="current ? 'page' : undefined"
    >
      <slot />
    </span>
  </li>
</template>
