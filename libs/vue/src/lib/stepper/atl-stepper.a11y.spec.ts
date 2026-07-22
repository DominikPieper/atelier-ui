/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — Vue adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 */
import { render } from '@testing-library/vue';
import { flushPromises } from '@vue/test-utils';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import AtlStepper from './atl-stepper.vue';
import AtlStep from './atl-step.vue';

const FW = 'vue';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-stepper.${FW}.json`);

async function captureOne(template: string): Promise<unknown> {
  const r = render({ components: { AtlStepper, AtlStep }, template });
  // Steps register with the group on child mount — flush before capturing.
  await flushPromises();
  const tree = a11yTree(r.container);
  r.unmount();
  return tree;
}

async function capture() {
  return {
    default: await captureOne(`
      <AtlStepper :activeStep="1">
        <AtlStep label="Account">Account content</AtlStep>
        <AtlStep label="Profile">Profile content</AtlStep>
        <AtlStep label="Review">Review content</AtlStep>
      </AtlStepper>
    `),
  };
}

describe('AtlStepper — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
