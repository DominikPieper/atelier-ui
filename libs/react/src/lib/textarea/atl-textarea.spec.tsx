import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlTextarea } from './atl-textarea';

describe('AtlTextarea', () => {
  covers('textarea', 'renders-textarea')('renders a textarea element', () => {
    render(<AtlTextarea placeholder="Enter text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies atl-textarea class to wrapper', () => {
    const { container } = render(<AtlTextarea />);
    expect(container.firstChild).toHaveClass('atl-textarea');
  });

  it('renders with label', () => {
    render(<AtlTextarea label="Description" />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  covers('textarea', 'disabled')('is disabled when disabled prop is true', () => {
    render(<AtlTextarea disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<AtlTextarea disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<AtlTextarea invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('applies is-readonly class when readOnly', () => {
    const { container } = render(<AtlTextarea readOnly />);
    expect(container.firstChild).toHaveClass('is-readonly');
  });

  it('applies is-auto-resize class when autoResize', () => {
    const { container } = render(<AtlTextarea autoResize />);
    expect(container.firstChild).toHaveClass('is-auto-resize');
  });

  it('sets aria-invalid when invalid', () => {
    render(<AtlTextarea invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('textarea', 'errors')('shows error messages', () => {
    render(<AtlTextarea invalid errors={['Required field']} />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  covers('textarea', 'rows')('renders with rows attribute', () => {
    render(<AtlTextarea rows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('defaults to 3 rows', () => {
    render(<AtlTextarea />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  covers('textarea', 'updates-value')('calls onValueChange on input', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<AtlTextarea onValueChange={onValueChange} />);
    await user.type(screen.getByRole('textbox'), 'Hello');
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('Hello');
  });

  it('forwards placeholder', () => {
    render(<AtlTextarea placeholder="Tell us about yourself" />);
    expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
  });
});
