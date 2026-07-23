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
import { AtlChat, AtlChatMessages, AtlChatMessage } from './atl-chat';

const FW = 'angular';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-chat.${FW}.json`);

const TEMPLATE = `
  <atl-chat variant="inline" [open]="true">
    <atl-chat-messages>
      <atl-chat-message role="user">Hello</atl-chat-message>
      <atl-chat-message role="assistant">Hi, how can I help?</atl-chat-message>
    </atl-chat-messages>
  </atl-chat>
`;
const IMPORTS = [AtlChat, AtlChatMessages, AtlChatMessage];

async function capture(): Promise<Record<string, unknown>> {
  TestBed.resetTestingModule();
  const r = await render(TEMPLATE, { imports: IMPORTS });
  const tree = a11yTree(r.container);
  r.fixture.destroy();
  return { inline: tree };
}

describe('AtlChat — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
