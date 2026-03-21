<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import './llm-tooltip.css';

defineOptions({ name: 'LlmTooltip' });

interface LlmTooltipProps {
  llmTooltip?: string;
  llmTooltipPosition?: 'above' | 'below' | 'left' | 'right';
  llmTooltipDisabled?: boolean;
  llmTooltipShowDelay?: number;
  llmTooltipHideDelay?: number;
}

const props = withDefaults(defineProps<LlmTooltipProps>(), {
  llmTooltip: '',
  llmTooltipPosition: 'above',
  llmTooltipDisabled: false,
  llmTooltipShowDelay: 300,
  llmTooltipHideDelay: 0,
});

const visible = ref(false);
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function show() {
  if (props.llmTooltipDisabled || !props.llmTooltip) return;
  clearTimers();
  showTimer = setTimeout(() => { visible.value = true; }, props.llmTooltipShowDelay);
}

function hide() {
  clearTimers();
  hideTimer = setTimeout(() => { visible.value = false; }, props.llmTooltipHideDelay);
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
    class="llm-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @keydown="onKeydown"
  >
    <slot />
    <div
      v-if="visible && !llmTooltipDisabled && llmTooltip"
      role="tooltip"
      :class="`llm-tooltip position-${llmTooltipPosition}`"
    >
      {{ llmTooltip }}
    </div>
  </span>
</template>
