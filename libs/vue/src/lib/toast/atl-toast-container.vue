<script setup lang="ts">
import { computed, inject } from 'vue';
import { AtlToastKey } from './atl-toast';
import AtlToastItem from './atl-toast-item.vue';
import './atl-toast.css';

defineOptions({ name: 'AtlToastContainer' });

interface AtlToastContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const props = withDefaults(defineProps<AtlToastContainerProps>(), {
  position: 'bottom-right',
});

const ctx = inject(AtlToastKey)!;
// Expose toasts as a computed so template can iterate without manual .value
const toasts = computed(() => ctx.toasts.value);

function dismiss(id: string) {
  ctx.dismiss(id);
}

const classes = computed(() => ['atl-toast-container', `position-${props.position}`]);
</script>

<template>
  <div :class="classes" aria-live="polite" role="status">
    <AtlToastItem
      v-for="toast in toasts"
      :key="toast.id"
      :data="toast"
      @dismiss="dismiss($event)"
    />
  </div>
</template>
