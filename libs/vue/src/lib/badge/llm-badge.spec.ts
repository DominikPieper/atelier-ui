import { render, screen } from '@testing-library/vue';
import LlmBadge from './llm-badge.vue';

describe('LlmBadge', () => {
  it('renders with default props', () => {
    render(LlmBadge, { slots: { default: 'Active' } });
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Active');
    expect(badge).toHaveClass('llm-badge', 'variant-default', 'size-md');
  });

  it('applies variant class', () => {
    render(LlmBadge, { props: { variant: 'success' }, slots: { default: 'OK' } });
    expect(screen.getByRole('status')).toHaveClass('variant-success');
  });

  it('applies size class', () => {
    render(LlmBadge, { props: { size: 'sm' }, slots: { default: 'Small' } });
    expect(screen.getByRole('status')).toHaveClass('size-sm');
  });

  it('renders all variants without error', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
    for (const variant of variants) {
      const { unmount } = render(LlmBadge, { props: { variant }, slots: { default: variant } });
      expect(screen.getByRole('status')).toHaveClass(`variant-${variant}`);
      unmount();
    }
  });

  it('renders slot content', () => {
    render(LlmBadge, { slots: { default: 'Custom content' } });
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });
});
