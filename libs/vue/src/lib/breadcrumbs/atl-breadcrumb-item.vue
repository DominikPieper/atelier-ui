<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'AtlBreadcrumbItem' });

interface AtlBreadcrumbItemProps {
  href?: string;
  current?: boolean;
}

const props = withDefaults(defineProps<AtlBreadcrumbItemProps>(), {
  href: undefined,
  current: false,
});

const classes = computed(() =>
  ['atl-breadcrumb-item', props.current && 'is-current'].filter(Boolean),
);
</script>

<template>
  <li :class="classes">
    <a v-if="href && !current" :href="href" class="breadcrumb-link">
      <slot />
    </a>
    <span v-else-if="current" class="breadcrumb-current" aria-current="page">
      <slot />
    </span>
    <span v-else class="breadcrumb-text">
      <slot />
    </span>
  </li>
</template>
