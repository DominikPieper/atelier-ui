/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlChat from './atl-chat.vue';
import AtlChatMessages from './atl-chat-messages.vue';
import AtlChatMessage from './atl-chat-message.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-chat.${FW}.json`);

const ChatFixture = {
  components: { AtlChat, AtlChatMessages, AtlChatMessage },
  template: `
    <AtlChat variant="inline" :open="true">
      <AtlChatMessages>
        <AtlChatMessage role="user">Hello</AtlChatMessage>
        <AtlChatMessage role="assistant">Hi, how can I help?</AtlChatMessage>
      </AtlChatMessages>
    </AtlChat>
  `,
};

async function capture() {
  const scenarios: Record<string, unknown> = {};
  const r = render(ChatFixture);
  await nextTick();
  scenarios.inline = a11yTree(r.container);
  r.unmount();
  return scenarios;
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
