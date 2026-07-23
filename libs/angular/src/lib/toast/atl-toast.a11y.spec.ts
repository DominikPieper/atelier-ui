/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Toast captures `document.body`: the notification is shown imperatively via
 * the service into the container, and the body-level tree keeps the snapshot
 * comparable with the React/Vue provider adapters. `duration: 0` disables the
 * auto-dismiss timer so no state escapes the render.
 */
import { render } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlToastContainer, AtlToastService } from './atl-toast';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-toast.${FW}.json`);

async function capture(): Promise<Record<string, unknown>> {
  TestBed.resetTestingModule();
  const r = await render('<atl-toast-container />', { imports: [AtlToastContainer] });
  const service = TestBed.inject(AtlToastService);
  service.show('Saved successfully', { variant: 'success', dismissible: true, duration: 0 });
  r.fixture.detectChanges();
  const tree = a11yTree(document.body);
  r.fixture.destroy();
  return { visible: tree };
}

describe('AtlToast — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
