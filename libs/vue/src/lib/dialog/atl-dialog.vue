<script lang="ts">
import type { InjectionKey } from 'vue';

export interface AtlDialogContext {
  headerId: string;
  close: () => void;
}

export const AtlDialogKey: InjectionKey<AtlDialogContext> = Symbol('AtlDialog');

export interface AtlDialogProps {
  /** Whether the dialog is open. Two-way bound via `v-model:open` (emits `update:open`). */
  open?: boolean;
  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop?: boolean;
  /** Size of the dialog panel. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Accessible label for the dialog; use it instead of a header when none is present. When set, it replaces the header as the dialog's accessible name. */
  ariaLabel?: string;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, useId, watch } from 'vue';
import { isDevBuild } from '../a11y-dev-warn';
import '@atelier-ui/styles/dialog/atl-dialog.css';

defineOptions({ name: 'AtlDialog' });

const props = withDefaults(defineProps<AtlDialogProps>(), {
  open: false,
  closeOnBackdrop: true,
  size: 'md',
  ariaLabel: undefined,
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
      props.ariaLabel ||
      dialog.getAttribute('aria-labelledby') !== headerId ||
      dialog.querySelector(`[id="${headerId}"]`) !== null;
    if (!named) {
      console.warn(
        '[AtlDialog] opened with no accessible name — ' +
          'add an <atl-dialog-header> or set aria-label / aria-labelledby so screen readers announce its purpose.',
        dialog,
      );
    }
  });
}

function close() {
  emit('update:open', false);
}

provide(AtlDialogKey, {
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

const panelClasses = computed(() => ['panel', `size-${props.size}`]);
</script>

<template>
  <!-- Backdrop-click-to-close on a native <dialog>: keyboard users already
  have a keyboard-equivalent close path via the native Escape key, wired
  through @cancel/@close below — the click handler is a pointer-only
  convenience on top of that, not the only way to dismiss the dialog. -->
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <dialog
    ref="dialogRef"
    class="atl-dialog"
    :aria-label="ariaLabel || undefined"
    :aria-labelledby="!ariaLabel ? headerId : undefined"
    aria-modal="true"
    @close="onDialogClose"
    @cancel="onDialogCancel"
    @click="onBackdropClick"
  >
    <div :class="panelClasses" @click.stop>
      <slot />
    </div>
  </dialog>
</template>
