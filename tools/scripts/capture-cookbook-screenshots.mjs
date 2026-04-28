#!/usr/bin/env node
/**
 * Capture light + dark screenshots of all 6 cookbook patterns × 3 frameworks
 * from the deployed Storybook on https://atelier.pieper.io.
 * Output: docs/public/patterns/screenshots/{id}-{fw}-{theme}.png
 *
 * One-shot artifact for cookbook P7. Re-run when story content changes.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..');
const OUT_DIR = join(REPO_ROOT, 'docs', 'public', 'patterns', 'screenshots');

const SITE = 'https://atelier.pieper.io';

const PATTERNS = [
  { id: 'login-form',            storyId: 'login-form' },
  { id: 'settings-page',         storyId: 'settings-page' },
  { id: 'confirmation-dialog',   storyId: 'confirmation-dialog' },
  { id: 'data-list',             storyId: 'data-list-with-actions' },
  { id: 'notification-center',   storyId: 'notification-center' },
  { id: 'management-dashboard',  storyId: 'management-dashboard' },
];
const FRAMEWORKS = ['angular', 'react', 'vue'];
const THEMES = ['light', 'dark'];

function storyUrl(fw, storyId, theme) {
  return `${SITE}/storybook-${fw}/iframe.html?id=cookbook--${storyId}&viewMode=story&globals=backgrounds.value:${theme}`;
}

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2, // retina-ish output
});
const page = await context.newPage();

let ok = 0, fail = 0;
for (const fw of FRAMEWORKS) {
  for (const pattern of PATTERNS) {
    for (const theme of THEMES) {
      const url = storyUrl(fw, pattern.storyId, theme);
      const out = join(OUT_DIR, `${pattern.id}-${fw}-${theme}.png`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // ensure data-theme attribute applied + content rendered
        await page.waitForTimeout(1500);

        let buf;
        if (pattern.id === 'confirmation-dialog') {
          // Story's play() auto-opens the dialog. Native <dialog> renders to
          // the top-layer outside #storybook-root, so capture the viewport.
          await page.waitForTimeout(800);
          buf = await page.screenshot({ type: 'png', fullPage: false });
        } else {
          const root = await page.$('#storybook-root, #root');
          if (!root) throw new Error('no #storybook-root / #root element');
          buf = await root.screenshot({ type: 'png' });
        }
        writeFileSync(out, buf);
        console.log(`OK  ${pattern.id} / ${fw} / ${theme}  → ${out.replace(REPO_ROOT + '/', '')}`);
        ok++;
      } catch (e) {
        console.error(`ERR ${pattern.id} / ${fw} / ${theme}  ${e.message}`);
        fail++;
      }
    }
  }
}

await browser.close();
console.log(`\n${ok} captured, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
