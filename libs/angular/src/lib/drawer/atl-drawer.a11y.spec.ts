/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlDrawer, AtlDrawerHeader } from './atl-drawer';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-drawer.${FW}.json`);

// jsdom does not implement showModal/close natively; install a deterministic
// stand-in so the open state reaches the DOM (and the captured a11y tree).
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const TEMPLATE = `
  <atl-drawer [open]="true" position="right">
    <atl-drawer-header>Filters</atl-drawer-header>
  </atl-drawer>
`;
const IMPORTS = [AtlDrawer, AtlDrawerHeader];

async function capture(): Promise<Record<string, unknown>> {
  TestBed.resetTestingModule();
  const r = await render(TEMPLATE, { imports: IMPORTS });
  r.fixture.detectChanges();
  const tree = a11yTree(r.container);
  r.fixture.destroy();
  return { open: tree };
}

describe('AtlDrawer — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
