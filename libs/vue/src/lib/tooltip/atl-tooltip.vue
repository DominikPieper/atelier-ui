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
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function show() {
  if (props.atlTooltipDisabled || !props.atlTooltip) return;
  clearTimers();
  showTimer = setTimeout(() => {
    visible.value = true;
  }, props.atlTooltipShowDelay);
}

function hide() {
  clearTimers();
  hideTimer = setTimeout(() => {
    visible.value = false;
  }, props.atlTooltipHideDelay);
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
  <!-- This span is a non-visual wrapper, not the interactive control: the
  consumer slots in the real focusable/hoverable element. @focusin/@focusout
  (not @focus/@blur — those don't bubble, so a listener on this wrapper
  would never fire for a focus change on a *descendant* like the slotted
  button, silently breaking the WCAG 1.4.13 keyboard/focus path) are the
  keyboard-equivalent pair for @mouseenter/@mouseleave, and @keydown handles
  Escape — the wrapper itself is never a tab stop and doesn't need to be. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <span
    class="atl-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
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
