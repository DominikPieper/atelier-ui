import { render, screen } from '@testing-library/angular';
import { AtlBadge } from './atl-badge';
import { covers } from '../../testing/behavior';

describe('AtlBadge', () => {
  covers('badge', 'render-default')('renders without error with default inputs', async () => {
    await render('<atl-badge>Active</atl-badge>', { imports: [AtlBadge] });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('has role="status" for screen reader awareness', async () => {
    const { container } = await render('<atl-badge>Info</atl-badge>', { imports: [AtlBadge] });
    expect(container.querySelector('atl-badge')).toHaveAttribute('role', 'status');
  });

  describe('variant classes', () => {
    it.each(['default', 'success', 'warning', 'danger', 'info'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-badge variant="${variant}">Label</atl-badge>`,
          { imports: [AtlBadge] }
        );
        expect(container.querySelector('atl-badge')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<atl-badge size="${size}">Label</atl-badge>`,
          { imports: [AtlBadge] }
        );
        expect(container.querySelector('atl-badge')).toHaveClass(`size-${size}`);
      }
    );
  });

  it('projects slotted label text', async () => {
    await render('<atl-badge>In Review</atl-badge>', { imports: [AtlBadge] });
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });
});
