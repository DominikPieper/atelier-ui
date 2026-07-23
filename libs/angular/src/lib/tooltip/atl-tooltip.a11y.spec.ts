/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Angular adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Tooltip captures `document.body` instead of the render container: the CDK
 * overlay renders the tooltip into a container appended to <body>, while
 * React/Vue render it inline — the body-level accessibility tree is the
 * comparable surface across the three adapters.
 */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlTooltip } from './atl-tooltip';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-tooltip.${FW}.json`);

const TEMPLATE = `<button atlTooltip="Save your changes" [atlTooltipShowDelay]="0">Save</button>`;
const IMPORTS = [AtlTooltip, OverlayModule];

afterEach(() => {
  // CDK leaves the overlay container attached to <body> between renders.
  document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
});

async function capture(): Promise<Record<string, unknown>> {
  vi.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const scenarios: Record<string, unknown> = {};

  TestBed.resetTestingModule();
  let r = await render(TEMPLATE, { imports: IMPORTS });
  scenarios.closed = a11yTree(document.body);
  r.fixture.destroy();
  document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());

  TestBed.resetTestingModule();
  r = await render(TEMPLATE, { imports: IMPORTS });
  await user.hover(screen.getByText('Save'));
  vi.advanceTimersByTime(1);
  scenarios.open = a11yTree(document.body);
  r.fixture.destroy();

  vi.useRealTimers();
  return scenarios;
}

describe('AtlTooltip — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
