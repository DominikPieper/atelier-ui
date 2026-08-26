import { chromium } from '@playwright/test';
const OUT = process.env.OUT, PORT = 4401;
const idx = await (await fetch(`http://localhost:${PORT}/index.json`)).json();
const entries = Object.values(idx.entries || {}).filter((e) => e.type !== 'docs');
const pick = (re) => entries.find((e) => re.test(`${e.title}/${e.name}`));
const picked = [
  pick(/Showcase.*All Components/i),
  pick(/AtlButton\/(All|Variants|Primary|Default)/i) || pick(/AtlButton/i),
  pick(/AtlCard\/Default/i),
  pick(/AtlStepper/i),
].filter(Boolean);
const b = await chromium.launch();
const shots = [];
for (const [i, s] of picked.entries()) {
  const wide = /showcase/i.test(s.id);
  const page = await b.newPage({ viewport: { width: wide ? 1280 : 720, height: wide ? 1400 : 320 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
  await page.goto(`http://localhost:${PORT}/iframe.html?id=${s.id}&viewMode=story`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);
  const probe = await page.evaluate(() => {
    const grab = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '') : null; };
    return {
      body: getComputedStyle(document.body).fontFamily.split(',')[0].replace(/"/g, ''),
      card: grab('[class*="atl-card"]'), button: grab('button'), any: grab('[class*="atl-"]'),
    };
  });
  const file = `${OUT}/sb2-${i}-${s.id.replace(/[^a-z0-9]+/gi, '-')}.png`;
  await page.screenshot({ path: file, fullPage: wide });
  shots.push(file);
  console.log(`${s.id}\n   body=${probe.body} atl=${probe.any} button=${probe.button} card=${probe.card}${errs.length ? '\n   errors: ' + errs.slice(0,2).join(' | ') : ''}`);
  await page.close();
}
console.log('\nshots:\n' + shots.join('\n'));
await b.close();
