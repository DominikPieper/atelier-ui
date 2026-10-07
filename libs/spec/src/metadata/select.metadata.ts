import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlSelectSpec', 'AtlOptionSpec'],
  purpose:
    'Dropdown picker built on the native `<select>` element. Option children declare the available values.',
  whenToUse: [
    'Choosing one value from a known list of 7 or more items where radios would crowd the layout.',
    'Capturing a structured choice (country, currency, language) inside a form.',
    'Rendering a compact picker that needs to work without JavaScript and inherit native mobile UI.',
  ],
  antiPatterns: [
    {
      pattern: 'Picking from a list long enough that scanning becomes painful.',
      useInstead: 'AtlCombobox — adds typeahead search over the same options.',
    },
    {
      pattern: 'Showing every option inline so users can compare them.',
      useInstead:
        'AtlRadioGroup — keeps the choices visible without an open/close step.',
    },
    {
      pattern: 'Triggering navigation when an option is picked.',
      useInstead:
        'A menu of links — a select implies a form value, not a route change.',
    },
  ],
  relatedComponents: ['AtlRadioGroupSpec', 'AtlComboboxSpec'],
  variantMatrix: [
    // `state` values follow the Figma master's interaction axis
    // (default | hover | focus | open | filled) — "filled" is the
    // has-a-selection state.
    { state: 'default' },
    { state: 'filled' },
    { disabled: true },
    { invalid: true },
    { required: true },
  ],
  accessibility: {
    role: 'combobox',
    relatedRoles: ['listbox'],
    keyboard: [
      {
        key: 'Enter / Space',
        action:
          'Open the listbox. While it is open, select the highlighted option and close.',
      },
      {
        key: 'Arrow Up / Down, Home / End',
        action:
          'Open the listbox when closed; once open, move between options (Home / End jump to the first / last).',
      },
      { key: 'Escape', action: 'Close without changing the selection.' },
      {
        key: 'Type a character',
        action:
          'Open the listbox and jump to the next option starting with that letter.',
      },
    ],
    notes: [
      'The trigger carries aria-expanded and aria-controls that point at the listbox.',
      'Disabled options are skipped by keyboard navigation.',
    ],
  },
};
