import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlCheckboxSpec'],
  purpose:
    'Binary or tri-state toggle bound to a form field. Renders an `<input type="checkbox">` with optional indeterminate state.',
  whenToUse: [
    'Opting into a single boolean choice (terms accepted, remember me, subscribe).',
    'Selecting zero or more items from a list — each row is its own checkbox.',
    'Driving a "select all" header that flips to indeterminate when only some children are checked.',
  ],
  antiPatterns: [
    {
      pattern: 'Switching a setting on/off where the change applies immediately.',
      useInstead: 'AtlToggle — communicates the "switch" affordance and instant effect to assistive tech.',
    },
    {
      pattern: 'Picking exactly one option from a small set.',
      useInstead: 'AtlRadioGroup — radios enforce single-select and announce the group.',
    },
  ],
  relatedComponents: ['AtlToggleSpec', 'AtlRadioSpec', 'AtlRadioGroupSpec'],
  variantMatrix: [
    { checked: false },
    { checked: true },
    { indeterminate: true },
    { checked: true, disabled: true },
    { checked: false, invalid: true },
    { checked: false, required: true },
  ],
  accessibility: {
    role: 'checkbox',
    keyboardBehavior:
      'Receives focus via Tab. Space toggles checked. `indeterminate` is conveyed via `aria-checked="mixed"` and clears on the next user toggle. Disabled removes the control from activation.',
  },
};
