import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmCheckbox } from './llm-checkbox';

describe('LlmCheckbox', () => {
  it('renders a checkbox input', () => {
    render(<LlmCheckbox>Accept</LlmCheckbox>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('applies llm-checkbox class to wrapper', () => {
    const { container } = render(<LlmCheckbox />);
    expect(container.firstChild).toHaveClass('llm-checkbox');
  });

  it('renders label text', () => {
    render(<LlmCheckbox>I agree</LlmCheckbox>);
    expect(screen.getByText('I agree')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<LlmCheckbox />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders as checked when checked=true', () => {
    render(<LlmCheckbox checked>Accept</LlmCheckbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies is-checked class when checked', () => {
    const { container } = render(<LlmCheckbox checked />);
    expect(container.firstChild).toHaveClass('is-checked');
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmCheckbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<LlmCheckbox disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<LlmCheckbox invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('sets aria-invalid when invalid', () => {
    render(<LlmCheckbox invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onCheckedChange on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<LlmCheckbox onCheckedChange={onCheckedChange}>Accept</LlmCheckbox>);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('sets indeterminate state on checkbox element', () => {
    render(<LlmCheckbox indeterminate />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it('shows error messages', () => {
    render(<LlmCheckbox invalid errors={['Required']}>Accept</LlmCheckbox>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
