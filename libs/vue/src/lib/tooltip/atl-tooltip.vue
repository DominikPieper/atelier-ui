<script setup lang="ts">
import { ref, useId, watch, onUnmounted } from 'vue';
import '@atelier-ui/styles/tooltip/atl-tooltip.css';
import '@atelier-ui/styles/tooltip/atl-tooltip.native.css';

defineOptions({ name: 'AtlTooltip' });

interface AtlTooltipProps {
  /** The tooltip text. */
  atlTooltip?: string;
  /**
   * Preferred tooltip placement relative to the wrapped content. Applied as a fixed
   * CSS class: it does not flip when clipped; Angular's CDK overlay does.
   */
  atlTooltipPosition?: 'above' | 'below' | 'left' | 'right';
  /** Disables the tooltip without removing the wrapper. */
  atlTooltipDisabled?: boolean;
  /** Delay in ms before the tooltip appears. */
  atlTooltipShowDelay?: number;
  /** Delay in ms before the tooltip hides. */
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
const wrapper = ref<HTMLElement | null>(null);
// useId(): stable per instance and SSR-safe, so the trigger can reference it.
const tooltipId = `tooltip-${useId()}`;
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

// The slotted element is the trigger. While the tooltip is shown it is
// described by it (same contract as React and Angular).
watch(
  visible,
  (isVisible) => {
    const trigger = wrapper.value?.firstElementChild;
    if (!trigger) return;
    if (isVisible) trigger.setAttribute('aria-describedby', tooltipId);
    else trigger.removeAttribute('aria-describedby');
  },
  { flush: 'post' },
);

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
    ref="wrapper"
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
      :id="tooltipId"
      role="tooltip"
      :class="`atl-tooltip position-${atlTooltipPosition}`"
    >
      {{ atlTooltip }}
    </div>
  </span>
</template>
