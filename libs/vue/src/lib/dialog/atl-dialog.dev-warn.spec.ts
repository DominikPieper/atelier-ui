import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import AtlDialog from './atl-dialog.vue';
import AtlDialogHeader from './atl-dialog-header.vue';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

describe('AtlDialog dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('AtlDialog'),
    );

  it('warns once when it opens with no header', async () => {
    const { rerender } = render(AtlDialog, {
      props: { open: true },
      slots: { default: 'Body' },
    });
    await nextTick();
    expect(warnings()).toHaveLength(1);

    await rerender({ open: false });
    await rerender({ open: true });
    await nextTick();
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent while closed', async () => {
    render(AtlDialog, { props: { open: false }, slots: { default: 'Body' } });
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a header', async () => {
    render(
      {
        components: { AtlDialog, AtlDialogHeader },
        template:
          '<AtlDialog :open="true"><AtlDialogHeader>Title</AtlDialogHeader></AtlDialog>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a bound aria-label', async () => {
    render(AtlDialog, {
      props: { open: true, ariaLabel: 'Settings' },
      slots: { default: 'Body' },
    });
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });
});
