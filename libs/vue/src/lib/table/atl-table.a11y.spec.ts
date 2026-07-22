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
import AtlTable from './atl-table.vue';
import AtlThead from './atl-thead.vue';
import AtlTbody from './atl-tbody.vue';
import AtlTr from './atl-tr.vue';
import AtlTh from './atl-th.vue';
import AtlTd from './atl-td.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-table.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  const r = render({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    template,
  });
  await nextTick();
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

async function capture() {
  return {
    default: await captureOne(`
      <AtlTable>
        <AtlThead>
          <AtlTr>
            <AtlTh>Name</AtlTh>
            <AtlTh>Role</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr>
            <AtlTd>Alice</AtlTd>
            <AtlTd>Admin</AtlTd>
          </AtlTr>
          <AtlTr>
            <AtlTd>Bob</AtlTd>
            <AtlTd>Editor</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `),
  };
}

describe('AtlTable — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
