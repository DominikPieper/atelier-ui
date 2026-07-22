/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Menu captures `document.body` instead of the render container so the
 * snapshot stays comparable with Angular, whose CDK menu renders into the
 * overlay container appended to <body>.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from './atl-menu';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-menu.${FW}.json`);

function fixture() {
  return (
    <AtlMenuTrigger
      menu={
        <AtlMenu>
          <AtlMenuItem>Copy</AtlMenuItem>
          <AtlMenuItem>Paste</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem disabled>Delete</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <button type="button" ref={ref as never} onClick={onClick}>
          Open Menu
        </button>
      )}
    </AtlMenuTrigger>
  );
}

async function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(fixture());
  scenarios.closed = a11yTree(document.body);
  r.unmount();

  const user = userEvent.setup();
  r = render(fixture());
  await user.click(screen.getByText('Open Menu'));
  scenarios.open = a11yTree(document.body);
  r.unmount();

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
