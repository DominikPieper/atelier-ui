import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import type { AtlErrorItem } from './spec';
import { AtlCheckbox } from './checkbox/atl-checkbox';
import { AtlCombobox } from './combobox/atl-combobox';
import { AtlInput } from './input/atl-input';
import { AtlRadioGroup } from './radio-group/atl-radio-group';
import { AtlRadio } from './radio/atl-radio';
import { AtlSelect, AtlOption } from './select/atl-select';
import { AtlTextarea } from './textarea/atl-textarea';
import { AtlToggle } from './toggle/atl-toggle';

// The shared error item (`{ kind, message? }`) is Angular's ValidationError shape.
// Every form control must render `message` for an object and the string itself for a
// string, so a mixed list works and `string[]` keeps working.
const MIXED: ReadonlyArray<string | AtlErrorItem> = [
  'Plain string error',
  { kind: 'required', message: 'Object error message' },
];

const CONTROLS: Array<[string, (errors: typeof MIXED) => ReactElement]> = [
  ['input', (errors) => <AtlInput invalid errors={errors} />],
  ['textarea', (errors) => <AtlTextarea invalid errors={errors} />],
  [
    'checkbox',
    (errors) => (
      <AtlCheckbox invalid errors={errors}>
        Accept
      </AtlCheckbox>
    ),
  ],
  [
    'toggle',
    (errors) => (
      <AtlToggle invalid errors={errors}>
        Enable
      </AtlToggle>
    ),
  ],
  [
    'select',
    (errors) => (
      <AtlSelect invalid errors={errors}>
        <AtlOption optionValue="a">A</AtlOption>
      </AtlSelect>
    ),
  ],
  [
    'combobox',
    (errors) => (
      <AtlCombobox
        invalid
        errors={errors}
        options={[{ value: 'a', label: 'A' }]}
      />
    ),
  ],
  [
    'radio-group',
    (errors) => (
      <AtlRadioGroup invalid errors={errors} name="r">
        <AtlRadio radioValue="a">A</AtlRadio>
      </AtlRadioGroup>
    ),
  ],
];

describe('errors accept the shared error item', () => {
  it.each(CONTROLS)('%s renders strings and error objects', (_name, make) => {
    render(make(MIXED));
    expect(screen.getByText('Plain string error')).toBeInTheDocument();
    expect(screen.getByText('Object error message')).toBeInTheDocument();
  });

  it.each(CONTROLS)('%s does not render the error kind', (_name, make) => {
    render(make(MIXED));
    expect(screen.queryByText('required')).not.toBeInTheDocument();
  });
});
