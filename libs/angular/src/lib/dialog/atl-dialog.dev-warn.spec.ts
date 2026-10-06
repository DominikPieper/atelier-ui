import { render } from '@testing-library/angular';
import { AtlDialog, AtlDialogContent, AtlDialogHeader } from './atl-dialog';

const IMPORTS = [AtlDialog, AtlDialogHeader, AtlDialogContent];

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

describe('AtlDialog dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const dialogWarnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('AtlDialog'),
    );

  it('warns once when it opens with no header and no aria-label', async () => {
    const { rerender } = await render(
      '<atl-dialog [open]="open"><atl-dialog-content>Body</atl-dialog-content></atl-dialog>',
      { imports: IMPORTS, componentProperties: { open: true } },
    );
    expect(dialogWarnings()).toHaveLength(1);
    expect(String(dialogWarnings()[0][0])).toContain('aria-label');

    // Closing and re-opening must not warn a second time.
    await rerender({ componentProperties: { open: false } });
    await rerender({ componentProperties: { open: true } });
    expect(dialogWarnings()).toHaveLength(1);
  });

  it('stays silent while closed', async () => {
    await render(
      '<atl-dialog [open]="false"><atl-dialog-content>Body</atl-dialog-content></atl-dialog>',
      { imports: IMPORTS },
    );
    expect(dialogWarnings()).toHaveLength(0);
  });

  it('stays silent with an atl-dialog-header', async () => {
    await render(
      '<atl-dialog [open]="true"><atl-dialog-header>Title</atl-dialog-header></atl-dialog>',
      { imports: IMPORTS },
    );
    expect(dialogWarnings()).toHaveLength(0);
  });

  it('stays silent with a bound aria-label', async () => {
    await render(
      '<atl-dialog [open]="true" [aria-label]="name"><atl-dialog-content>Body</atl-dialog-content></atl-dialog>',
      { imports: IMPORTS, componentProperties: { name: 'Settings' } },
    );
    expect(dialogWarnings()).toHaveLength(0);
  });
});
