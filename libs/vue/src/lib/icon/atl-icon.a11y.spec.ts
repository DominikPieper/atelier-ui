/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * A decorative icon (no label) is aria-hidden by spec — its empty tree is the
 * EXPECTED snapshot, proving all three adapters hide it from assistive tech.
 */
import { render } from '@testing-library/vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlIcon from './atl-icon.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-icon.${FW}.json`);

function captureOne(props: Record<string, unknown>): unknown {
  const r = render(AtlIcon, { props });
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

function capture() {
  return {
    decorative: captureOne({ name: 'info' }),
    labeled: captureOne({ name: 'warning', label: 'Warning' }),
  };
}

describe('AtlIcon — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
