import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlDrawerSpec'],
  purpose:
    'Edge-anchored panel that slides in from one side of the viewport. Hosts secondary navigation, filters, or detail views without taking the user away from the underlying page.',
  whenToUse: [
    'Surfacing primary navigation on narrow viewports where a persistent sidebar does not fit.',
    'Exposing filters, settings, or facets that the user toggles on and off while scanning a list.',
    'Inspecting a record or row in a detail panel without losing the surrounding list context.',
    'Presenting a longer task or form that benefits from screen-edge anchoring rather than a centred modal.',
  ],
  antiPatterns: [
    {
      pattern:
        'Blocking the page for a short confirmation or single-decision prompt.',
      useInstead:
        'AtlDialog — dialogs are centred, scoped, and the right primitive for one focused decision.',
    },
    {
      pattern:
        'Showing a transient notification that should not require dismissal.',
      useInstead:
        'AtlToast — toasts auto-dismiss and do not anchor to a screen edge.',
    },
    {
      pattern: 'Building a dropdown menu attached to a trigger button.',
      useInstead:
        'AtlMenu — menus position relative to the trigger and use roving focus, not focus trapping.',
    },
  ],
  relatedComponents: ['AtlDialogSpec', 'AtlMenuSpec'],
  variantMatrix: [
    // sm is only built on position=right in the Figma master (asymmetric
    // matrix documented in its description) — keep the row on that combo.
    { position: 'right', size: 'sm' },
    { position: 'left', size: 'md' },
    { position: 'right', size: 'md' },
    { position: 'right', size: 'lg' },
    { position: 'top', size: 'md' },
    { position: 'bottom', size: 'md' },
    { position: 'right', size: 'full', closeOnBackdrop: true },
    { position: 'left', size: 'md', closeOnBackdrop: false },
  ],
  accessibility: {
    role: 'dialog',
    keyboard: [
      {
        key: 'Escape',
        action: 'Close the drawer. Focus returns to the trigger.',
      },
      {
        key: 'Tab / Shift+Tab',
        action:
          'Cycle through focusable elements inside the drawer (focus is trapped).',
      },
    ],
    notes: [
      'The drawer carries aria-modal="true".',
      'Same accessibility model as AtlDialog — the visual slide-in is purely presentational.',
      'Backdrop click closes the drawer only when closeOnBackdrop is true; Escape always closes.',
    ],
  },
};
