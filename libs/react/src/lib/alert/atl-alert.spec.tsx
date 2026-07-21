import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlAlert } from './atl-alert';

describe('AtlAlert', () => {
  it('renders without error', () => {
    render(<AtlAlert>Alert message</AtlAlert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it.each(['info', 'success', 'warning', 'danger'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(<AtlAlert variant={variant}>Msg</AtlAlert>);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );

  it('applies atl-alert class', () => {
    const { container } = render(<AtlAlert>Msg</AtlAlert>);
    expect(container.firstChild).toHaveClass('atl-alert');
  });

  it('defaults to info variant', () => {
    const { container } = render(<AtlAlert>Msg</AtlAlert>);
    expect(container.firstChild).toHaveClass('variant-info');
  });

  covers('alert', 'dismiss-hidden')('does not show dismiss button by default', () => {
    render(<AtlAlert>Msg</AtlAlert>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  covers('alert', 'dismiss-shown')('shows dismiss button when dismissible', () => {
    render(<AtlAlert dismissible>Msg</AtlAlert>);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  covers('alert', 'emits-dismiss')('calls onDismissed when dismiss clicked', async () => {
    const user = userEvent.setup();
    const onDismissed = vi.fn();
    render(
      <AtlAlert dismissible onDismissed={onDismissed}>
        Msg
      </AtlAlert>
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismissed).toHaveBeenCalledOnce();
  });

  it('has role=alert', () => {
    const { container } = render(<AtlAlert>Msg</AtlAlert>);
    expect(container.firstChild).toHaveAttribute('role', 'alert');
  });

  covers('alert', 'aria-live')('sets aria-live to assertive for danger', () => {
    const { container } = render(<AtlAlert variant="danger">Msg</AtlAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-live to assertive for warning', () => {
    const { container } = render(<AtlAlert variant="warning">Msg</AtlAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-live to polite for info', () => {
    const { container } = render(<AtlAlert variant="info">Msg</AtlAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('sets aria-live to polite for success', () => {
    const { container } = render(<AtlAlert variant="success">Msg</AtlAlert>);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('forwards additional className', () => {
    const { container } = render(<AtlAlert className="custom-class">Msg</AtlAlert>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
