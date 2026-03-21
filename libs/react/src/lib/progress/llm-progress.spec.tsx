import { render } from '@testing-library/react';
import { LlmProgress } from './llm-progress';

describe('LlmProgress', () => {
  it('renders with default props', () => {
    const { container } = render(<LlmProgress />);
    expect(container.firstChild).toHaveClass('llm-progress', 'variant-default', 'size-md');
  });

  it('has role="progressbar"', () => {
    const { container } = render(<LlmProgress value={50} />);
    expect(container.firstChild).toHaveAttribute('role', 'progressbar');
  });

  it('sets aria-valuenow to the clamped value', () => {
    const { container } = render(<LlmProgress value={75} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '75');
  });

  it('clamps value to max', () => {
    const { container } = render(<LlmProgress value={200} max={100} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value to 0 when negative', () => {
    const { container } = render(<LlmProgress value={-10} />);
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '0');
  });

  it.each(['default', 'success', 'warning', 'danger'] as const)(
    'applies variant-%s class',
    (variant) => {
      const { container } = render(<LlmProgress variant={variant} />);
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    const { container } = render(<LlmProgress size={size} />);
    expect(container.firstChild).toHaveClass(`size-${size}`);
  });

  it('applies is-indeterminate class when indeterminate', () => {
    const { container } = render(<LlmProgress indeterminate />);
    expect(container.firstChild).toHaveClass('is-indeterminate');
  });

  it('omits aria-valuenow when indeterminate', () => {
    const { container } = render(<LlmProgress indeterminate value={50} />);
    expect(container.firstChild).not.toHaveAttribute('aria-valuenow');
  });

  it('renders the fill element', () => {
    const { container } = render(<LlmProgress value={60} />);
    const fill = container.querySelector('.fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe('60%');
  });
});
