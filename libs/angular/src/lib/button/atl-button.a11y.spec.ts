/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the React copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Angular's `button[atl-button]` is a native `<button>` like the React and Vue
 * renders, so the three snapshots are expected to match.
 */
import { render } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlButton } from './atl-button';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-button.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  // Each render configures TestBed; reset between renders so three scenarios can
  // run in one test (TestBed throws if reconfigured while already instantiated).
  TestBed.resetTestingModule();
  const r = await render(template, { imports: [AtlButton] });
  const tree = a11yTree(r.container);
  r.fixture.destroy();
  return tree;
}

async function capture(): Promise<Record<string, unknown>> {
  return {
    default: await captureOne('<button atl-button>Click me</button>'),
    disabled: await captureOne(
      '<button atl-button [disabled]="true">Click me</button>',
    ),
    loading: await captureOne(
      '<button atl-button [loading]="true">Click me</button>',
    ),
  };
}

describe('AtlButton — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env['UPDATE_A11Y']) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
