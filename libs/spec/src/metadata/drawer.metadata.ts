import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['LlmDrawerSpec'],
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
      pattern: 'Blocking the page for a short confirmation or single-decision prompt.',
      useInstead: 'LlmDialog — dialogs are centred, scoped, and the right primitive for one focused decision.',
    },
    {
      pattern: 'Showing a transient notification that should not require dismissal.',
      useInstead: 'LlmToast — toasts auto-dismiss and do not anchor to a screen edge.',
    },
    {
      pattern: 'Building a dropdown menu attached to a trigger button.',
      useInstead: 'LlmMenu — menus position relative to the trigger and use roving focus, not focus trapping.',
    },
  ],
  relatedComponents: ['LlmDialogSpec', 'LlmMenuSpec'],
  variantMatrix: [
    { position: 'left', size: 'sm' },
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
    keyboardBehavior:
      'On open, focus moves into the drawer and is trapped while it is visible. Tab and Shift+Tab cycle through drawer descendants only. Escape closes the drawer and returns focus to the trigger that opened it.',
  },
};
