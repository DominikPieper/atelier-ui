import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlToggleSpec'],
  purpose:
    'On/off switch for a setting that takes effect immediately. Renders a switch control bound to a boolean form value.',
  whenToUse: [
    'Flipping a setting that applies the moment it changes (dark mode, notifications, autosave).',
    'Enabling or disabling a feature inside a settings panel or preferences row.',
    'Acting as the trigger for revealing a dependent block of controls when on.',
  ],
  antiPatterns: [
    {
      pattern: 'Choosing among more than two states.',
      useInstead: 'AtlRadioGroup or AtlSelect — switches only encode true/false.',
    },
    {
      pattern: 'Collecting a binary value that is only committed on form submit.',
      useInstead: 'AtlCheckbox — checkboxes carry the "stage a change" semantics; switches imply immediate effect.',
    },
  ],
  relatedComponents: ['AtlCheckboxSpec'],
  variantMatrix: [
    { checked: false },
    { checked: true },
    { checked: false, disabled: true },
    { checked: true, disabled: true },
  ],
  accessibility: {
    role: 'switch',
    keyboardBehavior:
      'Receives focus via Tab. Space and Enter both toggle the checked state. Disabled removes the control from activation. `aria-checked` reflects the boolean value.',
  },
};
