import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlRadioSpec', 'AtlRadioGroupSpec'],
  purpose:
    'Single-select control. RadioGroup owns the bound value; each Radio child contributes one mutually exclusive option.',
  whenToUse: [
    'Picking exactly one option from a short, visible list (2–7 items).',
    'Choosing a plan, size, or shipping method where seeing every option side by side matters.',
    'Selecting one variant from a set inside a form where the choices stay on screen.',
  ],
  antiPatterns: [
    {
      pattern: 'Picking one option from a long list that would dominate the layout.',
      useInstead: 'AtlSelect, or AtlCombobox once the list needs search.',
    },
    {
      pattern: 'Allowing zero or more selections.',
      useInstead: 'AtlCheckbox — one per option, no single-select constraint.',
    },
    {
      pattern: 'Flipping a single boolean.',
      useInstead: 'AtlCheckbox or AtlToggle — a one-option radio group is never the right shape.',
    },
  ],
  relatedComponents: ['AtlCheckboxSpec', 'AtlSelectSpec', 'AtlComboboxSpec'],
  variantMatrix: [
    { value: 'a', disabled: false },
    { value: 'b', disabled: false },
    { value: 'a', disabled: true },
    { value: 'a', invalid: true },
    { value: 'a', required: true },
  ],
  accessibility: {
    role: 'radiogroup',
    keyboardBehavior:
      'Tab moves focus into the group at the selected radio (or the first when none is selected). Arrow keys move focus and selection between radios within the group; the group itself is one tab stop. Space selects the focused radio when no selection exists yet.',
  },
};
