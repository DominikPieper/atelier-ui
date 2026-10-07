import { render, screen } from '@testing-library/vue';
import type { AtlErrorItem } from './spec';
import AtlCheckbox from './checkbox/atl-checkbox.vue';
import AtlCombobox from './combobox/atl-combobox.vue';
import AtlInput from './input/atl-input.vue';
import AtlRadio from './radio/atl-radio.vue';
import AtlRadioGroup from './radio-group/atl-radio-group.vue';
import AtlOption from './select/atl-option.vue';
import AtlSelect from './select/atl-select.vue';
import AtlTextarea from './textarea/atl-textarea.vue';
import AtlToggle from './toggle/atl-toggle.vue';

// The shared error item (`{ kind, message? }`) is Angular's ValidationError shape.
// Every form control must render `message` for an object and the string itself for a
// string, so a mixed list works and `string[]` keeps working.
const MIXED: ReadonlyArray<string | AtlErrorItem> = [
  'Plain string error',
  { kind: 'required', message: 'Object error message' },
];

const CONTROLS: Array<[string, object]> = [
  [
    'input',
    {
      components: { AtlInput },
      template: '<AtlInput invalid :errors="errors" />',
    },
  ],
  [
    'textarea',
    {
      components: { AtlTextarea },
      template: '<AtlTextarea invalid :errors="errors" />',
    },
  ],
  [
    'checkbox',
    {
      components: { AtlCheckbox },
      template: '<AtlCheckbox invalid :errors="errors">Accept</AtlCheckbox>',
    },
  ],
  [
    'toggle',
    {
      components: { AtlToggle },
      template: '<AtlToggle invalid :errors="errors">Enable</AtlToggle>',
    },
  ],
  [
    'select',
    {
      components: { AtlSelect, AtlOption },
      template:
        '<AtlSelect invalid :errors="errors"><AtlOption optionValue="a">A</AtlOption></AtlSelect>',
    },
  ],
  [
    'combobox',
    {
      components: { AtlCombobox },
      template:
        '<AtlCombobox invalid :errors="errors" :options="[{ value: \'a\', label: \'A\' }]" />',
    },
  ],
  [
    'radio-group',
    {
      components: { AtlRadioGroup, AtlRadio },
      template:
        '<AtlRadioGroup invalid :errors="errors" name="r"><AtlRadio radioValue="a">A</AtlRadio></AtlRadioGroup>',
    },
  ],
];

describe('errors accept the shared error item', () => {
  it.each(CONTROLS)(
    '%s renders strings and error objects',
    (_name, component) => {
      render({ ...component, setup: () => ({ errors: MIXED }) });
      expect(screen.getByText('Plain string error')).toBeInTheDocument();
      expect(screen.getByText('Object error message')).toBeInTheDocument();
    },
  );

  it.each(CONTROLS)('%s does not render the error kind', (_name, component) => {
    render({ ...component, setup: () => ({ errors: MIXED }) });
    expect(screen.queryByText('required')).not.toBeInTheDocument();
  });
});
