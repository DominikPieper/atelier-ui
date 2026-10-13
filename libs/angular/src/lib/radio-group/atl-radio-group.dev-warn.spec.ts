import { render } from '@testing-library/angular';
import { AtlRadio } from '../radio/atl-radio';
import { AtlRadioGroup } from './atl-radio-group';

const IMPORTS = [AtlRadioGroup, AtlRadio];

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

  const group = (attrs: string): string =>
    `<atl-radio-group ${attrs}><atl-radio radioValue="a">A</atl-radio></atl-radio-group>`;

  it('warns once when there is no aria-label or aria-labelledby', async () => {
    const { rerender } = await render(group('[disabled]="d"'), {
      imports: IMPORTS,
      componentProperties: { d: false },
    });
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('aria-label');

    await rerender({ componentProperties: { d: true } });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with aria-label', async () => {
    await render(group('aria-label="Plan"'), { imports: IMPORTS });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a bound aria-label', async () => {
    await render(group('[aria-label]="text"'), {
      imports: IMPORTS,
      componentProperties: { text: 'Plan' },
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with aria-labelledby', async () => {
    await render(
      `<span id="plan-caption">Plan</span>${group('aria-labelledby="plan-caption"')}`,
      { imports: IMPORTS },
    );
    expect(warnings()).toHaveLength(0);
  });
});
