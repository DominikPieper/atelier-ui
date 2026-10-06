import { render } from '@testing-library/angular';
import { AtlSelect } from './atl-select';
import { AtlOption } from './atl-option';

const IMPORTS = [AtlSelect, AtlOption];

describe('AtlSelect dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c) => String(c[0]).includes('AtlSelect'));

  it('warns once when there is no label, aria-label or <label for>', async () => {
    const { rerender } = await render('<atl-select [placeholder]="p" />', {
      imports: IMPORTS,
      componentProperties: { p: 'a' },
    });
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('[label]');

    await rerender({ componentProperties: { p: 'b' } });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with a bound label', async () => {
    await render('<atl-select [label]="text" />', {
      imports: IMPORTS,
      componentProperties: { text: 'Name' },
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a bound aria-label', async () => {
    await render('<atl-select [aria-label]="text" />', {
      imports: IMPORTS,
      componentProperties: { text: 'Name' },
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent when wrapped in a <label>', async () => {
    await render('<label>Name <atl-select /></label>', { imports: IMPORTS });
    expect(warnings()).toHaveLength(0);
  });
});
