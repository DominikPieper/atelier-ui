/**
 * Cross-framework a11y conformance snapshot (ADR-0025) — React adapter.
 * See the button copy for the UPDATE_A11Y protocol; the committed per-framework
 * snapshots are diffed by `npm run check:a11y-parity`.
 *
 * Toast captures `document.body`: a headless probe shows ONE notification via
 * the provider (no trigger button rendered), keeping the body-level tree
 * comparable with the Angular/Vue adapters. `duration: 0` disables the
 * auto-dismiss timer so no state escapes the render.
 */
import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { a11yTree } from '../../testing/a11y-tree';
import { AtlToastProvider, AtlToastContainer, useAtlToast } from './atl-toast';

const FW = 'react';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const SNAP = resolve(ROOT, `tools/parity/a11y/atl-toast.${FW}.json`);

function Probe() {
  const { show } = useAtlToast();
  useEffect(() => {
    show('Saved successfully', { variant: 'success', dismissible: true, duration: 0 });
  }, [show]);
  return null;
}

async function capture() {
  const r = render(
    <AtlToastProvider>
      <Probe />
      <AtlToastContainer />
    </AtlToastProvider>
  );
  await screen.findByText('Saved successfully');
  const tree = a11yTree(document.body);
  r.unmount();
  return { visible: tree };
}

describe('AtlToast — a11y conformance snapshot', () => {
  it('live render matches the committed a11y snapshot', async () => {
    const live = await capture();
    if (process.env.UPDATE_A11Y) {
      writeFileSync(SNAP, JSON.stringify(live, null, 2) + '\n');
      return;
    }
    expect(live).toEqual(JSON.parse(readFileSync(SNAP, 'utf8')));
  });
});
