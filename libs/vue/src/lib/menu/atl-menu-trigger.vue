<script lang="ts">
import type { InjectionKey } from 'vue';

export interface AtlMenuTriggerContext {
  close: () => void;
}

export const AtlMenuTriggerKey: InjectionKey<AtlMenuTriggerContext> =
  Symbol('AtlMenuTrigger');
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue';
import './atl-menu.css';

defineOptions({ name: 'AtlMenuTrigger' });

const open = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

provide(AtlMenuTriggerKey, { close });

function onMousedown(event: MouseEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  const isInsideTrigger = triggerRef.value?.contains(target);
  const isInsideMenu = menuRef.value?.contains(target);
  if (!isInsideTrigger && !isInsideMenu) {
    close();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close();
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onMousedown);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onMousedown);
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="atl-menu-trigger-wrapper">
    <span ref="triggerRef" @click="toggle">
      <slot name="trigger" />
    </span>
    <div v-if="open" ref="menuRef" class="atl-menu-panel">
      <slot name="menu" />
    </div>
  </div>
</template>
