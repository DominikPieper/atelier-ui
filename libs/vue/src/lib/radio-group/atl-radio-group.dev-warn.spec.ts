import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import AtlRadio from '../radio/atl-radio.vue';
import AtlRadioGroup from './atl-radio-group.vue';

describe('AtlRadioGroup dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c: unknown[]) =>
      String(c[0]).includes('AtlRadioGroup'),
    );

  const mount = (attrs: string, extra = '') =>
    render({
      components: { AtlRadioGroup, AtlRadio },
      data: () => ({ text: 'Plan' }),
      template: `${extra}<AtlRadioGroup ${attrs}><AtlRadio radioValue="a">A</AtlRadio></AtlRadioGroup>`,
    });

  it('warns once when there is no aria-label or aria-labelledby', async () => {
    const { rerender } = render(AtlRadioGroup, { props: { name: 'a' } });
    await nextTick();
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('aria-label');

    await rerender({ name: 'b' });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with aria-label', async () => {
    mount('aria-label="Plan"');
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a dynamically bound aria-label', async () => {
    mount(':aria-label="text"');
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with aria-labelledby', async () => {
    mount(
      'aria-labelledby="plan-caption"',
      '<span id="plan-caption">Plan</span>',
    );
    await nextTick();
    expect(warnings()).toHaveLength(0);
  });
});
