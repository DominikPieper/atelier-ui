import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import AtlInput from './atl-input.vue';

describe('AtlInput dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) => String(c[0]).includes('AtlInput'));

  it('warns once when there is no label, aria-label or <label for>', async () => {
    const { rerender } = render(AtlInput, { props: { placeholder: 'a' } });
    await nextTick();
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('label');

    await rerender({ placeholder: 'b' });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with a label', async () => {
    render(AtlInput, { props: { label: 'Name' } });
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a dynamically bound aria-label', async () => {
    render(
      {
        components: { AtlInput },
        data: () => ({ text: 'Name' }),
        template: '<AtlInput :aria-label="text" />',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with an external <label for> pointing at the control id', async () => {
    render(
      {
        components: { AtlInput },
        template:
          '<div><label for="ext">Name</label><AtlInput id="ext" /></div>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent when wrapped in a <label>', async () => {
    render(
      {
        components: { AtlInput },
        template: '<label>Name <AtlInput /></label>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });
});
