import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmSelect from './llm-select.vue';
import LlmOption from './llm-option.vue';
import { covers } from '../../testing/behavior';


describe('LlmSelect', () => {
  covers('select', 'render-element')('renders a select element', () => {
    render(LlmSelect);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(LlmSelect, { props: { label: 'Country' } });
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  covers('select', 'placeholder')('renders placeholder option', () => {
    render(LlmSelect, { props: { placeholder: 'Select a country' } });
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  covers('select', 'error-messages')('renders error messages', () => {
    render(LlmSelect, { props: { errors: ['This field is required'], invalid: true } });
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  covers('select', 'invalid')('sets aria-invalid when invalid', () => {
    render(LlmSelect, { props: { invalid: true } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('select', 'disabled')('disables the select when disabled', () => {
    render(LlmSelect, { props: { disabled: true } });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  covers('select', 'value-change')('emits update:value on change', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmSelect, {
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

describe('LlmOption', () => {
  it('renders option with correct value', () => {
    render({
      components: { LlmSelect, LlmOption },
      template: `
        <LlmSelect>
          <LlmOption optionValue="test">Test Option</LlmOption>
        </LlmSelect>
      `,
    });
    expect(screen.getByText('Test Option')).toBeInTheDocument();
  });
});
