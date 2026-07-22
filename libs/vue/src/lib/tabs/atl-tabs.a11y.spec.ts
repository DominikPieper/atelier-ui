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
import AtlTabGroup from './atl-tab-group.vue';
import AtlTab from './atl-tab.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-tabs.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  const r = render({
    components: { AtlTabGroup, AtlTab },
    template,
  });
  // Tab registration with the group happens on child mount — flush before capturing.
  await nextTick();
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

async function capture() {
  return {
    default: await captureOne(`
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two">Content Two</AtlTab>
      </AtlTabGroup>
    `),
    withDisabled: await captureOne(`
      <AtlTabGroup>
        <AtlTab label="Tab One">Content One</AtlTab>
        <AtlTab label="Tab Two" :disabled="true">Content Two</AtlTab>
      </AtlTabGroup>
    `),
  };
}

describe('AtlTabGroup — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
