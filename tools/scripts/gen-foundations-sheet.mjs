import { readFileSync, writeFileSync } from 'node:fs';

const LIGHT_CANVAS = '#ffffff', DARK_CANVAS = '#0a1116';
const chan = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => 0.2126 * lin(chan(h,0)) + 0.7152 * lin(chan(h,1)) + 0.0722 * lin(chan(h,2));
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const T = 'libs/create-workspace/src/generators/preset/files/styles/tokens.css';
const css = readFileSync(T, 'utf8');

// ── ramps, read back out of the shipped token source ────────────────────────
const ramps = {};
for (const m of css.matchAll(/--ui-color-(teal|red|green|amber|sky)-(\d+):\s*(#[0-9a-f]{6});(?:\s*\/\*([^*]*)\*\/)?/gi)) {
  const [, fam, step, hex, note] = m;
  (ramps[fam] ||= []).push({ step: +step, hex, note: (note || '').trim() });
}
for (const f of Object.keys(ramps)) ramps[f].sort((a, b) => a.step - b.step);

// ── which semantic token takes which step, per theme ─────────────────────────
const blockOf = (name) => {
  const start = css.indexOf(name + ' {');
  return start < 0 ? '' : css.slice(start, css.indexOf('\n}', start));
};
const aliases = (block) => {
  const out = {};
  for (const m of block.matchAll(/--ui-color-([a-z-]+):\s*var\(--ui-color-(teal|red|green|amber|sky)-(\d+)\)/g))
    out[m[1]] = `${m[2]}-${m[3]}`;
  return out;
};
const lightAliases = aliases(blockOf(':root'));
const darkAliases = aliases(blockOf('[data-theme="dark"]'));

// ── the type scale, likewise ─────────────────────────────────────────────────
const type = [...css.matchAll(/--ui-font-size-([a-z0-9]+):\s*([0-9.]+rem);/g)]
  .map((m) => ({ name: m[1], rem: m[2], px: (parseFloat(m[2]) * 16).toFixed(2).replace(/\.00$/, '') }));

const FAMILY_ROLE = {
  teal: 'brand · --ui-color-primary',
  red: 'danger', green: 'success', amber: 'warning', sky: 'info',
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rampSection = Object.entries(ramps).map(([fam, steps]) => {
  const cells = steps.map(({ step, hex, note }) => {
    const anchor = note.includes('★');
    const t = /T on surface\((light|dark)\)\s+([0-9.]+)/.exec(note);
    const marks = [anchor ? '<b class="anchor">★ anchor</b>' : '', t ? `<b class="safe">T ${t[1]} ${t[2]}</b>` : ''].filter(Boolean).join(' ');
    // The specimen letter takes whichever canvas colour reads better on this step,
    // and an unmarked step states its best case rather than showing a blank chip:
    // white on teal-50 is 1.26:1, which looks like a rendering fault rather than a
    // statement that the step cannot carry text.
    const onWhite = contrast(hex, LIGHT_CANVAS), onDark = contrast(hex, DARK_CANVAS);
    const fg = onWhite >= onDark ? LIGHT_CANVAS : DARK_CANVAS;
    const best = Math.max(onWhite, onDark).toFixed(2);
    return `        <div class="sw">
          <div class="chip" style="background:${hex}"><span style="color:${fg}">Aa</span></div>
          <div class="swm"><b>${step}</b> <code>${hex}</code></div>
          <div class="swn">${marks || `<span class="none">no text · best ${best}:1</span>`}</div>
        </div>`;
  }).join('\n');
  const al = Object.entries(lightAliases).filter(([, v]) => v.startsWith(fam + '-'));
  const ad = Object.entries(darkAliases).filter(([, v]) => v.startsWith(fam + '-'));
  const row = (label, list) => list.length
    ? `<tr><td>${label}</td><td>${list.map(([k, v]) => `<code>--ui-color-${k}</code> → <b>${v.split('-')[1]}</b>`).join('<br>')}</td></tr>`
    : '';
  return `      <div class="sec">
        <div class="sec-h"><h2 class="sec-t">${fam}</h2><span class="sec-n">${FAMILY_ROLE[fam]}</span></div>
        <div class="card">
          <div class="ramp">
${cells}
          </div>
          <table class="alias">
            ${row('Light theme', al)}
            ${row('Dark theme', ad)}
          </table>
        </div>
      </div>`;
}).join('\n');

const typeRows = type.map((t) => `            <tr><td><code>--ui-font-size-${t.name}</code></td><td class="num">${t.px}px</td><td class="num">${t.rem}</td><td style="font-size:${t.rem}">Sphinx of black quartz</td></tr>`).join('\n');

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="./support.js"></script>
  </head>
  <body>
    <x-dc>
      <helmet data-dc-atomics>
        <meta name="design_doc_mode" content="canvas" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&amp;family=Instrument+Serif:ital@1&amp;family=JetBrains+Mono:wght@400..500&amp;display=swap"
          rel="stylesheet"
        />
        <link href="./_sheet.css" rel="stylesheet" />
        <style>
          /* Every value on this sheet is read out of the shipped tokens.css by
             tools/scripts/gen-foundations-sheet.mjs, so a swatch cannot disagree
             with the token it stands for. Regenerate rather than edit. */
          .ramp { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 14px; }
          .sw { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
          .chip { height: 56px; border-radius: var(--r-md); border: var(--bw) solid rgba(15,23,42,0.08);
                  display: flex; align-items: flex-end; justify-content: flex-end; padding: 6px 8px; }
          .chip span { font: 500 0.75rem/1 var(--sans); }
          .swm { font: 400 0.6875rem/1.4 var(--mono); color: var(--text); }
          .swm b { font-weight: 600; }
          .swm code { color: var(--muted); }
          .swn { font: 400 0.625rem/1.4 var(--mono); min-height: 1.4em; }
          .swn .anchor { color: var(--primary); font-weight: 600; }
          .swn .safe { color: var(--success); font-weight: 500; }
          .swn .none { color: var(--muted); opacity: 0.7; }
          table.alias { margin-top: 22px; }
          table.alias td:first-child { width: 110px; font-weight: 500; }
          table.alias code { font-size: 0.75rem; }
        </style>
      </helmet>

      <div class="sheet" data-screen-label="Foundations">
        <div class="hd">
          <h1 class="hd-name">Colour &amp; Type</h1>
          <p class="hd-sub">
            Every tonal ramp in the library, and the type scale, read out of
            <span class="tok">tokens.css</span> rather than transcribed — a swatch here cannot
            disagree with the token it stands for. <b class="tok">★</b> marks a family’s anchor;
            <span class="tok">T light</span> / <span class="tok">T dark</span> mark the steps that
            carry normal text on that canvas, at the ratio <span class="tok">check:contrast</span>
            re-measures on every build (ADR-0038, ADR-0054).
          </p>
          <p class="hd-sub">
            This is the sheet the Figma transfer reads: one Variable per step, the semantic tokens
            below each ramp saying which step each theme picks.
          </p>
        </div>

${rampSection}

      <div class="sec">
        <div class="sec-h"><h2 class="sec-t">Type scale</h2><span class="sec-n">including the step below the readable range</span></div>
        <div class="card">
          <table>
            <tr><th>Token</th><th>px</th><th>rem</th><th>Specimen</th></tr>
${typeRows}
          </table>
          <p class="note" style="margin-top: 18px">
            <span class="fixed">fixed</span><strong>The library has no off-scale font size.</strong>
            Three values sat beside the scale — 9px on the avatar’s overflow badge, 10px on the
            extra-small avatar, 11.52px on the code block’s label. The first two are
            <span class="tok">--ui-font-size-2xs</span> now and the third snapped to
            <span class="tok">--ui-font-size-xs</span>. Sending the badge to 12px instead would have
            saved the new step and was rejected by measurement, not preference: at 12px
            <span class="tok">+99</span> overflows the 24px circle (ADR-0054).
          </p>
        </div>
      </div>
    </div>
    </x-dc>
    <script type="text/x-dc" data-dc-script data-props="{}">
      class Component extends DCLogic {
        renderVals() {
          return {};
        }
      }
    </script>
  </body>
</html>
`;
writeFileSync(process.argv[2], html);
const total = Object.values(ramps).reduce((n, s) => n + s.length, 0);
console.log(`generated: ${Object.keys(ramps).length} ramps, ${total} steps, ${type.length} type sizes`);
