import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmToggle } from './llm-toggle';

describe('LlmToggle', () => {
  it('renders a checkbox input with role switch', () => {
    render(<LlmToggle>Enable</LlmToggle>);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('applies llm-toggle class to wrapper', () => {
    const { container } = render(<LlmToggle />);
    expect(container.firstChild).toHaveClass('llm-toggle');
  });

  it('renders label text', () => {
    render(<LlmToggle>Enable notifications</LlmToggle>);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<LlmToggle />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders as checked when checked=true', () => {
    render(<LlmToggle checked>Enable</LlmToggle>);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('applies is-checked class when checked', () => {
    const { container } = render(<LlmToggle checked />);
    expect(container.firstChild).toHaveClass('is-checked');
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmToggle disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<LlmToggle disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<LlmToggle invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('sets aria-invalid when invalid', () => {
    render(<LlmToggle invalid />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onCheckedChange on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<LlmToggle onCheckedChange={onCheckedChange}>Enable</LlmToggle>);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('shows error messages', () => {
    render(<LlmToggle invalid errors={['Required']}>Enable</LlmToggle>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('sets aria-checked attribute', () => {
    render(<LlmToggle checked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders track and thumb elements', () => {
    const { container } = render(<LlmToggle />);
    expect(container.querySelector('.track')).toBeInTheDocument();
    expect(container.querySelector('.thumb')).toBeInTheDocument();
  });
});
