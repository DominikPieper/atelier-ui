import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { AtlAlert } from './atl-alert';
import { covers } from '../../testing/behavior';

describe('AtlAlert', () => {
  it('renders projected content', async () => {
    await render('<atl-alert>Your changes were saved.</atl-alert>', { imports: [AtlAlert] });
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument();
  });

  it('has role="alert" on host', async () => {
    const { container } = await render('<atl-alert>Message</atl-alert>', { imports: [AtlAlert] });
    expect(container.querySelector('atl-alert')).toHaveAttribute('role', 'alert');
  });

  describe('variant classes', () => {
    it.each(['info', 'success', 'warning', 'danger'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-alert variant="${variant}">Message</atl-alert>`,
          { imports: [AtlAlert] }
        );
        expect(container.querySelector('atl-alert')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('aria-live', () => {
    covers('alert', 'aria-live')('sets aria-live="polite" for non-danger variants', async () => {
      const { container } = await render(
        '<atl-alert variant="info">Info message</atl-alert>',
        { imports: [AtlAlert] }
      );
      expect(container.querySelector('atl-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="polite" for success variant', async () => {
      const { container } = await render(
        '<atl-alert variant="success">Success message</atl-alert>',
        { imports: [AtlAlert] }
      );
      expect(container.querySelector('atl-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="polite" for warning variant', async () => {
      const { container } = await render(
        '<atl-alert variant="warning">Warning message</atl-alert>',
        { imports: [AtlAlert] }
      );
      expect(container.querySelector('atl-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="assertive" for danger variant', async () => {
      const { container } = await render(
        '<atl-alert variant="danger">Error message</atl-alert>',
        { imports: [AtlAlert] }
      );
      expect(container.querySelector('atl-alert')).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('dismiss button', () => {
    covers('alert', 'dismiss-hidden')('does not render dismiss button when dismissible=false', async () => {
      await render('<atl-alert>Message</atl-alert>', { imports: [AtlAlert] });
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    });

    covers('alert', 'dismiss-shown')('renders dismiss button when dismissible=true', async () => {
      await render('<atl-alert [dismissible]="true">Message</atl-alert>', { imports: [AtlAlert] });
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    covers('alert', 'emits-dismiss')('emits dismissed output when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const dismissed = vi.fn();
      await render('<atl-alert [dismissible]="true" (dismissed)="dismissed()">Message</atl-alert>', {
        imports: [AtlAlert],
        componentProperties: { dismissed },
      });
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(dismissed).toHaveBeenCalledTimes(1);
    });
  });
});
