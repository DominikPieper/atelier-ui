import { render } from '@testing-library/react';
import { AtlProgress } from './atl-progress';
import { covers } from '../../testing/behavior';

describe('AtlProgress', () => {
  it('renders with default props', () => {
    const { container } = render(<AtlProgress />);
    expect(container.firstChild).toHaveClass('atl-progress', 'variant-default', 'size-md');
  });

  it('has role="progressbar"', () => {
    const { container } = render(<AtlProgress value={50} />);
    expect(container.firstChild).toHaveAttribute('role', 'progressbar');
  });

  covers('progress', 'aria-value')('sets aria-valuenow to the clamped value', () => {
    const { container } = render(<AtlProgress value={75} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '75');
  });

  covers('progress', 'clamp')('clamps value to max', () => {
    const { container } = render(<AtlProgress value={200} max={100} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value to 0 when negative', () => {
    const { container } = render(<AtlProgress value={-10} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '0');
  });

  it.each(['default', 'success', 'warning', 'danger'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(<AtlProgress variant={variant} />);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    const { container } = render(<AtlProgress size={size} />);
    expect(container.firstChild).toHaveClass(`size-${size}`);
  });

  it('applies is-indeterminate class when indeterminate', () => {
    const { container } = render(<AtlProgress indeterminate />);
    expect(container.firstChild).toHaveClass('is-indeterminate');
  });

  covers('progress', 'indeterminate-omits-valuenow')('omits aria-valuenow when indeterminate', () => {
    const { container } = render(<AtlProgress indeterminate value={50} />);
    expect(container.firstChild).not.toHaveAttribute('aria-valuenow');
  });

  it('renders the fill element', () => {
    const { container } = render(<AtlProgress value={60} />);
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe('60%');
  });
});
