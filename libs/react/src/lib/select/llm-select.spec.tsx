import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmSelect, LlmOption } from './llm-select';

describe('LlmSelect', () => {
  it('renders a select element', () => {
    render(
      <LlmSelect>
        <LlmOption optionValue="a">Option A</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders options via LlmOption', () => {
    render(
      <LlmSelect>
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
  });

  it('shows placeholder when value is empty', () => {
    const { container } = render(
      <LlmSelect value="" placeholder="Select a country">
        <LlmOption optionValue="us">United States</LlmOption>
      </LlmSelect>
    );
    expect(container.querySelector('option[value=""]')).toBeInTheDocument();
    expect(container.querySelector('option[value=""]')?.textContent).toBe('Select a country');
  });

  it('calls onValueChange when selection changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmSelect value="" onValueChange={onChange}>
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
      </LlmSelect>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'ca');
    expect(onChange).toHaveBeenCalledWith('ca');
  });

  it('reflects controlled value', () => {
    render(
      <LlmSelect value="ca">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
      </LlmSelect>
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('ca');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <LlmSelect disabled>
        <LlmOption optionValue="a">A</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <LlmSelect disabled>
        <LlmOption optionValue="a">A</LlmOption>
      </LlmSelect>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(
      <LlmSelect invalid>
        <LlmOption optionValue="a">A</LlmOption>
      </LlmSelect>
    );
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('shows error messages when invalid and errors provided', () => {
    render(
      <LlmSelect invalid errors={['Please select an option']}>
        <LlmOption optionValue="a">A</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders label when label prop is provided', () => {
    render(
      <LlmSelect label="Country">
        <LlmOption optionValue="us">United States</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('associates label with select via id', () => {
    render(
      <LlmSelect label="Country">
        <LlmOption optionValue="us">United States</LlmOption>
      </LlmSelect>
    );
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });
});
