import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from './atl-menu';
import { covers } from '../../testing/behavior';

describe('AtlMenu', () => {
  it('renders with role="menu"', () => {
    render(
      <AtlMenu>
        <AtlMenuItem>Action</AtlMenuItem>
      </AtlMenu>
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  covers('menu', 'variant-class')('applies variant class', () => {
    const { container } = render(<AtlMenu variant="compact" />);
    expect(container.firstChild).toHaveClass('variant-compact');
  });

  it('defaults to variant-default', () => {
    const { container } = render(<AtlMenu />);
    expect(container.firstChild).toHaveClass('variant-default');
  });
});

describe('AtlMenuItem', () => {
  it('renders with role="menuitem"', () => {
    render(
      <AtlMenu>
        <AtlMenuItem>Copy</AtlMenuItem>
      </AtlMenu>
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls onTriggered when clicked', async () => {
    const user = userEvent.setup();
    const onTriggered = vi.fn();
    render(
      <AtlMenu>
        <AtlMenuItem onTriggered={onTriggered}>Copy</AtlMenuItem>
      </AtlMenu>
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onTriggered).toHaveBeenCalled();
  });

  covers('menu', 'disabled-item')('does not call onTriggered when disabled', async () => {
    const user = userEvent.setup();
    const onTriggered = vi.fn();
    render(
      <AtlMenu>
        <AtlMenuItem onTriggered={onTriggered} disabled>
          Copy
        </AtlMenuItem>
      </AtlMenu>
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('applies is-disabled class when disabled', () => {
    render(
      <AtlMenu>
        <AtlMenuItem disabled>Delete</AtlMenuItem>
      </AtlMenu>
    );
    expect(screen.getByRole('menuitem')).toHaveClass('is-disabled');
  });
});

describe('AtlMenuSeparator', () => {
  it('renders with role="separator"', () => {
    render(<AtlMenuSeparator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

describe('AtlMenuTrigger', () => {
  covers('menu', 'closed-initially')('does not show menu initially', () => {
    render(
      <AtlMenuTrigger
        menu={
          <AtlMenu>
            <AtlMenuItem>Action</AtlMenuItem>
          </AtlMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </AtlMenuTrigger>
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  covers('menu', 'open-on-trigger')('shows menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AtlMenuTrigger
        menu={
          <AtlMenu>
            <AtlMenuItem>Action</AtlMenuItem>
          </AtlMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </AtlMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(
      <AtlMenuTrigger
        menu={
          <AtlMenu>
            <AtlMenuItem>Action</AtlMenuItem>
          </AtlMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </AtlMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  covers('menu', 'close-on-item-click')('closes menu when a menu item is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AtlMenuTrigger
        menu={
          <AtlMenu>
            <AtlMenuItem>Copy</AtlMenuItem>
          </AtlMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </AtlMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
