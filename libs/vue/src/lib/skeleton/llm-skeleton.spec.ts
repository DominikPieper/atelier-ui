import { render } from '@testing-library/vue';
import LlmSkeleton from './llm-skeleton.vue';

describe('LlmSkeleton', () => {
  it('renders with default props', () => {
    const { container } = render(LlmSkeleton);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('llm-skeleton', 'variant-text', 'is-animated');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant class', () => {
    const { container } = render(LlmSkeleton, { props: { variant: 'circular' } });
    expect(container.firstChild).toHaveClass('variant-circular');
  });

  it('does not add is-animated class when animated is false', () => {
    const { container } = render(LlmSkeleton, { props: { animated: false } });
    expect(container.firstChild).not.toHaveClass('is-animated');
  });

  it('applies custom width and height styles', () => {
    const { container } = render(LlmSkeleton, { props: { variant: 'rectangular', width: '200px', height: '50px' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  it('computes height for circular variant to match width', () => {
    const { container } = render(LlmSkeleton, { props: { variant: 'circular', width: '48px' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('48px');
  });

  it('uses 1em height for text variant by default', () => {
    const { container } = render(LlmSkeleton, { props: { variant: 'text' } });
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('1em');
  });
});
