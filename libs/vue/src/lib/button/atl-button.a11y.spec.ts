/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the React copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlButton from './atl-button.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-button.${FW}.json`);

function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(AtlButton, { slots: { default: 'Click me' } });
  scenarios.default = a11yTree(r.container);
  r.unmount();
  r = render(AtlButton, { props: { disabled: true }, slots: { default: 'Click me' } });
  scenarios.disabled = a11yTree(r.container);
  r.unmount();
  r = render(AtlButton, { props: { loading: true }, slots: { default: 'Click me' } });
  scenarios.loading = a11yTree(r.container);
  r.unmount();
  return scenarios;
}

describe('AtlButton — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
