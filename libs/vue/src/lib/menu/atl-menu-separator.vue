<script setup lang="ts">
defineOptions({ name: 'AtlMenuSeparator' });
</script>

<template>
  <!-- role="separator" removed: it's hr's implicit HTML-AAM role already,
  making the explicit attribute redundant (vuejs-accessibility/no-redundant-roles). -->
  <hr class="atl-menu-separator" />
</template>
