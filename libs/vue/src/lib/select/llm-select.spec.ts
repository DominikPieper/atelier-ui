import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmSelect from './llm-select.vue';
import LlmOption from './llm-option.vue';


describe('LlmSelect', () => {
  // @behavior render-element
  it('renders a select element', () => {
    render(LlmSelect);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(LlmSelect, { props: { label: 'Country' } });
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  // @behavior placeholder
  it('renders placeholder option', () => {
    render(LlmSelect, { props: { placeholder: 'Select a country' } });
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  // @behavior error-messages
  it('renders error messages', () => {
    render(LlmSelect, { props: { errors: ['This field is required'], invalid: true } });
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // @behavior invalid
  it('sets aria-invalid when invalid', () => {
    render(LlmSelect, { props: { invalid: true } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  // @behavior disabled
  it('disables the select when disabled', () => {
    render(LlmSelect, { props: { disabled: true } });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  // @behavior value-change
  it('emits update:value on change', async () => {
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
