/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Unlike Angular/React, Vue does not auto-mark the last item, so `current` is
 * set explicitly on the trailing item.
 */
import { render } from '@testing-library/vue';
import { nextTick } from 'vue';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlBreadcrumbs from './atl-breadcrumbs.vue';
import AtlBreadcrumbItem from './atl-breadcrumb-item.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-breadcrumbs.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  const r = render({ components: { AtlBreadcrumbs, AtlBreadcrumbItem }, template });
  await nextTick();
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

async function capture() {
  return {
    default: await captureOne(`
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="#">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="#">Products</AtlBreadcrumbItem>
        <AtlBreadcrumbItem :current="true">Shoes</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `),
  };
}

describe('AtlBreadcrumbs — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
