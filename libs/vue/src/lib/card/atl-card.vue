<script setup lang="ts">
import { computed } from 'vue';
import './atl-card.css';

defineOptions({ name: 'AtlCard' });

interface AtlCardProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Opt-in landmark role. Default is no role.
   *
   * - `'article'` — self-contained content (blog post, comment).
   * - `'region'`  — perceivable area that needs a screen-reader stop;
   *                 pair with `aria-label`.
   * - `'section'` — mirrors an HTML `<section>`.
   *
   * Most cards group content visually and shouldn't add a landmark.
   * Leave unset by default.
   */
  role?: 'article' | 'region' | 'section';
}

const props = withDefaults(defineProps<AtlCardProps>(), {
  variant: 'elevated',
  padding: 'md',
  role: undefined,
});

const classes = computed(() => [
  'atl-card',
  `variant-${props.variant}`,
  `padding-${props.padding}`,
]);
</script>

<template>
  <div :class="classes" :role="role">
    <slot />
  </div>
</template>
