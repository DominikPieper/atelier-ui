import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlSelect from './atl-select.vue';
import AtlOption from './atl-option.vue';
import { covers } from '../../testing/behavior';


describe('AtlSelect', () => {
  covers('select', 'render-element')('renders a select element', () => {
    render(AtlSelect);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(AtlSelect, { props: { label: 'Country' } });
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  covers('select', 'placeholder')('renders placeholder option', () => {
    render(AtlSelect, { props: { placeholder: 'Select a country' } });
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  covers('select', 'error-messages')('renders error messages', () => {
    render(AtlSelect, { props: { errors: ['This field is required'], invalid: true } });
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  covers('select', 'invalid')('sets aria-invalid when invalid', () => {
    render(AtlSelect, { props: { invalid: true } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('select', 'disabled')('disables the select when disabled', () => {
    render(AtlSelect, { props: { disabled: true } });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  covers('select', 'value-change')('emits update:value on change', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlSelect, {
      props: { value: '' },
      slots: {
        default: `<option value="us">United States</option><option value="ca">Canada</option>`,
      },
    });
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'ca');
    expect(emitted()['update:value']).toBeTruthy();
  });
});

describe('AtlOption', () => {
  it('renders option with correct value', () => {
    render({
      components: { AtlSelect, AtlOption },
      template: `
        <AtlSelect>
          <AtlOption optionValue="test">Test Option</AtlOption>
        </AtlSelect>
      `,
    });
    expect(screen.getByText('Test Option')).toBeInTheDocument();
  });
});
