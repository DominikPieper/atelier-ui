<script setup lang="ts">
import './atl-breadcrumbs.css';

defineOptions({ name: 'AtlBreadcrumbs' });

const props = withDefaults(defineProps<{ separator?: string }>(), {
  separator: '/',
});
</script>

<template>
  <nav
    class="atl-breadcrumbs"
    aria-label="Breadcrumb"
    :style="{ '--atl-separator': `'${props.separator}'` }"
  >
    <!-- Explicit role="list" is a deliberate Safari/VoiceOver workaround, not
    a defect: this element also gets `list-style: none` from
    .breadcrumbs-list, and Safari strips <ol>/<ul>'s implicit `list` role
    once list-style is removed. The static rule can't see the paired CSS. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ol role="list" class="breadcrumbs-list">
      <slot />
    </ol>
  </nav>
</template>
