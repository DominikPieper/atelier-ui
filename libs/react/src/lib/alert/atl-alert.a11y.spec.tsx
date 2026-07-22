/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/react';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlAlert } from './atl-alert';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-alert.${FW}.json`);

function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(<AtlAlert variant="info">Session expires soon</AtlAlert>);
  scenarios.info = a11yTree(r.container);
  r.unmount();
  r = render(<AtlAlert variant="danger">Session expires soon</AtlAlert>);
  scenarios.danger = a11yTree(r.container);
  r.unmount();
  r = render(
    <AtlAlert variant="info" dismissible>
      Session expires soon
    </AtlAlert>
  );
  scenarios.dismissible = a11yTree(r.container);
  r.unmount();
  return scenarios;
}

describe('AtlAlert — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
