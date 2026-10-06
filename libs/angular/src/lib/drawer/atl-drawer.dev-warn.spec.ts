import { render } from '@testing-library/angular';
import { AtlDrawer, AtlDrawerContent, AtlDrawerHeader } from './atl-drawer';

const IMPORTS = [AtlDrawer, AtlDrawerHeader, AtlDrawerContent];

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
});

describe('AtlDrawer dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const drawerWarnings = (): unknown[][] =>
    warn.mock.calls.filter((c) => String(c[0]).includes('AtlDrawer'));

  it('warns once when it opens with no header', async () => {
    const { rerender } = await render(
      '<atl-drawer [open]="open"><atl-drawer-content>Body</atl-drawer-content></atl-drawer>',
      { imports: IMPORTS, componentProperties: { open: true } },
    );
    expect(drawerWarnings()).toHaveLength(1);
    expect(String(drawerWarnings()[0][0])).toContain('atl-drawer-header');

    await rerender({ componentProperties: { open: false } });
    await rerender({ componentProperties: { open: true } });
    expect(drawerWarnings()).toHaveLength(1);
  });

  it('stays silent while closed', async () => {
    await render(
      '<atl-drawer [open]="false"><atl-drawer-content>Body</atl-drawer-content></atl-drawer>',
      { imports: IMPORTS },
    );
    expect(drawerWarnings()).toHaveLength(0);
  });

  it('stays silent with an atl-drawer-header', async () => {
    await render(
      '<atl-drawer [open]="true"><atl-drawer-header>Title</atl-drawer-header></atl-drawer>',
      { imports: IMPORTS },
    );
    expect(drawerWarnings()).toHaveLength(0);
  });

  it('stays silent with a header rendered conditionally after first render', async () => {
    await render(
      '@if (show) { <atl-drawer [open]="true"><atl-drawer-header>Title</atl-drawer-header></atl-drawer> }',
      { imports: IMPORTS, componentProperties: { show: true } },
    );
    expect(drawerWarnings()).toHaveLength(0);
  });
});
