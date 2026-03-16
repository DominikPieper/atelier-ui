import { render, screen } from '@testing-library/angular';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from './llm-menu';
import { LlmButton } from '../button/llm-button';

const MENU_IMPORTS = [LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton];

const MENU_TEMPLATE = `
  <llm-button [llmMenuTriggerFor]="menu">Open Menu</llm-button>
  <ng-template #menu>
    <llm-menu>
      <llm-menu-item>Copy</llm-menu-item>
      <llm-menu-item>Paste</llm-menu-item>
      <llm-menu-separator />
      <llm-menu-item [disabled]="true">Delete</llm-menu-item>
    </llm-menu>
  </ng-template>
`;

describe('LlmMenu', () => {
  it('renders the trigger button', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('applies default variant class', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    // Menu is not yet in the DOM until trigger is clicked
    screen.getByText('Open Menu').click();
    const menu = document.querySelector('llm-menu');
    expect(menu).toHaveClass('variant-default');
  });

  it('applies compact variant class', async () => {
    await render(
      `
        <llm-button [llmMenuTriggerFor]="menu">Open</llm-button>
        <ng-template #menu>
          <llm-menu variant="compact">
            <llm-menu-item>Item</llm-menu-item>
          </llm-menu>
        </ng-template>
      `,
      { imports: MENU_IMPORTS },
    );
    screen.getByText('Open').click();
    const menu = document.querySelector('llm-menu');
    expect(menu).toHaveClass('variant-compact');
  });

  it('opens menu on trigger click and renders items', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders separator with role="separator"', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const separator = document.querySelector('llm-menu-separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('applies is-disabled class on disabled item', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const deleteItem = screen.getByText('Delete').closest('llm-menu-item');
    expect(deleteItem).toHaveClass('is-disabled');
  });

  it('has role="menu" on the menu element', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const menu = document.querySelector('llm-menu');
    expect(menu).toHaveAttribute('role', 'menu');
  });

  it('menu items have role="menuitem"', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    expect(menuItems.length).toBeGreaterThanOrEqual(3);
  });
});
