import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlSelect, AtlOption } from './atl-select';

describe('AtlSelect', () => {
  covers('select', 'render-element')('renders a select element', () => {
    render(
      <AtlSelect>
        <AtlOption optionValue="a">Option A</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders options via AtlOption', () => {
    render(
      <AtlSelect>
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByRole('option', { name: 'United States' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Canada' })).toBeInTheDocument();
  });

  covers('select', 'placeholder')('shows placeholder when value is empty', () => {
    const { container } = render(
      <AtlSelect value="" placeholder="Select a country">
        <AtlOption optionValue="us">United States</AtlOption>
      </AtlSelect>
    );
    expect(container.querySelector('option[value=""]')).toBeInTheDocument();
    expect(container.querySelector('option[value=""]')?.textContent).toBe('Select a country');
  });

  covers('select', 'value-change')('calls onValueChange when selection changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlSelect value="" onValueChange={onChange}>
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
      </AtlSelect>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'ca');
    expect(onChange).toHaveBeenCalledWith('ca');
  });

  it('reflects controlled value', () => {
    render(
      <AtlSelect value="ca">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
      </AtlSelect>
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('ca');
  });

  covers('select', 'disabled')('is disabled when disabled prop is true', () => {
    render(
      <AtlSelect disabled>
        <AtlOption optionValue="a">A</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <AtlSelect disabled>
        <AtlOption optionValue="a">A</AtlOption>
      </AtlSelect>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  covers('select', 'invalid')('applies is-invalid class when invalid', () => {
    const { container } = render(
      <AtlSelect invalid>
        <AtlOption optionValue="a">A</AtlOption>
      </AtlSelect>
    );
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  covers('select', 'error-messages')('shows error messages when invalid and errors provided', () => {
    render(
      <AtlSelect invalid errors={['Please select an option']}>
        <AtlOption optionValue="a">A</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders label when label prop is provided', () => {
    render(
      <AtlSelect label="Country">
        <AtlOption optionValue="us">United States</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('associates label with select via id', () => {
    render(
      <AtlSelect label="Country">
        <AtlOption optionValue="us">United States</AtlOption>
      </AtlSelect>
    );
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });
});
