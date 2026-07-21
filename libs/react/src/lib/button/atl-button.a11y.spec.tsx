/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 *
 * Renders AtlButton's canonical scenarios in jsdom and captures the normalized
 * accessibility tree. Run mode is controlled by UPDATE_A11Y:
 *   - UPDATE_A11Y=1  → (re)write tools/parity/a11y/atl-button.react.json (the `gen:a11y` step)
 *   - default        → assert the live render still matches the committed snapshot (per-fw drift guard)
 * The committed per-framework snapshots are diffed against each other by
 * `npm run check:a11y-parity` — that is what enforces the three adapters expose the
 * same accessibility surface.
 */
import { render } from '@testing-library/react';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlButton } from './atl-button';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-button.${FW}.json`);

function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(<AtlButton>Click me</AtlButton>);
  scenarios.default = a11yTree(r.container);
  r.unmount();
  r = render(<AtlButton disabled>Click me</AtlButton>);
  scenarios.disabled = a11yTree(r.container);
  r.unmount();
  r = render(<AtlButton loading>Click me</AtlButton>);
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
