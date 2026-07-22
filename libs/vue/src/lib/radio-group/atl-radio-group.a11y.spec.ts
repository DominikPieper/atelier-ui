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
import AtlRadioGroup from './atl-radio-group.vue';
import AtlRadio from '../radio/atl-radio.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-radio-group.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  const r = render({ components: { AtlRadioGroup, AtlRadio }, template });
  // Child radios inject the group context on mount — flush before capturing.
  await nextTick();
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

async function capture() {
  return {
    default: await captureOne(`
      <AtlRadioGroup :value="'sm'">
        <AtlRadio radioValue="sm">Small</AtlRadio>
        <AtlRadio radioValue="lg">Large</AtlRadio>
      </AtlRadioGroup>
    `),
    disabled: await captureOne(`
      <AtlRadioGroup :value="'sm'" :disabled="true">
        <AtlRadio radioValue="sm">Small</AtlRadio>
        <AtlRadio radioValue="lg">Large</AtlRadio>
      </AtlRadioGroup>
    `),
  };
}

describe('AtlRadioGroup — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
