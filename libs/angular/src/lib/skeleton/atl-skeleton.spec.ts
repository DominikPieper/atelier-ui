import { render } from '@testing-library/angular';
import { AtlSkeleton } from './atl-skeleton';
import { covers } from '../../testing/behavior';

describe('AtlSkeleton', () => {
  it('renders with default variant class', async () => {
    const { container } = await render('<atl-skeleton />', {
      imports: [AtlSkeleton],
    });
    const el = container.querySelector('atl-skeleton') as HTMLElement;
    expect(el).toHaveClass('variant-text');
  });

  it('has aria-hidden="true"', async () => {
    const { container } = await render('<atl-skeleton />', {
      imports: [AtlSkeleton],
    });
    expect(container.querySelector('atl-skeleton')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  describe('variant classes', () => {
    it.each(['text', 'circular', 'rectangular'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-skeleton variant="${variant}" />`,
          { imports: [AtlSkeleton] }
        );
        expect(container.querySelector('atl-skeleton')).toHaveClass(
          `variant-${variant}`
        );
      }
    );
  });

  covers('skeleton', 'custom-size')('sets width and height styles', async () => {
    const { container } = await render(
      '<atl-skeleton width="200px" height="50px" />',
      { imports: [AtlSkeleton] }
    );
    const el = container.querySelector('atl-skeleton') as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('50px');
  });

  describe('auto-computed height per variant', () => {
    it('defaults to 1em for text variant', async () => {
      const { container } = await render('<atl-skeleton variant="text" />', {
        imports: [AtlSkeleton],
      });
      const el = container.querySelector('atl-skeleton') as HTMLElement;
      expect(el.style.height).toBe('1em');
    });

    covers('skeleton', 'circular-height')('defaults to width for circular variant', async () => {
      const { container } = await render(
        '<atl-skeleton variant="circular" width="40px" />',
        { imports: [AtlSkeleton] }
      );
      const el = container.querySelector('atl-skeleton') as HTMLElement;
      expect(el.style.height).toBe('40px');
    });

    it('defaults to 100px for rectangular variant', async () => {
      const { container } = await render(
        '<atl-skeleton variant="rectangular" />',
        { imports: [AtlSkeleton] }
      );
      const el = container.querySelector('atl-skeleton') as HTMLElement;
      expect(el.style.height).toBe('100px');
    });
  });

  it('applies is-animated class when animated is true (default)', async () => {
    const { container } = await render('<atl-skeleton />', {
      imports: [AtlSkeleton],
    });
    expect(container.querySelector('atl-skeleton')).toHaveClass('is-animated');
  });

  covers('skeleton', 'not-animated')('does not apply is-animated class when animated is false', async () => {
    const { container } = await render(
      '<atl-skeleton [animated]="false" />',
      { imports: [AtlSkeleton] }
    );
    expect(container.querySelector('atl-skeleton')).not.toHaveClass(
      'is-animated'
    );
  });
});
