import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmAlert } from './llm-alert';

describe('LlmAlert', () => {
  it('renders projected content', async () => {
    await render('<llm-alert>Your changes were saved.</llm-alert>', { imports: [LlmAlert] });
    expect(screen.getByText('Your changes were saved.')).toBeInTheDocument();
  });

  it('has role="alert" on host', async () => {
    const { container } = await render('<llm-alert>Message</llm-alert>', { imports: [LlmAlert] });
    expect(container.querySelector('llm-alert')).toHaveAttribute('role', 'alert');
  });

  describe('variant classes', () => {
    it.each(['info', 'success', 'warning', 'danger'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-alert variant="${variant}">Message</llm-alert>`,
          { imports: [LlmAlert] }
        );
        expect(container.querySelector('llm-alert')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('aria-live', () => {
    it('sets aria-live="polite" for non-danger variants', async () => {
      const { container } = await render(
        '<llm-alert variant="info">Info message</llm-alert>',
        { imports: [LlmAlert] }
      );
      expect(container.querySelector('llm-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="polite" for success variant', async () => {
      const { container } = await render(
        '<llm-alert variant="success">Success message</llm-alert>',
        { imports: [LlmAlert] }
      );
      expect(container.querySelector('llm-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="polite" for warning variant', async () => {
      const { container } = await render(
        '<llm-alert variant="warning">Warning message</llm-alert>',
        { imports: [LlmAlert] }
      );
      expect(container.querySelector('llm-alert')).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-live="assertive" for danger variant', async () => {
      const { container } = await render(
        '<llm-alert variant="danger">Error message</llm-alert>',
        { imports: [LlmAlert] }
      );
      expect(container.querySelector('llm-alert')).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('dismiss button', () => {
    it('does not render dismiss button when dismissible=false', async () => {
      await render('<llm-alert>Message</llm-alert>', { imports: [LlmAlert] });
      expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
    });

    it('renders dismiss button when dismissible=true', async () => {
      await render('<llm-alert [dismissible]="true">Message</llm-alert>', { imports: [LlmAlert] });
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('emits dismissed output when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const dismissed = vi.fn();
      await render('<llm-alert [dismissible]="true" (dismissed)="dismissed()">Message</llm-alert>', {
        imports: [LlmAlert],
        componentProperties: { dismissed },
      });
      await user.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(dismissed).toHaveBeenCalledTimes(1);
    });
  });
});
