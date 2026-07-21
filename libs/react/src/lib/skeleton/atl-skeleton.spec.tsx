import { render } from '@testing-library/react';
import { covers } from '../../testing/behavior';
import { AtlSkeleton } from './atl-skeleton';

describe('AtlSkeleton', () => {
  it('renders with default variant', () => {
    const { container } = render(<AtlSkeleton />);
    expect(container.firstChild).toHaveClass('atl-skeleton', 'variant-text');
  });

  it.each(['text', 'circular', 'rectangular'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(<AtlSkeleton variant={variant} />);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );

  covers('skeleton', 'custom-size')('applies custom width', () => {
    const { container } = render(<AtlSkeleton width="60%" />);
    expect((container.firstChild as HTMLElement).style.width).toBe('60%');
  });

  it('applies custom height', () => {
    const { container } = render(<AtlSkeleton variant="rectangular" height="200px" />);
    expect((container.firstChild as HTMLElement).style.height).toBe('200px');
  });

  it('has aria-hidden', () => {
    const { container } = render(<AtlSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies is-animated class when animated is true', () => {
    const { container } = render(<AtlSkeleton animated />);
    expect(container.firstChild).toHaveClass('is-animated');
  });

  covers('skeleton', 'not-animated')('does not apply is-animated class when animated is false', () => {
    const { container } = render(<AtlSkeleton animated={false} />);
    expect(container.firstChild).not.toHaveClass('is-animated');
  });

  covers('skeleton', 'circular-height')('sets circular height equal to width when no height provided', () => {
    const { container } = render(<AtlSkeleton variant="circular" width="48px" />);
    expect((container.firstChild as HTMLElement).style.height).toBe('48px');
  });
});
