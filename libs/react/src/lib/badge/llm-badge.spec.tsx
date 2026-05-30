import { render, screen } from '@testing-library/react';
import { covers } from '../../testing/behavior';
import { LlmBadge } from './llm-badge';

describe('LlmBadge', () => {
  covers('badge', 'render-default')('renders without error', () => {
    render(<LlmBadge>Active</LlmBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each(['default', 'success', 'warning', 'danger', 'info'] as const)(
    'applies variant-%s class',
    (variant) => {
      render(<LlmBadge variant={variant}>Label</LlmBadge>);
      expect(screen.getByText('Label')).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md'] as const)('applies size-%s class', (size) => {
    render(<LlmBadge size={size}>Label</LlmBadge>);
    expect(screen.getByText('Label')).toHaveClass(`size-${size}`);
  });
});
