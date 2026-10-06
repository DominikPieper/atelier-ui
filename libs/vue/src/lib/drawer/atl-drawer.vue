<script lang="ts">
import type { InjectionKey } from 'vue';

export interface AtlDrawerContext {
  headerId: string;
  close: () => void;
}

export const AtlDrawerKey: InjectionKey<AtlDrawerContext> = Symbol('AtlDrawer');

export interface AtlDrawerProps {
  open?: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, useId, watch } from 'vue';
import { isDevBuild } from '../a11y-dev-warn';
import '@atelier-ui/styles/drawer/atl-drawer.css';

defineOptions({ name: 'AtlDrawer' });

const props = withDefaults(defineProps<AtlDrawerProps>(), {
  open: false,
  position: 'right',
  size: 'md',
  closeOnBackdrop: true,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const headerId = useId();

let warnedUnnamed = false;

// Dev-mode warning, once per instance, when the dialog opens with nothing naming
// it: no header in the slot and no aria-label / aria-labelledby override. Checked
// after the next tick so a header rendered later has settled.
function warnIfUnnamed() {
  const dialog = dialogRef.value;
  if (!isDevBuild() || warnedUnnamed || !dialog) return;
  warnedUnnamed = true;
  void nextTick(() => {
    const named =
      dialog.getAttribute('aria-labelledby') !== headerId ||
      dialog.querySelector(`[id="${headerId}"]`) !== null;
    if (!named) {
      console.warn(
        '[AtlDrawer] opened with no accessible name — ' +
          'add an <atl-drawer-header> so screen readers announce its purpose.',
        dialog,
      );
    }
  });
}

function close() {
  emit('update:open', false);
}

provide(AtlDrawerKey, {
  headerId,
  close,
});

onMounted(() => {
  if (props.open && dialogRef.value) {
    dialogRef.value.showModal();
    warnIfUnnamed();
  }
});

watch(
  () => props.open,
  (isOpen) => {
    const dialog = dialogRef.value;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      warnIfUnnamed();
    } else {
      if (dialog.open) dialog.close();
    }
  },
  { flush: 'post' },
);

function onDialogClose() {
  emit('update:open', false);
}

function onDialogCancel(event: Event) {
  event.preventDefault();
  emit('update:open', false);
}

function onBackdropClick(event: MouseEvent) {
  if (props.closeOnBackdrop && event.target === dialogRef.value) {
    emit('update:open', false);
  }
}

const hostClasses = computed(() => [
  'atl-drawer',
  `position-${props.position}`,
  `size-${props.size}`,
  props.open && 'is-open',
]);
</script>

<template>
  <!-- The host classes sit on a wrapper (display: contents), not on the
  <dialog>: the shared CSS styles `.atl-drawer > dialog`, as in React. -->
  <div :class="hostClasses">
    <!-- Backdrop-click-to-close on a native <dialog>: keyboard users already
    have a keyboard-equivalent close path via the native Escape key, wired
    through @cancel/@close below — the click handler is a pointer-only
    convenience on top of that, not the only way to dismiss the dialog. -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <dialog
      ref="dialogRef"
      :aria-labelledby="headerId"
      aria-modal="true"
      @close="onDialogClose"
      @cancel="onDialogCancel"
      @click="onBackdropClick"
    >
      <div class="panel" @click.stop>
        <slot />
      </div>
    </dialog>
  </div>
</template>
