import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmTextarea } from './llm-textarea';

describe('LlmTextarea', () => {
  it('renders a textarea element', () => {
    render(<LlmTextarea placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies llm-textarea class to wrapper', () => {
    const { container } = render(<LlmTextarea />);
    expect(container.firstChild).toHaveClass('llm-textarea');
  });

  it('renders with label', () => {
    render(<LlmTextarea label="Description" />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmTextarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<LlmTextarea disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<LlmTextarea invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('applies is-readonly class when readOnly', () => {
    const { container } = render(<LlmTextarea readOnly />);
    expect(container.firstChild).toHaveClass('is-readonly');
  });

  it('applies is-auto-resize class when autoResize', () => {
    const { container } = render(<LlmTextarea autoResize />);
    expect(container.firstChild).toHaveClass('is-auto-resize');
  });

  it('sets aria-invalid when invalid', () => {
    render(<LlmTextarea invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows error messages', () => {
    render(<LlmTextarea invalid errors={['Required field']} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders with rows attribute', () => {
    render(<LlmTextarea rows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('defaults to 3 rows', () => {
    render(<LlmTextarea />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('calls onValueChange on input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<LlmTextarea onValueChange={onValueChange} />);
    await user.type(screen.getByRole('textbox'), 'Hello');
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('Hello');
  });

  it('forwards placeholder', () => {
    render(<LlmTextarea placeholder="Tell us about yourself" />);
    expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
  });
});
