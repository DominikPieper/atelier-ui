import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
} from './atl-menu';
import { covers } from '../../testing/behavior';

describe('AtlMenu', () => {
  it('renders with role="menu"', () => {
    render(
      <AtlMenu>
        <AtlMenuItem>Action</AtlMenuItem>
      </AtlMenu>,
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
      </AtlMenu>,
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls onTriggered when clicked', async () => {
    const user = userEvent.setup();
    const onTriggered = vi.fn();
    render(
      <AtlMenu>
        <AtlMenuItem onTriggered={onTriggered}>Copy</AtlMenuItem>
      </AtlMenu>,
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onTriggered).toHaveBeenCalled();
  });

  covers('menu', 'disabled-item')(
    'does not call onTriggered when disabled',
    async () => {
      const user = userEvent.setup();
      const onTriggered = vi.fn();
      render(
        <AtlMenu>
          <AtlMenuItem onTriggered={onTriggered} disabled>
            Copy
          </AtlMenuItem>
        </AtlMenu>,
      );
      await user.click(screen.getByRole('menuitem'));
      expect(onTriggered).not.toHaveBeenCalled();
    },
  );

  it('applies is-disabled class when disabled', () => {
    render(
      <AtlMenu>
        <AtlMenuItem disabled>Delete</AtlMenuItem>
      </AtlMenu>,
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
          <button
            ref={ref as React.RefObject<HTMLButtonElement>}
            onClick={onClick}
          >
            Open
          </button>
        )}
      </AtlMenuTrigger>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  covers('menu', 'open-on-trigger')(
    'shows menu when trigger is clicked',
    async () => {
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
            <button
              ref={ref as React.RefObject<HTMLButtonElement>}
              onClick={onClick}
            >
              Open
            </button>
          )}
        </AtlMenuTrigger>,
      );
      await user.click(screen.getByText('Open'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    },
  );

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
          <button
            ref={ref as React.RefObject<HTMLButtonElement>}
            onClick={onClick}
          >
            Open
          </button>
        )}
      </AtlMenuTrigger>,
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  covers('menu', 'close-on-item-click')(
    'closes menu when a menu item is clicked',
    async () => {
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
            <button
              ref={ref as React.RefObject<HTMLButtonElement>}
              onClick={onClick}
            >
              Open
            </button>
          )}
        </AtlMenuTrigger>,
      );
      await user.click(screen.getByText('Open'));
      await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    },
  );
});

describe('AtlMenuTrigger — WAI-ARIA menu-button keyboard', () => {
  function Keyboard({ onCopy }: { onCopy?: () => void }) {
    return (
      <>
        <AtlMenuTrigger
          menu={
            <AtlMenu>
              <AtlMenuItem onTriggered={onCopy}>Copy</AtlMenuItem>
              <AtlMenuItem disabled>Cut</AtlMenuItem>
              <AtlMenuSeparator />
              <AtlMenuItem>Paste</AtlMenuItem>
              <AtlMenuItem>Archive</AtlMenuItem>
              <AtlMenuItem disabled>Delete</AtlMenuItem>
            </AtlMenu>
          }
        >
          {({ onClick, ref }) => (
            <button type="button" ref={ref as never} onClick={onClick}>
              Open Menu
            </button>
          )}
        </AtlMenuTrigger>
        <button type="button">After</button>
      </>
    );
  }

  const item = (name: string) => screen.getByRole('menuitem', { name });
  const trigger = () => screen.getByRole('button', { name: 'Open Menu' });

  async function openWith(key: string) {
    const user = userEvent.setup();
    render(<Keyboard />);
    trigger().focus();
    await user.keyboard(key);
    return user;
  }

  it.each(['{Enter}', '{ }', '{ArrowDown}'])(
    'trigger: %s opens the menu and focuses the first enabled item',
    async (key) => {
      await openWith(key);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(item('Copy')).toHaveFocus();
    },
  );

  it('trigger: ArrowUp opens the menu and focuses the last enabled item', async () => {
    await openWith('{ArrowUp}');
    expect(item('Archive')).toHaveFocus();
  });

  it('ArrowDown moves down, skips disabled items and wraps', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(item('Paste')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Archive')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(item('Copy')).toHaveFocus();
  });

  it('ArrowUp moves up, skips disabled items and wraps', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    expect(item('Archive')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(item('Paste')).toHaveFocus();
  });

  it('Home and End jump to the first and last enabled item', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{End}');
    expect(item('Archive')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(item('Copy')).toHaveFocus();
  });

  it('roving tabindex: only the focused item is tabbable', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(item('Paste')).toHaveAttribute('tabindex', '0');
    expect(item('Copy')).toHaveAttribute('tabindex', '-1');
    expect(item('Archive')).toHaveAttribute('tabindex', '-1');
  });

  it('Escape closes the menu and returns focus to the trigger', async () => {
    const user = await openWith('{ArrowDown}');
    item('Paste').focus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('Tab closes the menu and moves focus on past the trigger', async () => {
    const user = await openWith('{ArrowDown}');
    item('Paste').focus();
    await user.tab();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it.each(['{Enter}', '{ }'])(
    '%s on an item activates it, closes the menu and returns focus',
    async (key) => {
      const user = userEvent.setup();
      const onCopy = vi.fn();
      render(<Keyboard onCopy={onCopy} />);
      trigger().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard(key);
      expect(onCopy).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    },
  );

  it('type-ahead focuses the next item starting with the typed character', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('a');
    expect(item('Archive')).toHaveFocus();
  });

  it('type-ahead buffers characters into a prefix', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('pa');
    expect(item('Paste')).toHaveFocus();
  });

  it('type-ahead ignores disabled items', async () => {
    const user = await openWith('{ArrowDown}');
    await user.keyboard('d');
    expect(item('Copy')).toHaveFocus();
  });
});
