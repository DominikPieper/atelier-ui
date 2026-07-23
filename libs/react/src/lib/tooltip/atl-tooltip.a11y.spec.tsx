/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Tooltip captures `document.body` so the snapshot stays comparable with
 * Angular, whose CDK overlay renders the tooltip into a container appended to
 * <body>; React renders it inline.
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlTooltip } from './atl-tooltip';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-tooltip.${FW}.json`);

function fixture() {
  return (
    <AtlTooltip atlTooltip="Save your changes" atlTooltipShowDelay={0}>
      <button>Save</button>
    </AtlTooltip>
  );
}

async function capture() {
  const scenarios: Record<string, unknown> = {};

  let r = render(fixture());
  scenarios.closed = a11yTree(document.body);
  r.unmount();

  const user = userEvent.setup();
  r = render(fixture());
  await user.hover(screen.getByText('Save'));
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
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
