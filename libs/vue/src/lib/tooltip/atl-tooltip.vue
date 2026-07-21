<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import './atl-tooltip.css';

defineOptions({ name: 'AtlTooltip' });

interface AtlTooltipProps {
  atlTooltip?: string;
  atlTooltipPosition?: 'above' | 'below' | 'left' | 'right';
  atlTooltipDisabled?: boolean;
  atlTooltipShowDelay?: number;
  atlTooltipHideDelay?: number;
}

const props = withDefaults(defineProps<AtlTooltipProps>(), {
  atlTooltip: '',
  atlTooltipPosition: 'above',
  atlTooltipDisabled: false,
  atlTooltipShowDelay: 300,
  atlTooltipHideDelay: 0,
});

const visible = ref(false);
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function show() {
  if (props.atlTooltipDisabled || !props.atlTooltip) return;
  clearTimers();
  showTimer = setTimeout(() => { visible.value = true; }, props.atlTooltipShowDelay);
}

function hide() {
  clearTimers();
  hideTimer = setTimeout(() => { visible.value = false; }, props.atlTooltipHideDelay);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    clearTimers();
    visible.value = false;
  }
}

onUnmounted(() => clearTimers());
</script>

<template>
  <span
    class="atl-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @keydown="onKeydown"
  >
    <slot />
    <div
      v-if="visible && !atlTooltipDisabled && atlTooltip"
      role="tooltip"
      :class="`atl-tooltip position-${atlTooltipPosition}`"
    >
      {{ atlTooltip }}
    </div>
  </span>
</template>
