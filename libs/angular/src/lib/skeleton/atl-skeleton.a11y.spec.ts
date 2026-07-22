/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the React copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Skeletons are aria-hidden by spec — an empty tree is the EXPECTED snapshot,
 * proving all three adapters hide the placeholder from assistive tech.
 */
import { render } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlSkeleton } from './atl-skeleton';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-skeleton.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  TestBed.resetTestingModule();
  const r = await render(template, { imports: [AtlSkeleton] });
  const tree = a11yTree(r.container);
  r.fixture.destroy();
  return tree;
}

async function capture(): Promise<Record<string, unknown>> {
  return {
    text: await captureOne('<atl-skeleton variant="text"></atl-skeleton>'),
    circular: await captureOne('<atl-skeleton variant="circular"></atl-skeleton>'),
  };
}

describe('AtlSkeleton — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
