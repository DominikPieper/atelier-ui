<script setup lang="ts">
import { computed } from 'vue';
import type { ToastData } from './atl-toast';
import AtlIcon from '../icon/atl-icon.vue';

defineOptions({ name: 'AtlToastItem' });

interface AtlToastItemProps {
  data: ToastData;
}

const props = defineProps<AtlToastItemProps>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const classes = computed(() => ['atl-toast', `variant-${props.data.variant}`]);
</script>

<template>
  <div :class="classes" role="status">
    <span class="message">{{ data.message }}</span>
    <button
      v-if="data.dismissible"
      class="dismiss"
      type="button"
      aria-label="Dismiss"
      @click="emit('dismiss', data.id)"
    >
      <AtlIcon name="close" size="sm" />
    </button>
  </div>
</template>
