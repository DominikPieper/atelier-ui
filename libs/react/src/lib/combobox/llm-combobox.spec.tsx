import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LlmCombobox } from './llm-combobox';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape', disabled: true },
];

function Controlled(props: { initialValue?: string }) {
  const [value, setValue] = useState(props.initialValue ?? '');
  return (
    <LlmCombobox
      value={value}
      onValueChange={setValue}
      options={OPTIONS}
      placeholder="Search fruit…"
    />
  );
}

describe('LlmCombobox', () => {
  it('renders an input with role="combobox"', () => {
    const { container } = render(<Controlled />);
    expect(container.querySelector('input[role="combobox"]')).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    render(<Controlled />);
    expect(screen.getByPlaceholderText('Search fruit…')).toBeInTheDocument();
  });

  it('opens the listbox on focus', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('filters options as user types', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('an');
    const options = screen.getAllByRole('option');
    expect(options.some((o) => o.textContent?.includes('Banana'))).toBe(true);
    expect(options.every((o) => !o.textContent?.includes('Apple'))).toBe(true);
  });

  it('shows "No results found." when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('zzz');
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LlmCombobox value="" onValueChange={onChange} options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('shows selected label in input after selection', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getByRole('combobox')).toHaveValue('Apple');
  });

  it('closes the panel after selection', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Cherry'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LlmCombobox value="" onValueChange={onChange} options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('cycles ArrowDown to wrap around', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LlmCombobox value="" onValueChange={onChange} options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    // 5 ArrowDowns: -1→0(apple)→1(banana)→2(cherry)→3(grape)→wraps to 0(apple)
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('sets aria-expanded=true when open', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows preselected label on initial render', () => {
    render(<Controlled initialValue="banana" />);
    expect(screen.getByRole('combobox')).toHaveValue('Banana');
  });

  it('disables input and applies is-disabled class', () => {
    const { container } = render(
      <LlmCombobox options={OPTIONS} disabled />,
    );
    expect(container.querySelector('.llm-combobox')).toHaveClass('is-disabled');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(
      <LlmCombobox options={OPTIONS} invalid />,
    );
    expect(container.querySelector('.llm-combobox')).toHaveClass('is-invalid');
  });

  it('shows error messages when invalid and errors provided', () => {
    render(
      <LlmCombobox options={OPTIONS} invalid errors={['Please select a fruit']} />,
    );
    expect(screen.getByText('Please select a fruit')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not select a disabled option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LlmCombobox value="" onValueChange={onChange} options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    const grapeOption = screen.getAllByRole('option').find((o) => o.textContent?.includes('Grape'))!;
    await user.click(grapeOption);
    expect(onChange).not.toHaveBeenCalled();
  });
});
