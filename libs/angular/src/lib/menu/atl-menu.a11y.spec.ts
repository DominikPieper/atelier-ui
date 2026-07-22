/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Menu captures `document.body` instead of the render container: the CDK menu
 * renders into the overlay container appended to <body>, while React/Vue
 * render inline — the body-level accessibility tree is the comparable surface.
 */
import { render, screen } from '@testing-library/angular';
import { TestBed } from '@angular/core/testing';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from './atl-menu';
import { AtlButton } from '../button/atl-button';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-menu.${FW}.json`);

const TEMPLATE = `
  <atl-button [atlMenuTriggerFor]="menu">Open Menu</atl-button>
  <ng-template #menu>
    <atl-menu>
      <atl-menu-item>Copy</atl-menu-item>
      <atl-menu-item>Paste</atl-menu-item>
      <atl-menu-separator />
      <atl-menu-item [disabled]="true">Delete</atl-menu-item>
    </atl-menu>
  </ng-template>
`;
const IMPORTS = [AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton];

async function capture(): Promise<Record<string, unknown>> {
  const scenarios: Record<string, unknown> = {};

  TestBed.resetTestingModule();
  let r = await render(TEMPLATE, { imports: IMPORTS });
  scenarios.closed = a11yTree(document.body);
  r.fixture.destroy();

  TestBed.resetTestingModule();
  r = await render(TEMPLATE, { imports: IMPORTS });
  screen.getByText('Open Menu').click();
  r.fixture.detectChanges();
  scenarios.open = a11yTree(document.body);
  r.fixture.destroy();

  return scenarios;
}

describe('AtlMenu — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
