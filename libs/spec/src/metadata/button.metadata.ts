import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlButtonSpec'],
  purpose:
    'Primary action trigger. Renders a labelled button users press to commit an action — submit a form, open a dialog, advance a flow.',
  whenToUse: [
    'Initiating an action that changes state on the current page (submit, save, delete, open).',
    'Triggering navigation in flows where a button is more semantically correct than a link.',
    'Surfacing the primary call-to-action in a form, dialog, or empty state.',
  ],
  antiPatterns: [
    {
      pattern:
        'Navigating to a new URL where the destination is the meaning of the interaction.',
      useInstead:
        'A plain `<a>` link — links say "go somewhere", buttons say "do something".',
    },
    {
      pattern: 'Toggling a binary on/off state.',
      useInstead:
        'AtlToggle — communicates the persistent state to assistive tech.',
    },
    {
      pattern: 'Selecting an option from a list.',
      useInstead:
        'AtlSelect, AtlCombobox, or AtlRadioGroup, depending on cardinality and search needs.',
    },
  ],
  relatedComponents: ['AtlToggle', 'AtlMenuSpec', 'AtlDialogSpec'],
  variantMatrix: [
    { variant: 'primary', size: 'sm' },
    { variant: 'primary', size: 'md' },
    { variant: 'primary', size: 'lg' },
    { variant: 'secondary', size: 'md' },
    { variant: 'outline', size: 'md' },
    { variant: 'danger', size: 'md' },
  ],
  accessibility: {
    role: 'button',
    keyboardBehavior:
      'Activates on Enter or Space. Receives focus via Tab in source order. A disabled button (`disabled`) is natively disabled: it blocks activation and leaves the tab order. A loading button (`loading`) is not: it keeps focus and its place in the tab order, announces `aria-busy` and `aria-disabled`, and ignores activation (clicks, Enter, Space, form submit).',
  },
};
