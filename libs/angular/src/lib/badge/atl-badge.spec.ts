import { render, screen } from '@testing-library/angular';
import { AtlBadge } from './atl-badge';
import { covers } from '../../testing/behavior';

describe('AtlBadge', () => {
  covers('badge', 'render-default')(
    'renders without error with default inputs',
    async () => {
      await render('<atl-badge>Active</atl-badge>', { imports: [AtlBadge] });
      expect(screen.getByText('Active')).toBeInTheDocument();
    },
  );

  it('is decorative by default: no role attribute', async () => {
    const { container } = await render('<atl-badge>Info</atl-badge>', {
      imports: [AtlBadge],
    });
    expect(container.querySelector('atl-badge')).not.toHaveAttribute('role');
  });

  it('renders a consumer-passed role="status" on the host', async () => {
    const { container } = await render(
      '<atl-badge role="status">3 new</atl-badge>',
      { imports: [AtlBadge] },
    );
    expect(container.querySelector('atl-badge')).toHaveAttribute(
      'role',
      'status',
    );
  });

  it('keeps the static atl-badge class alongside the bound classes', async () => {
    // The shared stylesheet (libs/styles) is scoped by `.atl-badge`, and the host
    // also binds `[class]`; the two must merge, across input changes too.
    const { container, rerender } = await render(
      '<atl-badge [variant]="variant">Badge</atl-badge>',
      { imports: [AtlBadge], componentProperties: { variant: 'success' } },
    );
    const host = container.querySelector('atl-badge') as HTMLElement;
    expect(host).toHaveClass('atl-badge', 'variant-success', 'size-md');

    await rerender({ componentProperties: { variant: 'danger' } });
    expect(host).toHaveClass('atl-badge', 'variant-danger', 'size-md');
    expect(host).not.toHaveClass('variant-success');
  });

  describe('variant classes', () => {
    it.each(['default', 'success', 'warning', 'danger', 'info'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-badge variant="${variant}">Label</atl-badge>`,
          { imports: [AtlBadge] },
        );
        expect(container.querySelector('atl-badge')).toHaveClass(
          `variant-${variant}`,
        );
      },
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<atl-badge size="${size}">Label</atl-badge>`,
          { imports: [AtlBadge] },
        );
        expect(container.querySelector('atl-badge')).toHaveClass(
          `size-${size}`,
        );
      },
    );
  });

  it('projects slotted label text', async () => {
    await render('<atl-badge>In Review</atl-badge>', { imports: [AtlBadge] });
    expect(screen.getByText('In Review')).toBeInTheDocument();
  });
});
