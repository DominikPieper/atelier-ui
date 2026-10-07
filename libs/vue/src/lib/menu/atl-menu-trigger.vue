<script lang="ts">
import type { InjectionKey } from 'vue';

export interface AtlMenuTriggerContext {
  /** Close the menu and hand focus back to the trigger. */
  close: () => void;
}

export const AtlMenuTriggerKey: InjectionKey<AtlMenuTriggerContext> =
  Symbol('AtlMenuTrigger');
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import '@atelier-ui/styles/menu/atl-menu.css';
import '@atelier-ui/styles/menu/atl-menu.native.css';

defineOptions({ name: 'AtlMenuTrigger' });

const open = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);

// Menu-button ARIA on the slotted trigger element — mirrors what the CDK
// menu trigger does in the Angular adapter, so consumers get correct
// semantics without wiring attributes by hand.
watch(
  [open, triggerRef],
  () => {
    const el = triggerRef.value?.firstElementChild;
    if (!el) return;
    el.setAttribute('aria-haspopup', 'menu');
    el.setAttribute('aria-expanded', String(open.value));
  },
  { immediate: true, flush: 'post' },
);

/** Idle time after which the type-ahead buffer is forgotten (uianatomy menu: ~500ms). */
const TYPE_AHEAD_RESET_MS = 500;

// Which item receives focus when the menu opens (ArrowUp on the trigger: last).
let initialFocus: 'first' | 'last' = 'first';
let typeAheadBuffer = '';
let typeAheadTimer = 0;

function triggerElement(): HTMLElement | null {
  return (triggerRef.value?.firstElementChild as HTMLElement | null) ?? null;
}

/**
 * Menu items of the panel, in DOM order. Disabled items are included: they stay
 * focusable (APG, and the Angular CDK menu) and are announced as disabled.
 */
function menuItems(): HTMLElement[] {
  const panel = menuRef.value;
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ).filter((el) => el.closest('.atl-menu-panel') === panel);
}

/** Roving tabindex: the focused item is the only tab stop. */
function focusItem(items: HTMLElement[], target: HTMLElement) {
  items.forEach((el) => el.setAttribute('tabindex', '-1'));
  target.setAttribute('tabindex', '0');
  target.focus();
}

function toggle() {
  initialFocus = 'first';
  open.value = !open.value;
}

function close(restoreFocus = true) {
  // The panel leaves the DOM on the next flush, which can come after a Tab's
  // default action; take its items out of the tab order right away.
  menuItems().forEach((el) => el.setAttribute('tabindex', '-1'));
  open.value = false;
  if (restoreFocus) triggerElement()?.focus();
}

provide(AtlMenuTriggerKey, { close: () => close(true) });

// Opening moves focus into the menu (WAI-ARIA menu button pattern).
watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  const items = menuItems();
  const target = initialFocus === 'last' ? items[items.length - 1] : items[0];
  if (target) focusItem(items, target);
});

function onWrapperKeydown(event: KeyboardEvent) {
  const target = event.target as Node;

  if (triggerRef.value?.contains(target)) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      initialFocus = event.key === 'ArrowUp' ? 'last' : 'first';
      if (!open.value) open.value = true;
    }
    return;
  }

  if (!open.value || !menuRef.value?.contains(target)) return;
  if (event.key === 'Tab') {
    // Not prevented: focus returns to the trigger, then Tab moves on from it.
    close(true);
    return;
  }

  const items = menuItems();
  if (!items.length) return;
  const current = items.indexOf(document.activeElement as HTMLElement);
  let next: HTMLElement | undefined;

  if (event.key === 'ArrowDown') next = items[(current + 1) % items.length];
  else if (event.key === 'ArrowUp')
    next = items[current <= 0 ? items.length - 1 : current - 1];
  else if (event.key === 'Home') next = items[0];
  else if (event.key === 'End') next = items[items.length - 1];
  else if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    (event.key !== ' ' || typeAheadBuffer)
  ) {
    window.clearTimeout(typeAheadTimer);
    typeAheadBuffer += event.key.toLowerCase();
    typeAheadTimer = window.setTimeout(() => {
      typeAheadBuffer = '';
    }, TYPE_AHEAD_RESET_MS);
    // A single character cycles to the next match; a longer prefix may keep the current item.
    const start =
      typeAheadBuffer.length === 1 ? current + 1 : Math.max(current, 0);
    for (let i = 0; i < items.length; i++) {
      const candidate = items[(start + i) % items.length];
      if (
        candidate.textContent?.trim().toLowerCase().startsWith(typeAheadBuffer)
      ) {
        next = candidate;
        break;
      }
    }
    if (!next) return;
  } else return;

  event.preventDefault();
  if (next) focusItem(items, next);
}

function onMousedown(event: MouseEvent) {
  if (!open.value) return;
  const target = event.target as Node;
  const isInsideTrigger = triggerRef.value?.contains(target);
  const isInsideMenu = menuRef.value?.contains(target);
  if (!isInsideTrigger && !isInsideMenu) {
    close(false);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    close(true);
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onMousedown);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onMousedown);
  document.removeEventListener('keydown', onKeydown);
  window.clearTimeout(typeAheadTimer);
});
</script>

<template>
  <!-- The wrapper is not a control: it only listens for the keydown events
  that bubble up from the trigger and the menu items. -->
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <div class="atl-menu-trigger-wrapper" @keydown="onWrapperKeydown">
    <!-- This span is a non-visual wrapper, not the interactive control: the
    consumer slots in a real <button> (see the stories), and its native
    click — including the synthetic click a browser fires for Enter/Space on
    a focused button — bubbles up to this handler. Keyboard activation
    already works via that bubbled click; the wrapper itself needs no
    tabindex/keydown of its own. -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <span ref="triggerRef" @click="toggle">
      <slot name="trigger" />
    </span>
    <div v-if="open" ref="menuRef" class="atl-menu-panel">
      <slot name="menu" />
    </div>
  </div>
</template>
