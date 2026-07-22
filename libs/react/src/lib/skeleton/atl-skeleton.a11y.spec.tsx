/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Skeletons are aria-hidden by spec — an empty tree is the EXPECTED snapshot,
 * proving all three adapters hide the placeholder from assistive tech.
 */
import { render } from '@testing-library/react';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlSkeleton } from './atl-skeleton';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-skeleton.${FW}.json`);

function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(<AtlSkeleton variant="text" />);
  scenarios.text = a11yTree(r.container);
  r.unmount();
  r = render(<AtlSkeleton variant="circular" />);
  scenarios.circular = a11yTree(r.container);
  r.unmount();
  return scenarios;
}

describe('AtlSkeleton — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
