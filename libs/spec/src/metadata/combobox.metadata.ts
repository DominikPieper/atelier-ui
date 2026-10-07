import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlComboboxSpec'],
  purpose:
    'Searchable picker. Renders a text input plus a filtered option list so users can type to narrow a long set of choices.',
  whenToUse: [
    'Picking one value from a list long enough that scrolling beats scanning (countries, currencies, users).',
    'Letting the user type a few characters to filter options instead of opening every group.',
    'Driving an autocomplete where the available values are known upfront, not free text.',
  ],
  antiPatterns: [
    {
      pattern: 'Accepting any freeform string the user types.',
      useInstead:
        'AtlInput — combobox commits to a value from the option list.',
    },
    {
      pattern: 'Picking from a list short enough to fit a native dropdown.',
      useInstead: 'AtlSelect — no search overhead, inherits native mobile UI.',
    },
    {
      pattern: 'Selecting many values at once.',
      useInstead:
        'A multi-select combobox (not in this spec) or a list of AtlCheckbox rows.',
    },
  ],
  relatedComponents: ['AtlSelectSpec', 'AtlInputSpec'],
  variantMatrix: [
    // `state` values follow the Figma master's interaction axis
    // (default | hover | focus | open | filtered | selected) — "filtered"
    // is the mid-typing state with a narrowed option list.
    { state: 'default' },
    { state: 'filtered' },
    { state: 'selected' },
    { disabled: true },
    { invalid: true },
    { required: true },
  ],
  accessibility: {
    role: 'combobox',
    relatedRoles: ['listbox'],
    keyboard: [
      {
        key: 'Type',
        action:
          'Filter the options. The list opens (it also opens when the input receives focus) and updates in place.',
      },
      {
        key: 'Arrow Down / Up',
        action:
          'Open the list when closed; once open, move between the enabled filtered options, wrapping at the ends.',
      },
      { key: 'Enter', action: 'Select the highlighted option.' },
      {
        key: 'Escape',
        action:
          'Close the list and restore the input to the selected option’s label.',
      },
      { key: 'Tab', action: 'Close the list and move focus on.' },
    ],
    notes: [
      'The input has aria-autocomplete="list" and aria-expanded reflects the open state.',
      'The highlighted option is exposed through aria-activedescendant, so screen readers announce it without moving focus out of the text input.',
    ],
  },
};
