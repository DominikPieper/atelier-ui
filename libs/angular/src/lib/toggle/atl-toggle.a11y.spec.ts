/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the React copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlToggle } from './atl-toggle';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-toggle.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  TestBed.resetTestingModule();
  const r = await render(template, { imports: [AtlToggle] });
  const tree = a11yTree(r.container);
  r.fixture.destroy();
  return tree;
}

async function capture(): Promise<Record<string, unknown>> {
  return {
    off: await captureOne('<atl-toggle>Notifications</atl-toggle>'),
    on: await captureOne('<atl-toggle [checked]="true">Notifications</atl-toggle>'),
    disabled: await captureOne('<atl-toggle [disabled]="true">Notifications</atl-toggle>'),
  };
}

describe('AtlToggle — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
