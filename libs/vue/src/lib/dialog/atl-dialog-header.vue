<script setup lang="ts">
import { inject } from 'vue';
import { AtlDialogKey } from './atl-dialog.vue';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlDialogHeader' });

const ctx = inject(AtlDialogKey, { headerId: '', close: () => undefined });
</script>

<template>
  <div :id="ctx.headerId" class="atl-dialog-header">
    <span class="header-content"><slot /></span>
    <button
      class="close-btn"
      type="button"
      aria-label="Close dialog"
      @click="ctx.close()"
    >
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
