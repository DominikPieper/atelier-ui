#!/usr/bin/env node
/**
 * check-docs-layout.mjs
 *
 * Renders every built docs page, in a real browser, at four widths, and
 * asserts the shell holds its own reading column instead of the page
 * overflowing it.
 *
 * This gate exists because that claim was false and nothing noticed: every
 * docs page was 401px wide at a 375px viewport — the topbar's own
 * min-content, not the reading column — and the only width check ever run
 * (the manual sweep in `tasks/todo.md`) stopped at 420px, one width short of
 * the phone breakpoint that actually broke
 * (`tasks/docs-ux-review-2026-09-02.md` §2.1, B1). A static read of the CSS
 * would not have caught it either: the overflow was the sum of a dozen
 * min-content widths across unrelated topbar children, and only a rendered
 * box tells you their sum.
 *
 * WHAT THIS GATE CHECKS, per page × width, dark theme, after fonts settle:
 *
 *   [OVERFLOW]       document.scrollWidth > clientWidth, at any width. The
 *                     defect this gate exists for.
 *   [COLUMN-SCROLL]  at 375 only — `.docs-main-content` (the reading column,
 *                     ADR-0086/0087) overflows on its own axis, independent
 *                     of whatever the rest of the shell is doing.
 *   [ANCHOR-COVERED] at 1440 — clicking a `.docs-toc` link must land its
 *                     target at or below the sticky topbar's bottom edge,
 *                     not underneath it.
 *   [AXE:<rule>]     axe-core on `#docs-shell` at 1440 and 375, restricted to
 *                     the rules a *layout* gate should own (overlap,
 *                     ordering, target size, region structure) — not a
 *                     general a11y audit; see `check:a11y-parity` for that.
 *                     `color-contrast` alone is retried once when a
 *                     violation is reported: axe samples live pixel colours,
 *                     so a repaint mid-run (a font swap, a transition tail)
 *                     produces a phantom "wrong colour" reading that a
 *                     second run right after the settle point (see
 *                     `settlePage`) doesn't reproduce — only nodes that fail
 *                     BOTH runs are kept as real findings, and the default
 *                     (non `--check`) output logs the retry's before → after
 *                     count.
 *   [BREAKPOINT]     a static pass over `docs/src` for `@media` widths that
 *                     are not one of the documented breakpoints — the
 *                     review's static audit found eleven distinct values,
 *                     mostly one-offs nobody chose on purpose. A `max-width:
 *                     N` matches when N is in DOCS_BREAKPOINTS; a
 *                     `min-width: N` matches when N-1 is too — its paired
 *                     query one pixel above a max-width breakpoint (e.g.
 *                     `min-width: 769` is the counterpart of `max-width:
 *                     768`, as in `WorkflowDiagram.astro`) — or when N
 *                     itself is, for completeness.
 *
 * Same contract as check-geometry.mjs (ADR-0042/0043): a real browser does
 * the measuring, because re-deriving "does this overflow" from the CSS
 * source would be a second copy of the truth, free to disagree with the
 * first the same way the 420px-only sweep did.
 *
 * The input is the BUILT site (`dist/docs`), served from a throwaway static
 * server — never a dev server, and the gate never builds for you. That
 * keeps it fast and side-effect free: `check:all` already runs after a
 * build in CI, and locally the developer builds when they mean to.
 *
 *   node tools/scripts/check-docs-layout.mjs            measure and report
 *   node tools/scripts/check-docs-layout.mjs --check    quiet unless something is wrong
 */
import { readFileSync, readdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, dirname, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = join(ROOT, 'dist/docs');
const QUIET = process.argv.includes('--check');
const WIDTHS = [1440, 1024, 768, 375];
const AXE_WIDTHS = new Set([1440, 375]);

/**
 * The three breakpoints ADR-0086 actually reasons about: the mobile nav
 * collapse (768), a component-gallery grid step (640), a topbar control
 * squeeze (480), and the TOC-rail collapse the ADR derives from shell
 * geometry (1383/1384 — the sheet's own math lands on 1368 + a 16px
 * scrollbar allowance). Anything else in `docs/src` is an undocumented
 * one-off (the review's static audit found eleven: 860/720/719/540/520/420
 * among them) and is a finding, not a style choice.
 */
const DOCS_BREAKPOINTS = [480, 640, 768, 1383];

/**
 * `.atl-tab-group` (AtlTabs `variant="pills"`) does not wrap or scroll its
 * tabs at 375, so `.docs-main-content` is 19px wider than its own box on the
 * two pages that use it (`/patterns`, `/patterns/management-dashboard`). That
 * is a library defect (review L4 — `chip-collection-reflow`), not something
 * the docs site can fix from its own CSS.
 *
 * `findWidestOffender` can't name it, though: it looks for the single
 * *widest offender's* chain, but here the pills group as a whole overflows
 * without any one descendant element crossing the column's right edge (the
 * tabs share the blame collectively). So this isn't a class-in-the-chain
 * allowlist — it's "does this page match, and does something matching
 * `contains` actually sit at the column's boundary" (right edge within 1px
 * of the container's), checked directly against the live DOM rather than
 * inferred from the widest-offender chain.
 */
const COLUMN_SCROLL_ALLOW = [
  {
    path: /^\/patterns(\/management-dashboard)?$/,
    contains: '.atl-tab-group',
    reason: 'AtlTabs pills do not wrap or scroll at 375 — library component, review L4',
  },
];

/**
 * Rules a *layout* gate should own: overlap, DOM order, hit-target size and
 * region/landmark structure. Deliberately not the full axe ruleset — colour
 * contrast and text alternatives etc. belong to a content/a11y gate, not a
 * geometry one — except `color-contrast` is kept because a covered/obscured
 * element and a low-contrast one are both "you can't see this" defects this
 * gate is already rendering the page to catch.
 */
const AXE_RULES = [
  'scrollable-region-focusable',
  'target-size',
  'heading-order',
  'landmark-unique',
  'color-contrast',
  'page-has-heading-one',
  'region',
];

/**
 * Documented, deliberate collisions the review already routed to the
 * library backlog rather than a docs fix. `select-name` (`/components/select`)
 * and `aria-progressbar-name` (`/components/progress`) need no entry here —
 * neither rule is in AXE_RULES above, so axe never evaluates them in this
 * gate; they stay on the library backlog untouched.
 */
const AXE_ALLOW = [
  {
    rule: 'landmark-unique',
    page: '/components/breadcrumbs',
    match: (target) => /breadcrumb/i.test(target),
    reason:
      "the demo's own nav[aria-label=\"Breadcrumb\"] collides with the page's real breadcrumb landmark by design — the component is demonstrating itself (review n8: acceptable).",
  },
  {
    rule: 'target-size',
    page: '/patterns/login-form',
    match: (target) => /email/i.test(target),
    reason:
      'the AtlInput type=email demo renders under a 24px hit area — a component defect the review routes to the library backlog alongside L1-L4, not a docs fix.',
  },
  {
    rule: 'scrollable-region-focusable',
    page: '/components/code-block',
    match: (target) => /code-block-(body|pre)/.test(target),
    reason:
      "AtlCodeBlock's own scrollable <pre> (.code-block-pre) has no tabindex/role — a component defect the review routes to the library backlog alongside L1-L4, not a docs fix.",
  },
];

/**
 * `target-size` fires "partially obscured" whenever the sticky
 * `.docs-bottom-nav` (≤768, `position: sticky; bottom: 0`) overlays a
 * target's bottom edge at scroll position 0 — axe only ever evaluates the
 * page at its initial scroll. WCAG 2.5.8's Understanding treats content that
 * can be scrolled clear of a sticky bar as conforming (`scroll-padding-bottom`,
 * review M9), so this is a false positive specifically for that obscurer —
 * anything else obscuring a target still fails.
 *
 * Static `AXE_ALLOW` entries can't express this: it applies to any page and
 * every copy button, not one selector. So it's checked live, per node, by
 * hit-testing the target's bottom-centre with `elementFromPoint` inside the
 * page (see the axe evaluate() below) — axe's own node data never names
 * *what* obscured a target, only that something did.
 */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const started = Date.now();

// ── input: the built site ─────────────────────────────────────────────────
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('✗ [NO-BUILD] dist/docs/index.html not found. Run: npx nx build docs');
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const PAGES = walk(DIST)
  .filter((f) => f.endsWith('index.html'))
  .map((f) => {
    const rel = relative(DIST, dirname(f)).split(sep).join('/');
    return { url: rel === '' ? '/' : '/' + rel, file: f };
  });
// `**/index.html` is the routed pages; `404.html` is not reached by any
// route on this static server, so it is measured directly by its own name.
PAGES.push({ url: '/404.html', file: join(DIST, '404.html') });
PAGES.sort((a, b) => a.url.localeCompare(b.url));

// ── serve the built site (Astro emits absolute /_astro/... paths, so
//    file:// will not resolve them) ─────────────────────────────────────────
function resolveFilePath(requestUrl) {
  const pathname = decodeURIComponent(requestUrl.split('?')[0]);
  let rel = pathname === '/' ? '/index.html' : pathname;
  let filePath = join(DIST, rel);
  try {
    if (statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    if (!extname(rel)) filePath = join(DIST, rel, 'index.html');
  }
  return filePath;
}

// `dist/docs` is someone else's build output, not this gate's — a concurrent
// `nx build docs` elsewhere in the repo can delete and recreate it while this
// server is mid-response. `createReadStream` errors are async and otherwise
// crash the whole process (Node's default for an unhandled stream 'error');
// caught here, a request just fails instead of taking the gate down with it.
function serveFile(filePath, res, status = 200) {
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': MIME['.html'] });
    res.end('dist/docs changed underneath this server.');
  });
  res.writeHead(status, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
  stream.pipe(res);
}

const server = createServer((req, res) => {
  let filePath;
  try {
    filePath = resolveFilePath(req.url);
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      serveFile(join(DIST, '404.html'), res, 404);
      return;
    }
  } catch {
    res.writeHead(502, { 'Content-Type': MIME['.html'] });
    res.end('dist/docs changed underneath this server.');
    return;
  }
  serveFile(filePath, res);
});

await new Promise((resolvePort) => server.listen(0, '127.0.0.1', resolvePort));
const BASE_URL = `http://127.0.0.1:${server.address().port}`;

// ── this gate needs a browser ───────────────────────────────────────────────
let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '✗ this gate needs a browser: @playwright/test is not resolvable. Run npm ci, then npx playwright install chromium.'
  );
  server.close();
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  console.error(
    `✗ this gate needs a browser and could not launch one — ${String(err.message).split('\n')[0]}\n` +
      '  Run: npx playwright install chromium'
  );
  server.close();
  process.exit(1);
}

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

/**
 * Runs in the page. `scope` is either 'document' (the whole page — where
 * OVERFLOW looks) or a selector for a single box (where COLUMN-SCROLL looks,
 * scoped to `.docs-main-content`). Finds the widest element whose right edge
 * crosses the scope's own boundary, skipping anything an ancestor already
 * clips — that content cannot be the cause of the scope's own overflow.
 */
function findWidestOffender(scope) {
  const root = scope === 'document' ? document.documentElement : document.querySelector(scope);
  if (!root) return null;
  const overflow =
    scope === 'document'
      ? document.documentElement.scrollWidth - document.documentElement.clientWidth
      : root.scrollWidth - root.clientWidth;
  if (overflow <= 1) return null;

  const boundary = scope === 'document' ? document.documentElement.clientWidth : root.getBoundingClientRect().right;
  const searchRoot = scope === 'document' ? document.body : root;
  const sel = (e) =>
    e.tagName.toLowerCase() +
    (e.id ? '#' + e.id : '') +
    (typeof e.className === 'string' && e.className
      ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '');
  const clipped = (e) => {
    let p = e.parentElement;
    while (p && p !== searchRoot.parentElement) {
      if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(p).overflowX)) return true;
      p = p.parentElement;
    }
    return false;
  };

  const candidates = [...searchRoot.querySelectorAll('*')]
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > boundary + 1;
    })
    .filter((e) => !clipped(e));
  candidates.sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right);
  const top = candidates[0];
  if (!top) return { overflow, chain: null, classes: [] };

  const chain = [];
  const classes = new Set();
  let e = top;
  while (e && e !== searchRoot.parentElement) {
    if (chain.length < 4) chain.unshift(sel(e));
    if (typeof e.className === 'string') e.className.split(/\s+/).forEach((c) => c && classes.add(c));
    e = e.parentElement;
  }
  return { overflow, chain: chain.join(' > '), classes: [...classes] };
}

/**
 * Settles the page once per load, right after the theme flip and before any
 * measurement reads it (OVERFLOW/COLUMN-SCROLL included, not just axe):
 * `document.fonts.ready` (a webfont swap reflows text), two animation
 * frames (lets that reflow's repaint actually land), then a fixed 150ms
 * (covers a CSS transition tail the `reducedMotion: 'reduce'` context
 * doesn't zero). This is *why* [AXE:color-contrast] was flaky: axe samples
 * live pixel colours, and running it mid-repaint reads a colour that's
 * already on its way somewhere else — same content, different result, run
 * to run. Settling once here, rather than re-settling before the
 * color-contrast retry below, keeps both axe passes sampling the same
 * already-settled paint, so the retry is testing determinism, not just
 * giving the race a second chance to land differently.
 */
async function settlePage(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      })
  );
  await page.waitForTimeout(150);
}

/**
 * Runs axe-core once against `#docs-shell` (or `body` if the page has none)
 * restricted to `rules`, mapped down to what this gate acts on. Factored out
 * so the `color-contrast` retry (see the main loop) can call it a second
 * time with the exact same include/exclude/runOnly options — anything else
 * differing between the two calls would undermine the "did this survive a
 * second look" test.
 */
async function runAxeOnce(page, rules) {
  return page.evaluate(async (rules) => {
    const hasShell = !!document.getElementById('docs-shell');
    const results = await window.axe.run(
      { include: [[hasShell ? '#docs-shell' : 'body']], exclude: [['astro-dev-toolbar']] },
      { runOnly: { type: 'rule', values: rules }, resultTypes: ['violations'] }
    );
    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => {
        const target = n.target.join(' ');
        // See the block comment above AXE_ALLOW: a `target-size` node
        // whose own failure message says "partially obscured" gets a
        // live hit-test at its bottom-centre so a sticky-bottom-nav
        // false positive can be told apart from a real one.
        let obscuredByBottomNav = false;
        if (v.id === 'target-size' && /partially obscured/i.test(n.failureSummary || '')) {
          let el = null;
          try {
            el = document.querySelector(n.target[n.target.length - 1]);
          } catch {
            el = null;
          }
          if (el) {
            const r = el.getBoundingClientRect();
            const x = r.left + r.width / 2;
            // The target's own bottom edge can sit below the viewport
            // (the geometry that makes it "obscured" in the first
            // place) — elementFromPoint returns null past the
            // viewport edge, so the probe point is clamped inside it.
            const y = Math.min(r.bottom - 1, window.innerHeight - 1);
            const hit = document.elementFromPoint(x, y);
            obscuredByBottomNav = !!(hit && hit.closest('.docs-bottom-nav'));
          }
        }
        // axe's own contrast-check payload (fgColor/bgColor/contrastRatio),
        // carried through so a real color-contrast finding can be judged
        // from the log instead of taken on faith.
        const contrast = v.id === 'color-contrast' ? (n.any?.[0]?.data ?? null) : null;
        return { target, obscuredByBottomNav, contrast };
      }),
    }));
  }, rules);
}

const findings = [];
const progress = [];

for (const width of WIDTHS) {
  // The site's own motion guard (global.css `prefers-reduced-motion`) zeroes
  // every transition/animation duration when this is set. Without it, axe's
  // color-contrast sampled `.is-active` nav links mid-transition on some runs
  // and not others — same content, different reported violations run to run.
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();

  for (const { url } of PAGES) {
    try {
      await page.goto(BASE_URL + url, { waitUntil: 'load', timeout: 20000 });
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await settlePage(page);

      // [OVERFLOW] — any width
      const overflow = await page.evaluate(findWidestOffender, 'document');
      if (overflow) {
        findings.push(
          `[OVERFLOW] ${url} @${width}: document is ${overflow.overflow}px wider than the viewport` +
            (overflow.chain ? ` (widest: ${overflow.chain})` : '')
        );
      }

      // [COLUMN-SCROLL] — 375 only
      if (width === 375) {
        const col = await page.evaluate(findWidestOffender, '.docs-main-content');
        if (col) {
          const allow = COLUMN_SCROLL_ALLOW.find((a) => a.path.test(url));
          const allowed = allow
            ? await page.evaluate((sel) => {
                const container = document.querySelector('.docs-main-content');
                if (!container) return false;
                const boundary = container.getBoundingClientRect().right;
                // A page can render more than one match (e.g. two AtlTabs
                // groups on `/patterns`) — only one of them needs to actually
                // sit at the boundary for the allow to apply.
                return [...container.querySelectorAll(sel)].some((el) => el.getBoundingClientRect().right >= boundary - 1);
              }, allow.contains)
            : false;
          if (!allowed) {
            findings.push(
              `[COLUMN-SCROLL] ${url} @375: .docs-main-content is ${col.overflow}px wider than its own box` +
                (col.chain ? ` (widest unclipped: ${col.chain})` : '')
            );
          } else if (!QUIET) {
            progress.push(`  [375px] ${url}: [COLUMN-SCROLL allowed] ${allow.contains} sits at the column boundary — ${allow.reason}`);
          }
        }
      }

      // [AXE:<rule>] — 1440 and 375 only
      if (AXE_WIDTHS.has(width)) {
        await page.evaluate(() => {
          location.hash = '';
          window.scrollTo(0, 0);
        });
        await page.addScriptTag({ content: axeSource });
        const violations = await runAxeOnce(page, AXE_RULES);

        for (const v of violations) {
          const allow = AXE_ALLOW.filter((a) => a.rule === v.id && a.page === url);
          let remaining = [];
          for (const n of v.nodes) {
            if (allow.some((a) => a.match(n.target))) continue;
            if (v.id === 'target-size' && n.obscuredByBottomNav) {
              if (!QUIET) {
                progress.push(
                  `  [${width}px] ${url}: [AXE:target-size allowed] ${n.target} — partially obscured only by the sticky bottom nav; scroll-padding-bottom (review M9) lets the target scroll clear — WCAG 2.5.8 Understanding`
                );
              }
              continue;
            }
            remaining.push(n);
          }
          if (remaining.length === 0) continue;

          // color-contrast alone is retried: see settlePage/runAxeOnce above
          // for why axe's live pixel sampling is flaky under a repaint. Same
          // page, same options, one more run — keep only nodes that fail
          // BOTH. A phantom finding from a mid-run repaint won't reproduce;
          // a real one will.
          if (v.id === 'color-contrast') {
            const before = remaining.length;
            const retryViolations = await runAxeOnce(page, AXE_RULES);
            const retryRule = retryViolations.find((rv) => rv.id === 'color-contrast');
            const retryTargets = new Set(
              (retryRule?.nodes ?? []).filter((n) => !allow.some((a) => a.match(n.target))).map((n) => n.target)
            );
            remaining = remaining.filter((n) => retryTargets.has(n.target));
            if (!QUIET) {
              progress.push(`  [AXE:color-contrast retried] ${url} @${width}: ${before} → ${remaining.length}`);
            }
            if (remaining.length === 0) continue;
          }

          const targets = remaining.slice(0, 3).map((n) =>
            v.id === 'color-contrast' && n.contrast
              ? `${n.target} (ratio=${n.contrast.contrastRatio} fg=${n.contrast.fgColor} bg=${n.contrast.bgColor})`
              : n.target
          );
          findings.push(`[AXE:${v.id}] ${url} @${width}: impact=${v.impact} targets=${targets.join(' | ')}`);
        }
      }

      // [ANCHOR-COVERED] — 1440 only
      if (width === 1440) {
        const hrefs = await page.$$eval('.docs-toc a[href^="#"]', (as) => as.map((a) => a.getAttribute('href')));
        let target = null;
        for (const href of hrefs) {
          const id = href.slice(1);
          // eslint-disable-next-line no-await-in-loop
          const exists = await page.evaluate((id) => !!document.getElementById(id), id);
          if (exists) {
            target = href;
            break;
          }
        }
        if (target) {
          // Click via DOM traversal rather than a CSS attribute selector — the
          // href is arbitrary page content (a heading id), and `CSS.escape` is
          // a browser global, not a Node one, so it cannot run out here.
          await page.evaluate((href) => {
            const link = [...document.querySelectorAll('.docs-toc a[href^="#"]')].find(
              (a) => a.getAttribute('href') === href
            );
            link?.click();
          }, target);
          await page.waitForTimeout(400);
          const covered = await page.evaluate((href) => {
            const header = document.querySelector('header.docs-topbar');
            const heading = document.getElementById(href.slice(1));
            if (!header || !heading) return null;
            const headerBottom = header.getBoundingClientRect().bottom;
            const headingTop = heading.getBoundingClientRect().top;
            return { headerBottom, headingTop, covered: headingTop < headerBottom - 1 };
          }, target);
          if (covered && covered.covered) {
            findings.push(
              `[ANCHOR-COVERED] ${url} @1440: ${target} lands ${Math.round(
                covered.headerBottom - covered.headingTop
              )}px under header.docs-topbar (top ${Math.round(covered.headingTop)}, header bottom ${Math.round(
                covered.headerBottom
              )})`
            );
          }
        }
      }

      if (!QUIET) progress.push(`  [${width}px] ${url}`);
    } catch (err) {
      findings.push(`[ERROR] ${url} @${width}: ${String(err.message).split('\n')[0]}`);
    }
  }

  await context.close();
}

await browser.close();
server.close();

// ── static pass: undocumented @media widths ─────────────────────────────────
const DOCS_SRC = join(ROOT, 'docs/src');
const styleFiles = walk(DOCS_SRC).filter((f) => /\.(css|astro)$/.test(f));

/**
 * A `max-width: N` owns a breakpoint directly — valid when N itself is in
 * DOCS_BREAKPOINTS. A `min-width: N` is usually that same breakpoint's
 * desktop-side twin, one pixel up (`WorkflowDiagram.astro:165`'s
 * `min-width: 769` is the counterpart of `max-width: 768`, not a new
 * breakpoint) — valid when N-1 is in the set; N itself is also accepted,
 * for a `min-width` written directly on the breakpoint value.
 */
function isDocumentedBreakpoint(type, value) {
  if (type === 'max-width') return DOCS_BREAKPOINTS.includes(value);
  return DOCS_BREAKPOINTS.includes(value - 1) || DOCS_BREAKPOINTS.includes(value);
}

for (const file of styleFiles) {
  const content = readFileSync(file, 'utf8');
  const mediaRe = /@media\s*([^{]+)\{/g;
  let m;
  while ((m = mediaRe.exec(content))) {
    const cond = m[1];
    const condStart = m.index + m[0].indexOf(cond);
    const widthRe = /(min-width|max-width)\s*:\s*(\d+)px/g;
    let wm;
    while ((wm = widthRe.exec(cond))) {
      const value = Number(wm[2]);
      if (!isDocumentedBreakpoint(wm[1], value)) {
        const line = content.slice(0, condStart + wm.index).split('\n').length;
        findings.push(
          `[BREAKPOINT] ${relative(ROOT, file)}:${line}: ${wm[1]}:${value}px is not one of DOCS_BREAKPOINTS (${DOCS_BREAKPOINTS.join(', ')})`
        );
      }
    }
  }
}

// ── report ───────────────────────────────────────────────────────────────────
if (!QUIET) {
  for (const p of progress) console.log(p);
}
for (const f of findings) console.error(`✗ ${f}`);
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
console.log(`docs-layout: ${PAGES.length} page(s) × ${WIDTHS.length} widths, ${findings.length} finding(s)`);
console.log(`⏱ ${elapsed}s`);
process.exit(findings.length > 0 ? 1 : 0);
