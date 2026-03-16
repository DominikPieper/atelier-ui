import { render } from '@testing-library/angular';
import { LlmSkeleton } from './llm-skeleton';

describe('LlmSkeleton', () => {
  it('renders with default variant class', async () => {
    const { container } = await render('<llm-skeleton />', {
      imports: [LlmSkeleton],
    });
    const el = container.querySelector('llm-skeleton')!;
    expect(el).toHaveClass('variant-text');
  });

  it('has aria-hidden="true"', async () => {
    const { container } = await render('<llm-skeleton />', {
      imports: [LlmSkeleton],
    });
    expect(container.querySelector('llm-skeleton')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  describe('variant classes', () => {
    it.each(['text', 'circular', 'rectangular'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-skeleton variant="${variant}" />`,
          { imports: [LlmSkeleton] }
        );
        expect(container.querySelector('llm-skeleton')).toHaveClass(
          `variant-${variant}`
        );
      }
    );
  });

  it('sets width and height styles', async () => {
    const { container } = await render(
      '<llm-skeleton width="200px" height="50px" />',
      { imports: [LlmSkeleton] }
    );
    const el = container.querySelector('llm-skeleton') as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  describe('auto-computed height per variant', () => {
    it('defaults to 1em for text variant', async () => {
      const { container } = await render('<llm-skeleton variant="text" />', {
        imports: [LlmSkeleton],
      });
      const el = container.querySelector('llm-skeleton') as HTMLElement;
      expect(el.style.height).toBe('1em');
    });

    it('defaults to width for circular variant', async () => {
      const { container } = await render(
        '<llm-skeleton variant="circular" width="40px" />',
        { imports: [LlmSkeleton] }
      );
      const el = container.querySelector('llm-skeleton') as HTMLElement;
      expect(el.style.height).toBe('40px');
    });

    it('defaults to 100px for rectangular variant', async () => {
      const { container } = await render(
        '<llm-skeleton variant="rectangular" />',
        { imports: [LlmSkeleton] }
      );
      const el = container.querySelector('llm-skeleton') as HTMLElement;
      expect(el.style.height).toBe('100px');
    });
  });

  it('applies is-animated class when animated is true (default)', async () => {
    const { container } = await render('<llm-skeleton />', {
      imports: [LlmSkeleton],
    });
    expect(container.querySelector('llm-skeleton')).toHaveClass('is-animated');
  });

  it('does not apply is-animated class when animated is false', async () => {
    const { container } = await render(
      '<llm-skeleton [animated]="false" />',
      { imports: [LlmSkeleton] }
    );
    expect(container.querySelector('llm-skeleton')).not.toHaveClass(
      'is-animated'
    );
  });
});
