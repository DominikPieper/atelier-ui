/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Tooltip captures `document.body` so the snapshot stays comparable with
 * Angular, whose CDK overlay renders the tooltip into a container appended to
 * <body>; Vue renders it inline.
 */
import { render, screen, waitFor } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlTooltip from './atl-tooltip.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-tooltip.${FW}.json`);

const PROPS = { atlTooltip: 'Save your changes', atlTooltipShowDelay: 0 };
const SLOTS = { default: '<button>Save</button>' };

async function capture() {
  const scenarios: Record<string, unknown> = {};

  let r = render(AtlTooltip, { props: PROPS, slots: SLOTS });
  scenarios.closed = a11yTree(document.body);
  r.unmount();

  const user = userEvent.setup();
  r = render(AtlTooltip, { props: PROPS, slots: SLOTS });
  await user.hover(screen.getByText('Save'));
  await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
  scenarios.open = a11yTree(document.body);
  r.unmount();

  return scenarios;
}

describe('AtlTooltip — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
