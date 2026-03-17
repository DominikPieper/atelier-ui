import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmInput } from './llm-input';

describe('LlmInput', () => {
  it('renders an input element', () => {
    render(<LlmInput placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies llm-input class to wrapper', () => {
    const { container } = render(<LlmInput />);
    expect(container.firstChild).toHaveClass('llm-input');
  });

  it('renders with label', () => {
    render(<LlmInput label="Email" type="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmInput disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<LlmInput disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<LlmInput invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('applies is-readonly class when readOnly', () => {
    const { container } = render(<LlmInput readOnly />);
    expect(container.firstChild).toHaveClass('is-readonly');
  });

  it('sets aria-invalid when invalid', () => {
    render(<LlmInput invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error messages', () => {
    render(<LlmInput invalid errors={['Required field']} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('shows multiple error messages', () => {
    render(<LlmInput invalid errors={['Required field', 'Invalid format']} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByText('Invalid format')).toBeInTheDocument();
  });

  it('calls onValueChange on input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<LlmInput onValueChange={onValueChange} />);
    await user.type(screen.getByRole('textbox'), 'Hello');
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('Hello');
  });

  it('calls onChange on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LlmInput onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards placeholder', () => {
    render(<LlmInput placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders password type input', () => {
    render(<LlmInput type="password" />);
    // password inputs don't have textbox role
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });
});
