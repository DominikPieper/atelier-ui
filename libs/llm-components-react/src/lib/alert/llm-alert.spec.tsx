import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmAlert } from './llm-alert';

describe('LlmAlert', () => {
  it('renders without error', () => {
    render(<LlmAlert>Alert message</LlmAlert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it.each(['info', 'success', 'warning', 'danger'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(<LlmAlert variant={variant}>Msg</LlmAlert>);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );

  it('applies llm-alert class', () => {
    const { container } = render(<LlmAlert>Msg</LlmAlert>);
    expect(container.firstChild).toHaveClass('llm-alert');
  });

  it('defaults to info variant', () => {
    const { container } = render(<LlmAlert>Msg</LlmAlert>);
    expect(container.firstChild).toHaveClass('variant-info');
  });

  it('does not show dismiss button by default', () => {
    render(<LlmAlert>Msg</LlmAlert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible', () => {
    render(<LlmAlert dismissible>Msg</LlmAlert>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('calls onDismissed when dismiss clicked', async () => {
    const user = userEvent.setup();
    const onDismissed = vi.fn();
    render(
      <LlmAlert dismissible onDismissed={onDismissed}>
        Msg
      </LlmAlert>
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismissed).toHaveBeenCalledOnce();
  });

  it('has role=alert', () => {
    const { container } = render(<LlmAlert>Msg</LlmAlert>);
    expect(container.firstChild).toHaveAttribute('role', 'alert');
  });

  it('sets aria-live to assertive for danger', () => {
    const { container } = render(<LlmAlert variant="danger">Msg</LlmAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-live to assertive for warning', () => {
    const { container } = render(<LlmAlert variant="warning">Msg</LlmAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-live to polite for info', () => {
    const { container } = render(<LlmAlert variant="info">Msg</LlmAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('sets aria-live to polite for success', () => {
    const { container } = render(<LlmAlert variant="success">Msg</LlmAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('forwards additional className', () => {
    const { container } = render(<LlmAlert className="custom-class">Msg</LlmAlert>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
