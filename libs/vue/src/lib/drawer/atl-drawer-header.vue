<script setup lang="ts">
import { inject } from 'vue';
import { AtlDrawerKey } from './atl-drawer.vue';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlDrawerHeader' });

const ctx = inject(AtlDrawerKey, { headerId: '', close: () => undefined });
</script>

<template>
  <div :id="ctx.headerId" class="atl-drawer-header">
    <span class="header-content"><slot /></span>
    <button
      class="close-btn"
      type="button"
      aria-label="Close drawer"
      @click="ctx.close()"
    >
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
