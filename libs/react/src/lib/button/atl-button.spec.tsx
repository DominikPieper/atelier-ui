import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlButton } from './atl-button';

describe('AtlButton', () => {
  covers('button', 'default-render')(
    'renders without error with default props',
    () => {
      render(<AtlButton>Click me</AtlButton>);
      expect(
        screen.getByRole('button', { name: 'Click me' }),
      ).toBeInTheDocument();
    },
  );

  it.each(['primary', 'secondary', 'outline'] as const)(
    'applies variant-%s class',
    (variant) => {
      render(<AtlButton variant={variant}>Btn</AtlButton>);
      expect(screen.getByRole('button')).toHaveClass(`variant-${variant}`);
    },
  );

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    render(<AtlButton size={size}>Btn</AtlButton>);
    expect(screen.getByRole('button')).toHaveClass(`size-${size}`);
  });

  covers('button', 'disabled-state')(
    'is disabled when disabled prop is true',
    () => {
      render(<AtlButton disabled>Btn</AtlButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    },
  );

  it('applies is-disabled class when disabled', () => {
    render(<AtlButton disabled>Btn</AtlButton>);
    expect(screen.getByRole('button')).toHaveClass('is-disabled');
  });

  covers('button', 'loading-spinner')('renders spinner when loading', () => {
    const { container } = render(<AtlButton loading>Btn</AtlButton>);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  // ADR-0171: loading is aria-disabled + aria-busy, never native `disabled`,
  // so a focused button that starts loading keeps focus (WCAG 2.4.3).
  covers('button', 'loading-busy')(
    'is aria-busy and aria-disabled but not natively disabled when loading',
    () => {
      render(<AtlButton loading>Btn</AtlButton>);
      const btn = screen.getByRole('button');
      expect(btn).toBeEnabled();
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toHaveAttribute('aria-busy', 'true');
    },
  );

  it('carries no aria-busy when not loading', () => {
    render(<AtlButton disabled>Btn</AtlButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('keeps focus when a focused button starts loading', () => {
    const { rerender } = render(<AtlButton>Save</AtlButton>);
    const btn = screen.getByRole('button', { name: 'Save' });
    btn.focus();
    expect(btn).toHaveFocus();
    rerender(<AtlButton loading>Save</AtlButton>);
    expect(btn).toHaveFocus();
  });

  it('stays reachable with Tab while loading', async () => {
    const user = userEvent.setup();
    render(<AtlButton loading>Save</AtlButton>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  covers('button', 'loading-no-click')(
    'ignores clicks and keyboard activation while loading',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <AtlButton loading onClick={onClick}>
          Save
        </AtlButton>,
      );
      await user.click(screen.getByRole('button'));
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('does not submit the enclosing form while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <AtlButton type="submit" loading>
          Send
        </AtlButton>
      </form>,
    );
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  covers('button', 'click-emits')(
    'fires click event when not disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<AtlButton onClick={onClick}>Click me</AtlButton>);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
    },
  );

  covers('button', 'disabled-no-click')(
    'does not fire click when disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <AtlButton disabled onClick={onClick}>
          Click me
        </AtlButton>,
      );
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    },
  );
});
