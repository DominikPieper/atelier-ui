import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlButton } from './atl-button';

describe('AtlButton', () => {
  covers('button', 'default-render')('renders without error with default props', () => {
    render(<AtlButton>Click me</AtlButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'outline'] as const)(
    'applies variant-%s class',
    (variant) => {
      render(<AtlButton variant={variant}>Btn</AtlButton>);
      expect(screen.getByRole('button')).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    render(<AtlButton size={size}>Btn</AtlButton>);
    expect(screen.getByRole('button')).toHaveClass(`size-${size}`);
  });

  covers('button', 'disabled-state')('is disabled when disabled prop is true', () => {
    render(<AtlButton disabled>Btn</AtlButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    render(<AtlButton disabled>Btn</AtlButton>);
    expect(screen.getByRole('button')).toHaveClass('is-disabled');
  });

  covers('button', 'loading-spinner')('renders spinner when loading', () => {
    const { container } = render(<AtlButton loading>Btn</AtlButton>);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<AtlButton loading>Btn</AtlButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  covers('button', 'click-emits')('fires click event when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<AtlButton onClick={onClick}>Click me</AtlButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  covers('button', 'disabled-no-click')('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AtlButton disabled onClick={onClick}>
        Click me
      </AtlButton>
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
