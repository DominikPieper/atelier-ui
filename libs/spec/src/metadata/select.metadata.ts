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
      useInstead: 'AtlRadioGroup — keeps the choices visible without an open/close step.',
    },
    {
      pattern: 'Triggering navigation when an option is picked.',
      useInstead: 'A menu of links — a select implies a form value, not a route change.',
    },
  ],
  relatedComponents: ['AtlRadioGroupSpec', 'AtlComboboxSpec'],
  variantMatrix: [
    { state: 'empty' },
    { state: 'selected' },
    { disabled: true },
    { invalid: true },
    { required: true },
  ],
  accessibility: {
    role: 'combobox',
    keyboardBehavior:
      'Receives focus via Tab. Space, Enter, Alt+Down, or any character key opens the native list. Arrow keys move the selection while open, Enter commits, Escape cancels. Typing a letter jumps to the next matching option.',
  },
};
