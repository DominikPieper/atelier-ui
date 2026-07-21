import { render, screen } from '@testing-library/vue';
import { covers } from '../../testing/behavior';
import AtlBadge from './atl-badge.vue';

describe('AtlBadge', () => {
  covers('badge', 'render-default')('renders with default props', () => {
    render(AtlBadge, { slots: { default: 'Active' } });
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Active');
    expect(badge).toHaveClass('atl-badge', 'variant-default', 'size-md');
  });

  it('applies variant class', () => {
    render(AtlBadge, { props: { variant: 'success' }, slots: { default: 'OK' } });
    expect(screen.getByRole('status')).toHaveClass('variant-success');
  });

  it('applies size class', () => {
    render(AtlBadge, { props: { size: 'sm' }, slots: { default: 'Small' } });
    expect(screen.getByRole('status')).toHaveClass('size-sm');
  });

  it('renders all variants without error', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
    for (const variant of variants) {
      const { unmount } = render(AtlBadge, { props: { variant }, slots: { default: variant } });
      expect(screen.getByRole('status')).toHaveClass(`variant-${variant}`);
      unmount();
    }
  });

  it('renders slot content', () => {
    render(AtlBadge, { slots: { default: 'Custom content' } });
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});
