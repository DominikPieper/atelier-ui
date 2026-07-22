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
import { AtlTabGroup, AtlTab } from './atl-tabs';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-tabs.${FW}.json`);

function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(
    <AtlTabGroup>
      <AtlTab label="Tab One">Content One</AtlTab>
      <AtlTab label="Tab Two">Content Two</AtlTab>
    </AtlTabGroup>
  );
  scenarios.default = a11yTree(r.container);
  r.unmount();
  r = render(
    <AtlTabGroup>
      <AtlTab label="Tab One">Content One</AtlTab>
      <AtlTab label="Tab Two" disabled>
        Content Two
      </AtlTab>
    </AtlTabGroup>
  );
  scenarios.withDisabled = a11yTree(r.container);
  r.unmount();
  return scenarios;
}

describe('AtlTabGroup — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', () => {
    const live = capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
