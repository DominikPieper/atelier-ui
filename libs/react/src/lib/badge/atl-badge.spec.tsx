import { render, screen } from '@testing-library/react';
import { covers } from '../../testing/behavior';
import { AtlBadge } from './atl-badge';

describe('AtlBadge', () => {
  covers('badge', 'render-default')('renders without error', () => {
    render(<AtlBadge>Active</AtlBadge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each(['default', 'success', 'warning', 'danger', 'info'] as const)(
    'applies variant-%s class',
    (variant) => {
      render(<AtlBadge variant={variant}>Label</AtlBadge>);
      expect(screen.getByText('Label')).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md'] as const)('applies size-%s class', (size) => {
    render(<AtlBadge size={size}>Label</AtlBadge>);
    expect(screen.getByText('Label')).toHaveClass(`size-${size}`);
  });
});
