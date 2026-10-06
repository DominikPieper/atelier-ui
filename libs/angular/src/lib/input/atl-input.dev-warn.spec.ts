import { render } from '@testing-library/angular';
import { AtlInput } from './atl-input';

const IMPORTS = [AtlInput];

describe('AtlInput dev-mode accessible-name warning', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warn.mockRestore());

  const warnings = (): unknown[][] =>
    warn.mock.calls.filter((c) => String(c[0]).includes('AtlInput'));

  it('warns once when there is no label, aria-label or <label for>', async () => {
    const { rerender } = await render('<atl-input [placeholder]="p" />', {
      imports: IMPORTS,
      componentProperties: { p: 'a' },
    });
    expect(warnings()).toHaveLength(1);
    expect(String(warnings()[0][0])).toContain('[label]');

    await rerender({ componentProperties: { p: 'b' } });
    expect(warnings()).toHaveLength(1);
  });

  it('stays silent with a bound label', async () => {
    await render('<atl-input [label]="text" />', {
      imports: IMPORTS,
      componentProperties: { text: 'Name' },
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with a bound aria-label', async () => {
    await render('<atl-input [aria-label]="text" />', {
      imports: IMPORTS,
      componentProperties: { text: 'Name' },
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent with an external <label for> pointing at the control id', async () => {
    await render('<label for="ext">Name</label><atl-input id="ext" />', {
      imports: IMPORTS,
    });
    expect(warnings()).toHaveLength(0);
  });

  it('stays silent when wrapped in a <label>', async () => {
    await render('<label>Name <atl-input /></label>', { imports: IMPORTS });
    expect(warnings()).toHaveLength(0);
  });
});
