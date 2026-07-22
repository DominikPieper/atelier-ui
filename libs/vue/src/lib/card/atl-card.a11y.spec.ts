/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlCard from './atl-card.vue';
import AtlCardContent from './atl-card-content.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-card.${FW}.json`);

function captureOne(template: string): unknown {
  const r = render({ components: { AtlCard, AtlCardContent }, template });
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

function capture() {
  return {
    plain: captureOne('<AtlCard><AtlCardContent>Card body</AtlCardContent></AtlCard>'),
    region: captureOne(
      '<AtlCard role="region" aria-label="Settings"><AtlCardContent>Card body</AtlCardContent></AtlCard>'
    ),
  };
}

describe('AtlCard — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
