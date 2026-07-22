/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Menu captures `document.body` instead of the render container so the
 * snapshot stays comparable with Angular, whose CDK menu renders into the
 * overlay container appended to <body>.
 */
import { render, screen, fireEvent } from '@testing-library/vue';
import { nextTick } from 'vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlMenuTrigger from './atl-menu-trigger.vue';
import AtlMenu from './atl-menu.vue';
import AtlMenuItem from './atl-menu-item.vue';
import AtlMenuSeparator from './atl-menu-separator.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-menu.${FW}.json`);

const Fixture = {
  components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
  template: `
    <AtlMenuTrigger>
      <template #trigger>
        <button type="button">Open Menu</button>
      </template>
      <template #menu>
        <AtlMenu>
          <AtlMenuItem>Copy</AtlMenuItem>
          <AtlMenuItem>Paste</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem :disabled="true">Delete</AtlMenuItem>
        </AtlMenu>
      </template>
    </AtlMenuTrigger>
  `,
};

async function capture() {
  const scenarios: Record<string, unknown> = {};
  let r = render(Fixture);
  // The trigger applies its ARIA attributes in a post-flush watcher.
  await nextTick();
  scenarios.closed = a11yTree(document.body);
  r.unmount();

  r = render(Fixture);
  await fireEvent.click(screen.getByText('Open Menu'));
  await nextTick();
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
