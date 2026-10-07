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
      pattern:
        'Picking one option from a long list that would dominate the layout.',
      useInstead: 'AtlSelect, or AtlCombobox once the list needs search.',
    },
    {
      pattern: 'Allowing zero or more selections.',
      useInstead: 'AtlCheckbox — one per option, no single-select constraint.',
    },
    {
      pattern: 'Flipping a single boolean.',
      useInstead:
        'AtlCheckbox or AtlToggle — a one-option radio group is never the right shape.',
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
    keyboard: [
      {
        key: 'Tab',
        action:
          'Move focus into the group (to the checked radio, or the first radio if none is checked).',
      },
      {
        key: 'Arrow Up / Left',
        action: 'Select the previous radio, wrapping to the last.',
      },
      {
        key: 'Arrow Down / Right',
        action: 'Select the next radio, wrapping to the first.',
      },
      { key: 'Space', action: 'Select the focused radio.' },
    ],
    notes: [
      'Only the currently selected radio is in the tab sequence (roving tabindex) — the whole group is one tab stop.',
      'If you supply a label via <label> or aria-labelledby on the group, screen readers announce it when focus enters.',
    ],
  },
};
