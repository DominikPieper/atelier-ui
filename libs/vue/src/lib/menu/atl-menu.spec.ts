import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlMenuTrigger from './atl-menu-trigger.vue';
import AtlMenu from './atl-menu.vue';
import AtlMenuItem from './atl-menu-item.vue';
import AtlMenuSeparator from './atl-menu-separator.vue';
import { covers } from '../../testing/behavior';

const MenuFixture = {
  components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
  template: `
    <AtlMenuTrigger>
      <template #trigger>
        <button type="button">Open Menu</button>
      </template>
      <template #menu>
        <AtlMenu>
          <AtlMenuItem @triggered="onCopy">Copy</AtlMenuItem>
          <AtlMenuItem @triggered="onPaste">Paste</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem :disabled="true">Delete</AtlMenuItem>
        </AtlMenu>
      </template>
    </AtlMenuTrigger>
  `,
  setup() {
    return {
      onCopy: vi.fn(),
      onPaste: vi.fn(),
    };
  },
};

describe('AtlMenu', () => {
  covers('menu', 'variant-class')(
    'applies the variant class to the menu',
    () => {
      const { container } = render(AtlMenu, { props: { variant: 'compact' } });
      expect(container.querySelector('[role="menu"]')).toHaveClass(
        'variant-compact',
      );
    },
  );
});

describe('AtlMenuTrigger', () => {
  covers('menu', 'closed-initially')('does not show menu initially', () => {
    render(MenuFixture);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  covers('menu', 'open-on-trigger')('shows menu on trigger click', async () => {
    const user = userEvent.setup();
    render(MenuFixture);
    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  covers('menu', 'close-on-item-click')(
    'hides menu after clicking a menu item',
    async () => {
      const user = userEvent.setup();
      render(MenuFixture);
      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    },
  );

  it('closes menu on Escape key', async () => {
    const user = userEvent.setup();
    render(MenuFixture);
    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();
    const { container } = render(MenuFixture);
    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    expect(container.querySelector('.atl-menu-separator')).toBeInTheDocument();
  });

  covers('menu', 'disabled-item')(
    'disabled menu item cannot be triggered',
    async () => {
      const user = userEvent.setup();
      render(MenuFixture);
      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      const deleteBtn = screen.getByRole('menuitem', { name: 'Delete' });
      expect(deleteBtn).toBeDisabled();
    },
  );
});

describe('AtlMenuTrigger — WAI-ARIA menu-button keyboard', () => {
  const Keyboard = {
    components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
    props: { onCopy: { type: Function, default: () => undefined } },
    template: `
      <AtlMenuTrigger>
        <template #trigger>
          <button type="button">Open Menu</button>
        </template>
        <template #menu>
          <AtlMenu>
            <AtlMenuItem @triggered="onCopy">Copy</AtlMenuItem>
            <AtlMenuItem :disabled="true">Cut</AtlMenuItem>
            <AtlMenuSeparator />
            <AtlMenuItem>Paste</AtlMenuItem>
            <AtlMenuItem>Archive</AtlMenuItem>
            <AtlMenuItem :disabled="true">Delete</AtlMenuItem>
          </AtlMenu>
        </template>
      </AtlMenuTrigger>
      <button type="button">After</button>
    `,
  };

  const item = (name: string) => screen.getByRole('menuitem', { name });
  const trigger = () => screen.getByRole('button', { name: 'Open Menu' });

  async function openWith(key: string) {
    const user = userEvent.setup();
    render(Keyboard);
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
      render(Keyboard, { props: { onCopy } });
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
