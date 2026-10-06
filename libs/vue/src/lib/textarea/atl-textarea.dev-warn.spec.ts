import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import AtlTextarea from './atl-textarea.vue';

describe('AtlTextarea dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('AtlTextarea'),
    );

  it('warns once when there is no label, aria-label or <label for>', async () => {
    const { rerender } = render(AtlTextarea, { props: { placeholder: 'a' } });
    await nextTick();
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('label');

    await rerender({ placeholder: 'b' });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with a label', async () => {
    render(AtlTextarea, { props: { label: 'Name' } });
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a dynamically bound aria-label', async () => {
    render(
      {
        components: { AtlTextarea },
        data: () => ({ text: 'Name' }),
        template: '<AtlTextarea :aria-label="text" />',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with an external <label for> pointing at the control id', async () => {
    render(
      {
        components: { AtlTextarea },
        template:
          '<div><label for="ext">Name</label><AtlTextarea id="ext" /></div>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent when wrapped in a <label>', async () => {
    render(
      {
        components: { AtlTextarea },
        template: '<label>Name <AtlTextarea /></label>',
      },
      {},
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });
});
