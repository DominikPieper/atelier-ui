import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmMenuTrigger from './llm-menu-trigger.vue';
import LlmMenu from './llm-menu.vue';
import LlmMenuItem from './llm-menu-item.vue';
import LlmMenuSeparator from './llm-menu-separator.vue';
import { covers } from '../../testing/behavior';

const MenuFixture = {
  components: { LlmMenuTrigger, LlmMenu, LlmMenuItem, LlmMenuSeparator },
  template: `
    <LlmMenuTrigger>
      <template #trigger>
        <button type="button">Open Menu</button>
      </template>
      <template #menu>
        <LlmMenu>
          <LlmMenuItem @triggered="onCopy">Copy</LlmMenuItem>
          <LlmMenuItem @triggered="onPaste">Paste</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem :disabled="true">Delete</LlmMenuItem>
        </LlmMenu>
      </template>
    </LlmMenuTrigger>
  `,
  setup() {
    return {
      onCopy: vi.fn(),
      onPaste: vi.fn(),
    };
  },
};

describe('LlmMenu', () => {
  covers('menu', 'variant-class')('applies the variant class to the menu', () => {
    const { container } = render(LlmMenu, { props: { variant: 'compact' } });
    expect(container.querySelector('[role="menu"]')).toHaveClass('variant-compact');
  });
});

describe('LlmMenuTrigger', () => {
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

  covers('menu', 'close-on-item-click')('hides menu after clicking a menu item', async () => {
    const user = userEvent.setup();
    render(MenuFixture);
    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

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
    expect(container.querySelector('.llm-menu-separator')).toBeInTheDocument();
  });

  covers('menu', 'disabled-item')('disabled menu item cannot be triggered', async () => {
    const user = userEvent.setup();
    render(MenuFixture);
    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    const deleteBtn = screen.getByRole('menuitem', { name: 'Delete' });
    expect(deleteBtn).toBeDisabled();
  });
});
