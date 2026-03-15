import { render, screen } from '@testing-library/angular';
import { LlmBadge } from './llm-badge';

describe('LlmBadge', () => {
  it('renders without error with default inputs', async () => {
    await render('<llm-badge>Active</llm-badge>', { imports: [LlmBadge] });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('has role="status" for screen reader awareness', async () => {
    const { container } = await render('<llm-badge>Info</llm-badge>', { imports: [LlmBadge] });
    expect(container.querySelector('llm-badge')).toHaveAttribute('role', 'status');
  });

  describe('variant classes', () => {
    it.each(['default', 'success', 'warning', 'danger', 'info'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-badge variant="${variant}">Label</llm-badge>`,
          { imports: [LlmBadge] }
        );
        expect(container.querySelector('llm-badge')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<llm-badge size="${size}">Label</llm-badge>`,
          { imports: [LlmBadge] }
        );
        expect(container.querySelector('llm-badge')).toHaveClass(`size-${size}`);
      }
    );
  });

  it('projects slotted label text', async () => {
    await render('<llm-badge>In Review</llm-badge>', { imports: [LlmBadge] });
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });
});
