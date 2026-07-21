import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlInputSpec'],
  purpose:
    'Single-line text field. Renders an `<input>` bound to a form value with the standard validation and disabled states.',
  whenToUse: [
    'Collecting a short freeform string — name, title, search query.',
    'Capturing a typed value (email, password, number, tel, url) where the browser keyboard hint matters.',
    'Driving a typeahead or filter where the user types and the page reacts on each change.',
  ],
  antiPatterns: [
    {
      pattern: 'Accepting multi-line prose, descriptions, or comments.',
      useInstead: 'AtlTextarea — sized for wrapping text with an optional auto-resize.',
    },
    {
      pattern: 'Picking one option from a known list.',
      useInstead: 'AtlSelect for short lists, AtlCombobox when the list is long enough to need search.',
    },
    {
      pattern: 'Toggling a boolean.',
      useInstead: 'AtlCheckbox or AtlToggle — both encode the binary state for assistive tech.',
    },
  ],
  relatedComponents: ['AtlTextareaSpec', 'AtlSelectSpec', 'AtlComboboxSpec'],
  variantMatrix: [
    { type: 'text', disabled: false },
    { type: 'email', disabled: false },
    { type: 'password', disabled: false },
    { type: 'number', disabled: false },
    { type: 'tel', disabled: false },
    { type: 'url', disabled: false },
    { type: 'text', disabled: true },
    { type: 'text', invalid: true },
    { type: 'text', readonly: true },
  ],
  accessibility: {
    role: 'textbox',
    keyboardBehavior:
      'Receives focus via Tab. Characters insert at the caret, Home/End and arrow keys move the caret, and form submission triggers on Enter when inside a form. `invalid` toggles `aria-invalid`, `required` toggles `aria-required`.',
  },
};
