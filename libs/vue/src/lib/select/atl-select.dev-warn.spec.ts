import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import AtlSelect from './atl-select.vue';

describe('AtlSelect dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('AtlSelect'),
    );

  it('warns once when there is no label, aria-label or <label for>', async () => {
    const { rerender } = render(AtlSelect, { props: { placeholder: 'a' } });
    await nextTick();
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('label');

    await rerender({ placeholder: 'b' });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with a label', async () => {
    render(AtlSelect, { props: { label: 'Name' } });
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a dynamically bound aria-label', async () => {
    render(
      {
        components: { AtlSelect },
        data: () => ({ text: 'Name' }),
        template: '<AtlSelect :aria-label="text" />',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent when wrapped in a <label>', async () => {
    render(
      {
        components: { AtlSelect },
        template: '<label>Name <AtlSelect /></label>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });
});
