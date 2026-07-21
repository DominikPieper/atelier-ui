/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the React copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Angular renders an `<atl-button role="button">` host (not a native button), so
 * this is the adapter the normalizer's role+aria handling most needs to prove out.
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
    default: await captureOne('<atl-button>Click me</atl-button>'),
    disabled: await captureOne('<atl-button [disabled]="true">Click me</atl-button>'),
    loading: await captureOne('<atl-button [loading]="true">Click me</atl-button>'),
  };
}

describe('AtlButton — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
