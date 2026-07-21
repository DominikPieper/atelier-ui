import { render } from '@testing-library/vue';
import AtlSkeleton from './atl-skeleton.vue';
import { covers } from '../../testing/behavior';

describe('AtlSkeleton', () => {
  it('renders with default props', () => {
    const { container } = render(AtlSkeleton);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('atl-skeleton', 'variant-text', 'is-animated');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant class', () => {
    const { container } = render(AtlSkeleton, { props: { variant: 'circular' } });
    expect(container.firstChild).toHaveClass('variant-circular');
  });

  covers('skeleton', 'not-animated')('does not add is-animated class when animated is false', () => {
    const { container } = render(AtlSkeleton, { props: { animated: false } });
    expect(container.firstChild).not.toHaveClass('is-animated');
  });

  covers('skeleton', 'custom-size')('applies custom width and height styles', () => {
    const { container } = render(AtlSkeleton, { props: { variant: 'rectangular', width: '200px', height: '50px' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  covers('skeleton', 'circular-height')('computes height for circular variant to match width', () => {
    const { container } = render(AtlSkeleton, { props: { variant: 'circular', width: '48px' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('48px');
  });

  it('uses 1em height for text variant by default', () => {
    const { container } = render(AtlSkeleton, { props: { variant: 'text' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('1em');
  });
});
