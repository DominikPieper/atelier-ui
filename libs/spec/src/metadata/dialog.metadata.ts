import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlDialogSpec'],
  purpose:
    'Modal overlay that interrupts the page to demand focused attention. Traps focus, dims the background with a scrim, and blocks interaction with the rest of the page until it is dismissed.',
  whenToUse: [
    'Confirming a destructive action (delete, discard, sign out) before it commits.',
    'Hosting a short focused task — edit a row, pick a date, complete a one-step form — without navigating away.',
    'Showing detail content (preview, full-size image, expanded record) on top of the current view.',
    'Asking for a decision that must be answered before the user can continue with the underlying flow.',
  ],
  antiPatterns: [
    {
      pattern: 'Showing a transient, non-blocking system message.',
      useInstead: 'AtlToast or AtlAlert — neither demands focus or blocks interaction.',
    },
    {
      pattern: 'Sliding in a side panel for secondary navigation or filters.',
      useInstead: 'AtlDrawer — drawers anchor to an edge and are the right primitive for persistent side surfaces.',
    },
    {
      pattern: 'Hosting a long, multi-step workflow that needs its own URL and history.',
      useInstead: 'A dedicated route or wizard page — dialogs should not own deep flows the user might want to share or refresh.',
    },
  ],
  relatedComponents: ['AtlDrawerSpec', 'AtlAlertSpec', 'AtlButtonSpec'],
  variantMatrix: [
    { size: 'sm' },
    { size: 'md' },
    { size: 'lg' },
    { size: 'xl' },
    { size: 'full' },
    { size: 'md', closeOnBackdrop: true },
    { size: 'md', closeOnBackdrop: false },
  ],
  accessibility: {
    role: 'dialog',
    keyboardBehavior:
      'On open, focus moves to the first focusable element inside the dialog and is trapped within it. Tab and Shift+Tab cycle through dialog descendants only. Escape closes the dialog and returns focus to the trigger that opened it.',
  },
};
