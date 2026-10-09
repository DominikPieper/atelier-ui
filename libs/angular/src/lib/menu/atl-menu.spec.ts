import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
} from './atl-menu';
import { AtlButton } from '../button/atl-button';
import { covers } from '../../testing/behavior';

const MENU_IMPORTS = [
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
  AtlButton,
];

const MENU_TEMPLATE = `
  <button atl-button [atlMenuTriggerFor]="menu">Open Menu</button>
  <ng-template #menu>
    <atl-menu>
      <atl-menu-item>Copy</atl-menu-item>
      <atl-menu-item>Paste</atl-menu-item>
      <atl-menu-separator />
      <atl-menu-item [disabled]="true">Delete</atl-menu-item>
    </atl-menu>
  </ng-template>
`;

describe('AtlMenu', () => {
  it('renders the trigger button', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('applies default variant class', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    // Menu is not yet in the DOM until trigger is clicked
    screen.getByText('Open Menu').click();
    const menu = document.querySelector('atl-menu');
    expect(menu).toHaveClass('variant-default');
  });

  it('keeps the static atl-menu root class alongside the variant class', async () => {
    // The shared stylesheet (libs/styles) is scoped by `.atl-menu`; the host also
    // binds `[class]` for the variant, and the two must merge.
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const menu = document.querySelector('atl-menu');
    expect(menu).toHaveClass('atl-menu', 'variant-default');
    expect(document.querySelector('atl-menu-item')).toHaveClass(
      'atl-menu-item',
    );
    expect(document.querySelector('atl-menu-separator')).toHaveClass(
      'atl-menu-separator',
    );
  });

  covers('menu', 'variant-class')('applies compact variant class', async () => {
    await render(
      `
        <button atl-button [atlMenuTriggerFor]="menu">Open</button>
        <ng-template #menu>
          <atl-menu variant="compact">
            <atl-menu-item>Item</atl-menu-item>
          </atl-menu>
        </ng-template>
      `,
      { imports: MENU_IMPORTS },
    );
    screen.getByText('Open').click();
    const menu = document.querySelector('atl-menu');
    expect(menu).toHaveClass('variant-compact');
  });

  covers('menu', 'closed-initially')(
    'does not render the menu until the trigger is clicked',
    async () => {
      await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
      expect(document.querySelector('atl-menu')).toBeNull();
    },
  );

  covers('menu', 'open-on-trigger')(
    'opens menu on trigger click and renders items',
    async () => {
      await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
      screen.getByText('Open Menu').click();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    },
  );

  // NOTE: close-on-escape is provided by @angular/cdk/menu at runtime but is
  // not exercised here — the CDK overlay's Escape handling does not fire under
  // jsdom (verified: focus lands correctly yet the menu stays open). React/Vue
  // test it via their own handlers; for Angular it is covered by CDK + e2e, so
  // `close-on-escape` is intentionally absent from the behavior contract.

  covers('menu', 'close-on-item-click')(
    'closes the menu when a menu item is clicked',
    async () => {
      const user = userEvent.setup();
      await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
      await user.click(screen.getByText('Open Menu'));
      expect(document.querySelector('atl-menu')).not.toBeNull();
      await user.click(screen.getByText('Copy'));
      expect(document.querySelector('atl-menu')).toBeNull();
    },
  );

  it('renders separator with role="separator"', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const separator = document.querySelector('atl-menu-separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });

  covers('menu', 'disabled-item')(
    'applies is-disabled class on disabled item',
    async () => {
      await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
      screen.getByText('Open Menu').click();
      const deleteItem = screen.getByText('Delete').closest('atl-menu-item');
      expect(deleteItem).toHaveClass('is-disabled');
    },
  );

  it('has role="menu" on the menu element', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const menu = document.querySelector('atl-menu');
    expect(menu).toHaveAttribute('role', 'menu');
  });

  it('menu items have role="menuitem"', async () => {
    await render(MENU_TEMPLATE, { imports: MENU_IMPORTS });
    screen.getByText('Open Menu').click();
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    expect(menuItems.length).toBeGreaterThanOrEqual(3);
  });
});
