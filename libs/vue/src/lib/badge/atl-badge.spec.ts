import { render, screen } from '@testing-library/vue';
import { covers } from '../../testing/behavior';
import AtlBadge from './atl-badge.vue';

describe('AtlBadge', () => {
  covers('badge', 'render-default')('renders with default props', () => {
    render(AtlBadge, { slots: { default: 'Active' } });
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('atl-badge', 'variant-default', 'size-md');
  });

  it('applies variant class', () => {
    render(AtlBadge, {
      props: { variant: 'success' },
      slots: { default: 'OK' },
    });
    expect(screen.getByText('OK')).toHaveClass('variant-success');
  });

  it('applies size class', () => {
    render(AtlBadge, { props: { size: 'sm' }, slots: { default: 'Small' } });
    expect(screen.getByText('Small')).toHaveClass('size-sm');
  });

  it('renders all variants without error', () => {
    const variants = [
      'default',
      'success',
      'warning',
      'danger',
      'info',
    ] as const;
    for (const variant of variants) {
      const { unmount } = render(AtlBadge, {
        props: { variant },
        slots: { default: variant },
      });
      expect(screen.getByText(variant)).toHaveClass(`variant-${variant}`);
      unmount();
    }
  });

  it('renders slot content', () => {
    render(AtlBadge, { slots: { default: 'Custom content' } });
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('is decorative by default: no role attribute', () => {
    render(AtlBadge, { slots: { default: 'Label' } });
    expect(screen.getByText('Label')).not.toHaveAttribute('role');
  });

  it('renders a consumer-passed role="status" (attribute fallthrough)', () => {
    render(AtlBadge, {
      attrs: { role: 'status' },
      slots: { default: '3 new' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('3 new');
  });
});
