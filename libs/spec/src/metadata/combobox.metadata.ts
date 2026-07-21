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
      useInstead: 'AtlInput — combobox commits to a value from the option list.',
    },
    {
      pattern: 'Picking from a list short enough to fit a native dropdown.',
      useInstead: 'AtlSelect — no search overhead, inherits native mobile UI.',
    },
    {
      pattern: 'Selecting many values at once.',
      useInstead: 'A multi-select combobox (not in this spec) or a list of AtlCheckbox rows.',
    },
  ],
  relatedComponents: ['AtlSelectSpec', 'AtlInputSpec'],
  variantMatrix: [
    { state: 'empty' },
    { state: 'typing' },
    { state: 'selected' },
    { disabled: true },
    { invalid: true },
    { required: true },
  ],
  accessibility: {
    role: 'combobox',
    keyboardBehavior:
      'Receives focus via Tab. Typing filters the list and opens the popup; Down/Up moves through options, Enter commits the highlighted one, Escape closes the popup without changing the value. Home and End jump to the first/last option when the popup is open.',
  },
};
