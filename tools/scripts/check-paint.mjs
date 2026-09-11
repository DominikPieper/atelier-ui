#!/usr/bin/env node
/**
 * check-paint.mjs — ADR-0121 Decision 4, stage 2 of "the stories are the spec".
 *
 * Stage 1 (`check-contracts.mjs`) joined the docgen manifest, the stories and the
 * Figma snapshot for SHAPE (axis names, values, coverage). It left the snapshot's
 * `rootPaint` — the per-variant fill, stroke, geometry and root typography Figma
 * actually draws — unread. This stage closes that gap: it renders every story of
 * every component that has both a contract and a snapshot master, in a real
 * browser, against the built Storybooks, and compares what got painted to the
 * matching `rootPaint` row.
 *
 * Inputs, all offline (no live Figma, no dev server):
 *   - `dist/storybook/<fw>` — built by `nx run-many -t build-storybook` (the same
 *     step `check:storybook-manifests` runs). This gate does NOT build it; it
 *     fails with a clear message if a framework's build is missing.
 *   - `tools/figma/snapshot.json` — `rootPaint` per master, keyed
 *     `axis=value, …, state=<state>`.
 *   - `libs/spec/src/contracts/*.contract.ts` — the same micro-contracts stage 1
 *     reads (`figmaNodeId`, `axisMap`, `figmaOnly`, `codeOnly`, `probes`).
 *   - The story files themselves, to resolve each story's effective `args` via
 *     `storybook/internal/csf-tools` — the exact mechanism `check-contracts.mjs`
 *     uses. Nothing there is exported, so the handful of helpers this script
 *     needs (own-args detection, the forwarding-render heuristic, the AST→primitive
 *     reducer) are copied verbatim rather than imported; `loadCsf` and
 *     `createStoryArgsResolver` themselves come straight from the package.
 *
 * WHAT GETS COMPARED, per story, against the row `<axis=value,…>, state=default`
 * (state excluded from the variant key, then re-appended):
 *
 *   [PAINT]     rendered background-color / border-color vs the RESOLVED VALUE of
 *               the token the row binds (`--ui-<group>-<rest>`, ADR-0115's mapping)
 *               — never a hex read out of the snapshot. Border-color only checked
 *               when the row actually draws a stroke.
 *   [GEOMETRY]  height, each padding side, gap and border-radius vs the row's
 *               numbers — resolved through the row's bound token when it names one
 *               (`padBound[i]` / `gapBound` / `radius`), compared to the row's own
 *               px value when it does not (an unbound side, or a raw value Figma
 *               cannot express as a Variable, ADR-0107). Border width vs
 *               `strokeWeight` directly — the snapshot carries no bound variable
 *               for stroke width.
 *   [TYPE]      font-size vs `fontSize`; line-height vs `fontSize * lineHeight/100`
 *               (the snapshot's `lineHeight` is a PERCENT, per
 *               `figma-snapshot.mjs`'s own capture — never a px figure) — both
 *               skipped where the snapshot recorded `null` (Figma AUTO leading, a
 *               mixed run, or no single direct TEXT child at the root).
 *
 * `state=hover` and `state=focus` rows, when the master has them for the same
 * variant key, are checked for PAINT ONLY (fill/stroke) — hovering or Tab-focusing
 * the probe element and re-reading. `active`/`pressed` are not checked yet.
 *
 * THE PROBE ELEMENT. The brief this gate was written from assumed one rule
 * (`.atl-<kebab>` inside `#storybook-root`) would find the painted box in every
 * framework, on the strength of Button/Dialog/Chat "carrying the root class".
 * Checking all three source trees before writing this found that rule true for
 * React and Vue everywhere, and true for Angular WHEN a component renders an
 * inner element carrying that literal class (AtlDialog's `<dialog class="atl-
 * dialog">`, AtlChatHeader's `<div class="atl-chat-header">`) — but FALSE for a
 * component styled straight on `:host` with no inner wrapper at all (AtlButton,
 * AtlChat's own root): there Angular's host element carries `role="button"` /
 * `variant-x size-y` classes and nothing named `.atl-button`. Angular's `:host`
 * compiles to the bare tag selector (`atl-button`), so the painted box in that
 * case IS the custom element itself.
 *
 * Round 2 (ADR-0121 Decision 4, stage 2 hardening) added `probes` to the six
 * FORM-WRAPPER contracts (AtlInput, AtlTextarea, AtlSelect, AtlCombobox,
 * AtlCheckbox, AtlToggle): for these the `.atl-<kebab>` / bare-tag root found
 * above is itself never painted — it only carries typography and layout — while
 * the actual control (an `<input>`, `<textarea>`, `<select>`, `.track`, …) is a
 * DESCENDANT. A declared probe's `selector` is relative to that root, not to
 * `#storybook-root`: resolution first finds the root exactly as tiers 2/3 below
 * describe, then queries the declared selector INSIDE it — one relative selector
 * (`input`, `.track`, `input[role='combobox']`) resolves in all three frameworks
 * even though the frameworks' literal class names differ (Angular's `:host`
 * scoping means its own CSS never needs the `.atl-<kebab>` prefix React/Vue's
 * global stylesheets do), because the ROOT each framework's tier 2/3 already
 * found absorbs that difference. The one exception is AtlSelect: Angular renders
 * a `<button role="combobox">` trigger, not a native `<select>`, so no selector
 * is shared — its `probes[0].reason` says so, and Angular's own Select stories
 * report `[NO-PROBE]` rather than silently measuring the unpainted host.
 *
 * A declared probe changes what "not found" means, too: once a contract states
 * the root is NOT the painted layer, failing to find the declared selector under
 * that root does NOT fall back to measuring the root anyway (tiers 2/3 below) —
 * that would silently compare Figma's numbers to an element already known to be
 * the wrong one. It reports `[NO-PROBE]` instead. The probe order actually
 * implemented:
 *
 *   1. `contract.probes[0].selector`, queried inside whichever of tiers 2/3 below
 *      resolves the component root. Not found → `[NO-PROBE]` directly (no
 *      fall-through to 2/3 on their own).
 *   2. `.atl-<kebab-selector>` inside `#storybook-root` (React/Vue's convention,
 *      and Angular wherever an inner element carries that literal class).
 *   3. the bare custom-element tag `atl-<kebab-selector>` inside `#storybook-root`
 *      — Angular's `:host`-only components. Harmless to try in React/Vue: no such
 *      tag exists there, so it never matches.
 *   4. `#storybook-root > *:first-child`, flagged `[NO-PROBE]`.
 *
 * NOT RENDERED (round 2). A resolved probe element can still be the wrong thing
 * to measure: AtlDialog, AtlDrawer and AtlChat's popup/drawer sub-stories render
 * CLOSED by default, so the very box this gate would compare to Figma has
 * `display: none`, zero width/height, or is a `<dialog>` without `[open]` — that
 * is a lifecycle state Figma's `rootPaint` row does not describe at all, not a
 * paint/geometry/type difference. Detected right after probe resolution, before
 * any measurement runs; reported as `[NOT-RENDERED]` (the reason named), and the
 * story's paint/geometry/type comparisons are skipped entirely — a closed box has
 * no color or size to be wrong about.
 *
 * PLAY COMPLETION (round 3, ADR-0121's "Corrected 2026-09-11 (the `play` count)"
 * paragraph / ADR-0128). Before round 3 this gate measured at MOUNT — the instant
 * `#storybook-root` gained children — and never waited for a story's `play`.
 * Harmless while none of the measured stories carried one; load-bearing the
 * moment they do, since a `play` is part of a story's claim (ADR-0121 Decision 2:
 * "these `args` render like this Figma node... and behave as this `play`
 * asserts") — the rendered state that claim describes is what `play` leaves
 * behind, not what mount alone produces. Fixed by waiting for the ONE core event
 * Storybook's preview runtime emits exactly once per render, on every path —
 * no `play` at all, a `play` that resolves, or a `play` that throws — read from
 * this repo's own installed `storybook@10.6.0` rather than assumed:
 * `node_modules/storybook/dist/_browser-chunks/chunk-M6YZR3ZW.js`, the
 * `PreviewRender.render()` method. It runs `loading` → `beforeEach` → mount →
 * (if a `play` exists) `playing` → `completing` (`waitForAnimations`, so a real
 * CSS transition/animation already has a chance to settle here) → `completed` →
 * `afterEach` → `finished`, and the `finished` phase always ends by emitting
 * `STORY_FINISHED` (`storybook/internal/core-events`, value `'storyFinished'`)
 * with `{ storyId, status: 'error' | 'success', reporters }`. A thrown `play` is
 * caught, re-emits `PLAY_FUNCTION_THREW_EXCEPTION`, then — since
 * `throwPlayFunctionExceptions` defaults to `true` — re-throws into `render()`'s
 * own OUTERMOST catch, which emits `STORY_FINISHED` with `status: 'error'` from
 * there instead; either way the event fires. The one path that never reaches it:
 * a `play` whose own `await` never settles (an unresolved promise, a real hang).
 * That is `[PLAY-TIMEOUT]`, below.
 *
 * Nothing in a static Storybook build exposes this event to an outside
 * `page.evaluate()` call made AFTER the fact — by the time such a call runs (a
 * separate CDP round trip from `page.goto()`), a fast, `play`-less story may
 * already have finished. So the bridge is installed via `page.addInitScript()`
 * (runs before any page script, on every navigation this page makes) as an
 * accessor property on `globalThis.__STORYBOOK_ADDONS_CHANNEL__` — verified
 * against `channel-slot.ts`'s compiled output (`preview/runtime.js`): the
 * channel is installed with a plain `globalThis.__STORYBOOK_ADDONS_CHANNEL__ =
 * next` assignment, so an accessor `set()` sees it the instant it happens, with
 * no window for the event to fire unobserved.
 *
 * SETTLE (round 3, ADR-0121 Decision 4 / ADR-0128's Consequences: Vue's
 * `AtlAlert` height measured `55px` vs `56px` across `--update-baseline` runs,
 * on a changing subset of stories, always inside tolerance but never explained).
 * `storyFinished` answers "did the story's own lifecycle finish," not "has the
 * browser stopped moving this box" — a `play`-triggered entrance transition can
 * still be animating after `completing`'s `waitForAnimations` gives up (it is
 * itself bounded, and only sees animations the Web Animations API tracks; a
 * layout shift from a late `ResizeObserver` callback or a web-font swap is
 * invisible to it either way). So after `storyFinished` (and again after the
 * hover/focus interactions below), this gate polls the probe element's
 * `getBoundingClientRect()` once per animation frame and waits for it to read
 * IDENTICAL on `SETTLE_STABLE_FRAMES` consecutive frames, bounded by
 * `SETTLE_TIMEOUT_MS` — best-effort: if it never stabilises, measurement
 * proceeds anyway rather than hanging or skipping, since GEOMETRY already has a
 * tolerance and this is a mitigation, not a new gate.
 *
 * RATCHET (ADR-0079's convention, reused unchanged) — for the three comparison
 * tags and `[NO-VARIANT]` only. `[NO-PROBE]` and `[NOT-RENDERED]` are printed as
 * warnings on every run but are NOT part of the ratchet: neither means "the code
 * disagrees with the design" — one means "nothing trustworthy could be measured"
 * and the other means "there is nothing painted to measure yet" — so baselining
 * either would either freeze a bug that should just get a probe (see the note in
 * `tools/figma/paint-baseline.json`) or invite exactly the silent-reversal risk
 * ADR-0066 exists to prevent, in the other direction (an entry that "clears
 * itself" the moment the gate is run against a different set of open/closed
 * stories). `fw|component|story|state|field` keys each ratcheted finding.
 * `tools/figma/paint-baseline.json` records the current set. On a normal run: a
 * finding not in the baseline is an ERROR (new drift); a baseline entry that no
 * longer reproduces is `[STALE-BASELINE]`, also an ERROR — an improvement nobody
 * recorded is exactly the silent reversal ADR-0066/ADR-0079 refuse to allow.
 * Findings already in the baseline print as one summary line per tag, not one
 * line each. `--update-baseline` writes the current set (never edits `why`/`kind`
 * by hand — there are none here; this baseline is flat findings, not
 * `check-figma.js`'s per-master counts).
 *
 * `[PLAY-TIMEOUT]` is neither ratcheted nor a printed-but-silent warning like
 * `[NO-PROBE]`/`[NOT-RENDERED]`: ADR-0124 rule 2 ("a tool failure is an
 * error-level finding naming the file and the reason, never an absence") and
 * ADR-0128 both require a `play` that never settles to be named, every run,
 * unconditionally — so it joins `[NO-MEASUREMENTS]`/`[NO-INDEX-ENTRY]`/`[ROSTER]`
 * as a hard error in `main()` (blocks even `--update-baseline`) rather than
 * either skip bucket below, which are ratcheted and would silently absorb it.
 *
 * Flags:
 *   --fw <angular|react|vue>   one framework only (default: all three)
 *   --snapshot <path>          override tools/figma/snapshot.json
 *   --component <Selector>     one component only, e.g. AtlButton (fast iteration)
 *   --theme <light|dark>       default light; dark sets documentElement's
 *                              data-theme attribute directly before measuring —
 *                              tokens.css keys its dark values on that attribute,
 *                              the same one every preview.tsx's background
 *                              decorator sets (ADR-0121's stories, all three
 *                              previews)
 *   --update-baseline          record the current findings
 *   --report                   print every measurement (pass and fail), not just
 *                              failures — for iterating on one component
 *
 * Run via:
 *   node tools/scripts/check-paint.mjs                                 check
 *   node tools/scripts/check-paint.mjs --fw react --component AtlButton --report
 *   node tools/scripts/check-paint.mjs --update-baseline
 * (or  npm run check:paint)
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadCsf, createStoryArgsResolver } from 'storybook/internal/csf-tools';

const require = createRequire(import.meta.url);
const { parseExportedVars } = require('./lib/ts-eval.js');
const { PAINT_ROSTER_EXEMPT } = require('./lib/allowlists.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

const TOLERANCE_PX = 2; // documented alongside the exact-string colour rule below
const UNRESOLVABLE = Symbol('unresolvable');

// See the header comment's "PLAY COMPLETION" / "SETTLE" sections for what these
// bound and why. STORY_FINISHED_TIMEOUT_MS is generous relative to the browser
// suite's own per-story cost (ADR-0121: ~11s for an entire library, hundreds of
// stories) precisely because a real hang should read as [PLAY-TIMEOUT], not as
// a gate that is merely slow.
const STORY_FINISHED_TIMEOUT_MS = 10000;
const SETTLE_TIMEOUT_MS = 1000;
const SETTLE_STABLE_FRAMES = 3;

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {
    fw: null,
    snapshot: null,
    component: null,
    theme: 'light',
    updateBaseline: false,
    report: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fw') out.fw = argv[++i];
    else if (a === '--snapshot') out.snapshot = argv[++i];
    else if (a === '--component') out.component = argv[++i];
    else if (a === '--theme') out.theme = argv[++i];
    else if (a === '--update-baseline') out.updateBaseline = true;
    else if (a === '--report') out.report = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.theme !== 'light' && args.theme !== 'dark') {
  console.error(`--theme must be 'light' or 'dark', got '${args.theme}'`);
  process.exit(2);
}
const targetFrameworks = args.fw ? [args.fw] : FRAMEWORKS;
for (const fw of targetFrameworks) {
  if (!FRAMEWORKS.includes(fw)) {
    console.error(
      `Unknown framework '${fw}' — expected one of ${FRAMEWORKS.join(', ')}`,
    );
    process.exit(2);
  }
}
// A --component or --fw run only ever measures part of the roster, so neither the
// baseline-staleness check (settleAgainstBaseline, below) nor the roster floor
// (ADR-0034, main()) can judge anything outside what this invocation actually
// touched. One flag, reused by both rather than each re-deriving its own notion
// of "scoped".
const isScoped = !!args.component || !!args.fw;

const SNAPSHOT_FILE = args.snapshot
  ? path.resolve(process.cwd(), args.snapshot)
  : path.join(ROOT, 'tools/figma/snapshot.json');
const CONTRACTS_DIR = path.join(ROOT, 'libs/spec/src/contracts');
const BASELINE_FILE = path.join(ROOT, 'tools/figma/paint-baseline.json');
const SKIP_BASELINE_FILE = path.join(
  ROOT,
  'tools/figma/paint-skip-baseline.json',
);
const DIST_DIR = path.join(ROOT, 'dist/storybook');

const BASELINE_NOTE =
  'Per-finding RATCHET for check:paint (ADR-0121 Decision 4 stage 2; convention reused from ' +
  'ADR-0079/ADR-0066). An entry recorded here means: this story, in this state, paints or sizes ' +
  "one field DIFFERENTLY from the master's rootPaint row — background-color or border-color " +
  'against the resolved value of the Figma-bound token ([PAINT]); height, padding, gap, radius ' +
  "or border-width against the row's own numbers ([GEOMETRY]); font-size or line-height against " +
  'the same row ([TYPE]); or a story whose resolved args produced no matching rootPaint row at ' +
  'all ([NO-VARIANT]). Fix the code or the master and re-record — never delete the entry by ' +
  'hand — because a recorded defect that just disappears from the file is indistinguishable from ' +
  "one that was fixed; the gate needs to see it happen. The gate PASSES while a story's findings " +
  'are EXACTLY the ones recorded here, FAILS when one APPEARS that is not recorded, and FAILS ' +
  'when a recorded one DISAPPEARS without this file being updated — an improvement nobody ' +
  'records can silently reverse (that disappearance is reported as [STALE-BASELINE], and a ' +
  '--component/--fw run only evaluates staleness over the entries in scope for that run, so a ' +
  'partial run cannot report the rest of the roster as stale). This is NOT an allowlist: it does ' +
  'not excuse a defect, it dates it.\n\n' +
  '[NOT-RENDERED] and [NO-PROBE] are NOT recorded here, on purpose — neither is a paint/geometry/' +
  'type comparison a fix could even target. [NOT-RENDERED] means the probe element exists but is ' +
  'not drawn in this lifecycle state (display:none, zero width/height, or a <dialog> without ' +
  '[open] — a closed AtlDialog/AtlDrawer/AtlChat popover, most often): there is nothing painted ' +
  'to compare yet, so measuring it would compare Figma to a box that is not there. [NO-PROBE] ' +
  'means this gate does not know which descendant is the painted layer for this component: ' +
  "either no contract probe is declared and neither the '.atl-<kebab>' class nor the bare custom " +
  'element tag was found under #storybook-root, or a probe IS declared and its selector did not ' +
  "resolve for this framework (see AtlSelect's contract for a worked example — Angular's button " +
  "trigger shares no selector with React/Vue's native <select>). Both print as a warning on " +
  'every run rather than failing the gate, because recording either would either freeze a bug ' +
  'that just needs a probe, or a story lifecycle state that changes on its own — see the header ' +
  'comment in tools/scripts/check-paint.mjs ("NOT RENDERED" / "THE PROBE ELEMENT") for the full ' +
  "reasoning. To add a probe: add `probes: [{ part, selector, reason }]` to the component's " +
  '`.contract.ts` (libs/spec/src/contracts/); `selector` is relative to the resolved component ' +
  "root (the '.atl-<kebab>' element, or the bare custom-element tag on Angular's :host-only " +
  'components) — verify it with `--component <Selector> --report`, which prints the matched ' +
  "tag+class for the component's Default story in every framework the probe is expected to cover.\n\n" +
  'Update with `node tools/scripts/check-paint.mjs --update-baseline` — never by hand. See ' +
  'plan/adr/0121-the-stories-are-the-spec.md (Decision 4), ' +
  'plan/adr/0079-type-does-not-need-the-painted-box.md and ' +
  'plan/adr/0066-a-warning-nobody-can-clear.md.';

// ─── Skip ratchet (skipped-demo / not-rendered / no-probe) ───────────────────
// ADR-0124 rule 1: "every counter a gate prints in its summary is either asserted or
// removed." [NOT-RENDERED] and [NO-PROBE] are printed every run (see above) and
// deliberately NOT part of the per-finding ratchet above — neither means "the code
// disagrees with Figma", so neither belongs beside [PAINT]/[GEOMETRY]/[TYPE]. But
// printing them was never the same as asserting them, and on a clean run in
// 2026-09 they (plus [SKIPPED-DEMO], which was not printed anywhere at all) covered
// roughly half of every framework's stories. This is the rest of rule 1: a ratchet of
// sorted IDENTITY LISTS, per framework and per reason — ADR-0080's shape, not a count.
// A count shape was tried first and rejected in review: ADR-0080 records the exact
// failure mode by hand on this repo's own sibling gates (check:typeface, check:figma —
// "each time with no output at all" on a substitution), and a repeat of it here was
// caught the same way, before this file was committed. See
// tools/figma/paint-skip-baseline.json's own meta.note for the full rule.

const SKIP_REASONS = [
  {
    idsKey: 'skippedDemoIds',
    tag: 'skipped-demo',
    why:
      'the ambiguous-demo heuristic (scanLiteralAttrs/scanObjectLiteralProps below) found more than ' +
      'one distinct literal value under some prop within a story that renders without forwarding ' +
      '`args` — most often a real multi-instance showcase (AllVariants, AllSizes, …) with no single ' +
      'root to measure, but the same code path is what a genuinely single-variant demo the heuristic ' +
      "misjudges would also hit. See 'scanLiteralAttrs' above. Identity: 'Component · Story'.",
  },
  {
    idsKey: 'notRenderedIds',
    tag: 'not-rendered',
    why:
      'the resolved probe element exists in the DOM but is not drawn in this lifecycle state — ' +
      'display:none, zero width/height, or a <dialog> without [open] — most often a closed ' +
      'AtlDialog/AtlDrawer/AtlChat popover whose story does not open it by default. See the "NOT ' +
      "RENDERED\" section of this file's header comment. Identity: 'Component · Story'.",
  },
  {
    idsKey: 'noProbeIds',
    tag: 'no-probe',
    why:
      "no descendant answering to '.atl-<kebab>', the bare custom-element tag, or a declared contract " +
      'probe was found under #storybook-root for this story/framework, or Tab focus never reached the ' +
      'resolved probe — nothing trustworthy to compare to Figma\'s rootPaint row. See "THE PROBE ' +
      "ELEMENT\" section of this file's header comment. Identity: 'Component · Story · state', " +
      "state ∈ {'default', 'focus'} — 'default' when the root/contract probe never resolved at all " +
      "(the failure that happens before any state-specific check runs), 'focus' when the probe DID " +
      'resolve but Tab focus never reached it. The state segment exists because a story can flip from ' +
      'one shape to the other (a probe gets declared, so resolution now succeeds, but the newly-' +
      'reachable element still cannot be focused) without its Component/Story pair changing at all — ' +
      'a substitution a 2-part identity would silently absorb.',
  },
];

const SKIP_BASELINE_NOTE =
  "Per-(framework, reason) IDENTITY ratchet for check:paint's three currently-unmeasurable-by-design " +
  'skip reasons (ADR-0124 rule 1: "every counter a gate prints in its summary is either asserted or ' +
  'removed"; shape matches ADR-0080\'s per-finding baselines exactly — sorted lists of WHAT, never a ' +
  'count of HOW MANY, and never a line number). skipped-demo / not-rendered / no-probe are NOT part ' +
  'of the [PAINT]/[GEOMETRY]/[TYPE]/[NO-VARIANT] per-finding ratchet in paint-baseline.json: none of ' +
  'the three means "the code disagrees with Figma" — each means "nothing trustworthy could be ' +
  'measured", for a different reason apiece (see check-paint.mjs\'s header comment, sections "RATCHET", ' +
  '"NOT RENDERED" and "THE PROBE ELEMENT"). This file exists so that debt stays visible instead of ' +
  "dissolving into a counter nothing reads, which is how roughly half of every framework's stories went " +
  'unmeasured under a green check:paint before this file existed.\n\n' +
  "WHY IDENTITIES AND NOT COUNTS: a count is faithful to HOW MANY, not to WHICH (ADR-0080's own " +
  'words). A count-shaped version of this file was drafted first and rejected before being committed: ' +
  'ADR-0080 already records this exact failure happening BY HAND on two sibling gates in this repo — ' +
  'check:typeface (sizing one selector while un-sizing another left a per-directory count unchanged, ' +
  'green, exit 0) and check:figma (the same shape, on three separate checks, "each time with no output ' +
  'at all") — and ADR-0079 had rejected the identity-list shape first, for being unreadable "for a ' +
  'case nobody has hit"; ADR-0080 records that "the case was hit within the hour". A count here would ' +
  'have reproduced that history a third time: one story leaving a bucket while a different one enters ' +
  'it, for the same (framework, reason), leaves the total unchanged and the gate green, silently.\n\n' +
  'The gate PASSES while a (framework, reason) set of identities is EXACTLY the set recorded here, ' +
  'FAILS when an identity APPEARS that is not recorded ([SKIP-RISE], naming it), and FAILS when a ' +
  'recorded identity DISAPPEARS without this file being updated ([SKIP-STALE], naming it — an ' +
  'improvement nobody records can silently reverse, the same rule ADR-0066/ADR-0079/ADR-0080 apply). ' +
  'A SUBSTITUTION — one identity leaving a (framework, reason) set while a different one enters it — ' +
  'therefore produces BOTH an [SKIP-RISE] (naming the new one) and an [SKIP-STALE] (naming the old ' +
  'one), never a silent net-zero. On a matching run this prints exactly one summary line per framework ' +
  'naming the three set sizes, never the individual identities — those are read from this file, not ' +
  'reprinted on every green run.\n\n' +
  '`no-component`, `off-roster` and `no-index-entry` (also printed per-framework by check-paint.mjs) ' +
  'are deliberately NOT in this file. `no-index-entry` is asserted directly as a hard floor (a story in ' +
  'source CSF missing from the built index has no legitimate reason to exist, so it blocks outright — ' +
  'see [NO-INDEX-ENTRY] in check-paint.mjs). `no-component` and `off-roster` are counted per STORY FILE, ' +
  "not per story, and every file behind them today sits entirely outside check:paint's own roster — a " +
  'multi-component demo page with no single root to measure (cookbook/showcase/kitchen-sink), a ' +
  'component with neither a contract nor a Figma snapshot master at all (AtlIcon), or a component ' +
  'already carrying a PAINT_ROSTER_EXEMPT("design") entry for the identical reason across frameworks ' +
  "(AtlToast). None of that is a story this gate skipped — it never entered the roster's definition " +
  "(contract ∩ snapshot) to begin with, so it is not this ratchet's question to ask twice.\n\n" +
  '`play-timeout` (also printed per-framework) is likewise NOT in this file, for the opposite reason ' +
  'from the other two: it is not debt to track, it is a hard, always-blocking error (ADR-0124 rule 2 / ' +
  'ADR-0128) — a play function that never settles is a finding, not a skip, so recording it here would ' +
  'be exactly the silent-skip failure this file exists to prevent. See [PLAY-TIMEOUT] in check-paint.mjs.\n\n' +
  'Update with `node tools/scripts/check-paint.mjs --update-baseline` — never by hand.';

// ─── Snapshot ────────────────────────────────────────────────────────────────

if (!fs.existsSync(SNAPSHOT_FILE)) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} not found. Generate it with a connected ` +
      'Figma Desktop Bridge: npm run figma:snapshot',
  );
  process.exit(1);
}
const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf-8'));
const snapshotBySelector = new Map(
  (snapshot.components || []).map((c) => [c.selector, c]),
);

// ─── Contracts ───────────────────────────────────────────────────────────────

const contractFiles = fs
  .readdirSync(CONTRACTS_DIR)
  .filter((f) => f.endsWith('.contract.ts'))
  .sort();
const contractsBySelector = new Map();
const contractFileBySelector = new Map(); // for the [CONTRACT-DUPLICATE] message below
const contractLoadErrors = [];
for (const file of contractFiles) {
  const vars = parseExportedVars(path.join(CONTRACTS_DIR, file));
  const contract = vars.contract;
  if (!contract || typeof contract !== 'object') {
    // Same message check-contracts.mjs:253-258 already prints for this exact case —
    // a bare `continue` here silently dropped the component from the roster with no
    // trace of why.
    console.error(
      `  ! ${file}: 'contract' did not evaluate to a static object literal — skipped.`,
    );
    continue;
  }
  const existingFile = contractFileBySelector.get(contract.component);
  if (existingFile) {
    // A `Map.set()` on a duplicate key silently keeps only the later file — the
    // first contract, and everything it declares, would vanish with no message.
    // Keep the first (already-loaded) contract and report both files as a
    // blocker rather than picking a winner.
    contractLoadErrors.push(
      `[CONTRACT-DUPLICATE] '${contract.component}' is declared by both ${existingFile} and ${file} — ` +
        "only one contract file may export a 'contract' for a given component. Rename or merge one of them.",
    );
    continue;
  }
  contractFileBySelector.set(contract.component, file);
  contractsBySelector.set(contract.component, contract);
}
if (contractLoadErrors.length) {
  for (const e of contractLoadErrors) console.error(`✗ ${e}`);
  process.exit(1);
}

// The roster: components with BOTH a contract and a snapshot master — the same
// intersection stage 1 requires before it will compare anything.
const roster = new Set(
  [...contractsBySelector.keys()].filter((name) =>
    snapshotBySelector.has(name),
  ),
);
if (args.component && !roster.has(args.component)) {
  console.error(
    `✗ '${args.component}' has no contract+snapshot pair. Roster: ${[...roster].sort().join(', ')}`,
  );
  process.exit(2);
}

// ─── Minimal copies of check-contracts.mjs's story→args helpers ────────────
// Nothing in check-contracts.mjs is exported (verified before copying, rather than
// assumed), so these are copied rather than imported. What this gate needs: which
// stories are pure multi-instance demos (`AllVariants`) vs. a single measurable
// render (a local wrapper called with one literal prop — the discriminator is below,
// past `isForwardingRender`, and it is a refinement of what this gate was originally
// briefed to do: see that comment for why a plain skip left most of the roster
// unmeasured), and the AST→primitive reducer for the resolver's output. The docgen
// machinery (react-docgen, the Storybook framework workers) is deliberately NOT
// copied — this gate's ground truth is the rendered DOM, not the manifest, so the
// only thing docgen would add is a component's DEFAULT value for a prop that both
// the meta and the story omit.
// ADR-0121 Decision 2 requires every story's meta to declare every variant
// coordinate in `args`, so that case is the exception rather than the rule; where
// it does happen, `docgenDefault()` below reuses check-defaults.js's regex
// extraction instead — a few lines, not the ~300 the full docgen path would cost.

function getStoryOwnObjectNode(csf, key) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return null;
  const varDecl = stmt.declaration || stmt;
  const decl = varDecl && varDecl.declarations && varDecl.declarations[0];
  let init = decl && decl.init;
  while (
    init &&
    (init.type === 'TSAsExpression' ||
      init.type === 'TSSatisfiesExpression' ||
      init.type === 'TSTypeAssertion')
  ) {
    init = init.expression;
  }
  return init && init.type === 'ObjectExpression' ? init : null;
}

function getOwnStoryKeys(csf, key) {
  const init = getStoryOwnObjectNode(csf, key);
  if (!init) return [];
  return init.properties
    .map((p) => (p.key && (p.key.name || p.key.value)) || null)
    .filter(Boolean);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getMetaRenderText(csf, source) {
  const metaNode = csf._metaNode;
  const metaRenderProp =
    metaNode && Array.isArray(metaNode.properties)
      ? metaNode.properties.find(
          (p) =>
            !p.computed &&
            p.key &&
            (p.key.name === 'render' || p.key.value === 'render'),
        )
      : null;
  return metaRenderProp
    ? source.slice(metaRenderProp.start, metaRenderProp.end)
    : '';
}

function getStoryEvidenceBlob(csf, source, key, metaRenderText) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return '';
  let blob = source.slice(stmt.start, stmt.end);
  if (!getOwnStoryKeys(csf, key).includes('render') && metaRenderText)
    blob += `\n${metaRenderText}`;
  return blob;
}

function isForwardingRender(text) {
  if (!text) return false;
  if (/\bargs\b/.test(text)) return true;
  const paramMatch = /\brender\s*:\s*\(\s*([A-Za-z_$][\w$]*)/.exec(text);
  const param = paramMatch && paramMatch[1];
  if (param && param !== 'args') {
    const p = escapeRegExp(param);
    if (new RegExp(`\\{\\s*\\.\\.\\.\\s*${p}\\s*\\}`).test(text)) return true;
    if (new RegExp(`v-bind\\s*=\\s*"${p}"`).test(text)) return true;
    if (new RegExp(`\\bprops\\s*:\\s*${p}\\b`).test(text)) return true;
    if (new RegExp(`\\.\\.\\.\\s*${p}\\b`).test(text)) return true;
  }
  return false;
}

/** check-contracts.mjs's R1a literal-evidence idiom (`scanLiteralAttrs` /
 * `scanObjectLiteralProps`, copied verbatim — nothing exported), reused here for a case
 * ADR-0121's "Refined" §5 states but this gate's own brief compressed into a plain
 * skip: many stories in this codebase render a LOCAL wrapper component with the variant
 * passed as a literal JSX/template attribute (`<DialogDemo size="sm" />`,
 * `[size]="'sm'"`), not a forwarded `args` object at all — Storybook's own
 * `stats.render` marks these "render-only, no own args" exactly like a genuine
 * multi-instance showcase (`AllVariants`), but only one of the two actually renders a
 * single measurable variant. The discriminator implemented below: scan the story's own
 * evidence blob for literal prop assignments; if every prop the master's own axes care
 * about has AT MOST ONE distinct literal value, it is a single-variant demo (measure it,
 * preferring the literal over the resolved/meta args) — if any has MORE than one, it is
 * a multi-instance grid with no single root to measure (skip, matching the original
 * "render-only demo" intent). Found by running this gate against the full roster (see
 * the header comment): the plain skip alone left ~90 of ~120 React stories unmeasured. */
function addCovered(map, name, value) {
  if (!map.has(name)) map.set(name, new Set());
  map.get(name).add(value);
}
function scanLiteralAttrs(text, fw, into) {
  const plainRe = /\b([A-Za-z_$][\w-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = plainRe.exec(text))) addCovered(into, m[1], m[2]);
  if (fw === 'react') {
    const braceRe = /\b([A-Za-z_$][\w-]*)\s*=\s*\{\s*['"]([^'"]*)['"]\s*\}/g;
    while ((m = braceRe.exec(text))) addCovered(into, m[1], m[2]);
  } else if (fw === 'angular') {
    const boundRe = /\[([A-Za-z_$][\w-]*)\]\s*=\s*"'([^']*)'"/g;
    while ((m = boundRe.exec(text))) addCovered(into, m[1], m[2]);
  } else if (fw === 'vue') {
    const boundRe = /:([A-Za-z_$][\w-]*)\s*=\s*"'([^']*)'"/g;
    while ((m = boundRe.exec(text))) addCovered(into, m[1], m[2]);
  }
}
function scanObjectLiteralProps(text, into) {
  const re = /\b([A-Za-z_$][\w-]*)\s*:\s*(['"])([^'"]*)\2/g;
  let m;
  while ((m = re.exec(text))) addCovered(into, m[1], m[3]);
}

function nodeToPrimitive(node) {
  if (node == null) return UNRESOLVABLE;
  if (typeof node !== 'object') return node;
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'Identifier':
      return node.name === 'undefined' ? undefined : UNRESOLVABLE;
    default:
      return UNRESOLVABLE;
  }
}

function toRepoImportPath(absPath) {
  return './' + path.relative(ROOT, absPath).split(path.sep).join('/');
}

function collectStoryFilesUnder(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.stories\.(ts|tsx)$/.test(entry.name))
        out.push(full);
    }
  })(dir);
  return out;
}

function findStoryFiles(fw) {
  return collectStoryFilesUnder(
    path.join(ROOT, 'libs', fw, 'src', 'lib'),
  ).sort();
}

// ─── docgenDefault() — check-defaults.js's regex extraction, copied minimal ────
// Only reached when BOTH the meta and the story omit a variant axis from `args`
// (see the header comment above). Reads the component's own source files —
// never the story/spec/css — for the framework-specific default-value idiom.

const componentSourceCache = new Map();
function componentSource(contextDir) {
  if (componentSourceCache.has(contextDir))
    return componentSourceCache.get(contextDir);
  let src = '';
  try {
    for (const f of fs.readdirSync(contextDir)) {
      if (/\.(spec|stories)\./.test(f) || f.endsWith('.css')) continue;
      if (/\.(ts|tsx|vue)$/.test(f))
        src += fs.readFileSync(path.join(contextDir, f), 'utf-8') + '\n';
    }
  } catch {
    /* dir missing */
  }
  componentSourceCache.set(contextDir, src);
  return src;
}
function angularDefault(src, prop) {
  const m = new RegExp(
    `\\b${prop}\\s*=\\s*input(?:<[^>]*>)?\\(\\s*'([^']*)'`,
  ).exec(src);
  return m ? m[1] : undefined;
}
function reactDefault(src, prop) {
  const m = new RegExp(`\\b${prop}\\s*=\\s*'([^']*)'`).exec(src);
  return m ? m[1] : undefined;
}
function vueDefault(src, prop) {
  const blockRe = /withDefaults\([\s\S]*?,\s*(\{[^}]*\})\s*\)/g;
  let block;
  while ((block = blockRe.exec(src)) !== null) {
    const m = new RegExp(`\\b${prop}\\s*:\\s*'([^']*)'`).exec(block[1]);
    if (m) return m[1];
  }
  return undefined;
}
function docgenDefault(fw, contextDir, prop) {
  const src = componentSource(contextDir);
  if (fw === 'angular') return angularDefault(src, prop);
  if (fw === 'react') return reactDefault(src, prop);
  return vueDefault(src, prop);
}

// ─── kebab-case + the Figma token ↔ CSS custom property mapping ────────────
// `<group>/<rest>` -> `--ui-<group>-<rest>` — exactly check-figma-token-names.js's
// mapping (ADR-0030 §2 / ADR-0115), read from that gate rather than re-derived.

function kebabCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
function tokenCssVar(tokenName) {
  if (!tokenName || tokenName === 'RAW' || tokenName === 'mixed') return null;
  const slash = tokenName.indexOf('/');
  if (slash === -1) return null;
  return `--ui-${tokenName.slice(0, slash)}-${tokenName.slice(slash + 1)}`;
}
function round2(n) {
  return typeof n === 'number' ? Math.round(n * 100) / 100 : n;
}

/** Same set, same reason, as check-figma.js's BLOCK_HEIGHT_DERIVED (ADR-0107): these six
 * controls derive `padding-block` from their own height token
 * (`calc((height - line-height * font-size) / 2 - border)`), so the rendered top/bottom
 * padding is a real, nonzero, font-dependent number that Figma states as "no block padding
 * bound" (`padBound[0]`/`padBound[2]` null) because the master states the height and nothing
 * else. Comparing that rendered number to Figma's raw `pad[0]`/`pad[2]` (usually 0) would
 * fail every one of these six on every story, for a divergence ADR-0107 already decided is
 * not a defect — so the BLOCK axis is skipped entirely for them when unbound, not compared
 * to 0. The INLINE axis (left/right) is unaffected: ADR-0107 is explicit that inline padding
 * stays a stated value, bound to a Figma Variable like any other. Discovered by running this
 * gate against AtlButton (see the header comment): every size showed a top/bottom [GEOMETRY]
 * finding before this exemption existed.
 */
const BLOCK_HEIGHT_DERIVED = new Set([
  'AtlButton',
  'AtlInput',
  'AtlBadge',
  'AtlTextarea',
  'AtlSelect',
  'AtlTab',
]);

// ─── Variant-key construction ───────────────────────────────────────────────
// Mirrors check-contracts.mjs's AXIS check closely enough to resolve the SAME key
// a rootPaint row is keyed under, but simpler: this only needs one value per axis
// (not full coverage bookkeeping), and 'state' is always excluded (rebuilt to the
// interaction state being checked afterwards).

function buildVariantKey(
  master,
  contract,
  resolvedArgs,
  literalOverrides,
  fw,
  contextDir,
) {
  const axisMapByFigmaAxis = new Map();
  for (const e of (contract && contract.axisMap) || []) {
    if (!axisMapByFigmaAxis.has(e.figmaAxis))
      axisMapByFigmaAxis.set(e.figmaAxis, []);
    axisMapByFigmaAxis.get(e.figmaAxis).push(e);
  }
  // A literal JSX/template override (see scanLiteralAttrs above) beats resolved args —
  // it is what the story's OWN render text actually assigns — which beats the meta's
  // args default, which beats the component's own coded default.
  const codeValueOf = (propName) =>
    literalOverrides.has(propName)
      ? literalOverrides.get(propName)
      : resolvedArgs[propName] !== undefined
        ? resolvedArgs[propName]
        : docgenDefault(fw, contextDir, propName);
  const parts = [];
  for (const axisName of Object.keys(master.variantAxes || {})) {
    if (axisName === 'state') continue;
    const mapEntries = axisMapByFigmaAxis.get(axisName) || [];
    let figValue;
    if (mapEntries.length > 0) {
      for (const entry of mapEntries) {
        if (entry.codeProp.includes('.')) continue; // a CHILD component's prop — not resolvable from this component's own args
        const codeVal = codeValueOf(entry.codeProp);
        if (codeVal === undefined) continue;
        if (entry.values) {
          const found = Object.entries(entry.values).find(
            ([, v]) => v === codeVal,
          );
          if (found) {
            figValue = found[0];
            break;
          }
        } else {
          figValue = codeVal; // identity mapping
          break;
        }
      }
    } else {
      figValue = codeValueOf(axisName);
    }
    if (figValue === undefined) return null;
    parts.push(`${axisName}=${figValue}`);
  }
  return parts; // caller appends the 'state=<x>' segment (or, for AtlInput et al, IS the whole key)
}

/** Joins the non-state axis parts with an interaction-state segment into the exact
 * `rootPaint` key format (`figma-snapshot.mjs`'s own `axis=value, …` join). A master
 * whose ONLY variant axis is 'state' itself (AtlInput, AtlTextarea, AtlSelect: no
 * separate variant/size — the row key IS just `state=default`) produces an EMPTY
 * `parts` array; joining that with a leading ', ' before appending the state segment
 * produced ', state=default' — a key that matches nothing — until this was found by
 * running the survey below and seeing every AtlInput story report [NO-VARIANT]. */
function rowKeyFor(parts, stateValue) {
  return [...parts, `state=${stateValue}`].join(', ');
}

// ─── Findings ────────────────────────────────────────────────────────────────

const findings = [];
function pushFinding(fw, component, story, state, field, detail, tag) {
  findings.push({ tag, fw, component, story, state, field, detail });
}

// Per-component measurement counter (ADR-0034's roster floor, main()). This is
// deliberately NOT derived from `findings` or from the baseline file — both record
// only DIFFERENCES, so a component with zero findings is indistinguishable from one
// that was never measured at all. Incremented in runFramework() at the exact point a
// real comparison runs (probe resolved, not [NO-PROBE]/[NOT-RENDERED]/[NO-VARIANT]).
const measuredByComponent = new Map();

function near(a, b, tol) {
  return (
    typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol
  );
}

const unresolvedTokenWarned = new Set();
function warnUnresolvedToken(cssVar) {
  if (unresolvedTokenWarned.has(cssVar)) return;
  unresolvedTokenWarned.add(cssVar);
  console.error(
    `  ! ${cssVar} resolved to an empty custom property — the token the snapshot binds is not ` +
      'declared on :root (or the theme in effect). Comparisons against it are skipped, not failed.',
  );
}

const reportRows = [];
function addColorComparison(ctx, field, rendered, tokenName, resolvedRgb) {
  const tokenVar = tokenCssVar(tokenName);
  if (!tokenVar) return; // nothing bound on this side — no fill/stroke to compare
  if (resolvedRgb == null) {
    warnUnresolvedToken(tokenVar);
    return;
  }
  const ok = rendered === resolvedRgb;
  if (args.report)
    reportRows.push({
      ...ctx,
      field,
      rendered,
      figma: resolvedRgb,
      tokenVar,
      ok,
    });
  if (!ok) {
    pushFinding(
      ctx.fw,
      ctx.component,
      ctx.story,
      ctx.state,
      field,
      `rendered ${rendered}, figma ${resolvedRgb} (token ${tokenVar})`,
      'PAINT',
    );
  }
}
function addLengthComparison(ctx, tag, field, rendered, want, tokenVar) {
  if (want == null || !Number.isFinite(want) || !Number.isFinite(rendered))
    return;
  const ok = near(rendered, want, TOLERANCE_PX);
  if (args.report)
    reportRows.push({ ...ctx, field, rendered, figma: want, tokenVar, ok });
  if (!ok) {
    pushFinding(
      ctx.fw,
      ctx.component,
      ctx.story,
      ctx.state,
      field,
      `rendered ${round2(rendered)}px, figma ${round2(want)}px` +
        (tokenVar ? ` (token ${tokenVar})` : ''),
      tag,
    );
  }
}

// ─── Static file server (no dependency — this gate needs nothing beyond what a
// built Storybook already is: static files) ─────────────────────────────────

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
  '.ico': 'image/x-icon',
};

function serveStatic(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let filePath = path.join(rootDir, urlPath);
        if (!filePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end();
          return;
        }
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end();
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
        });
        fs.createReadStream(filePath).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end(String(e));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ─── Probe resolution (see header comment for why tier 3 exists) ──────────────

async function elementExists(page, selector) {
  try {
    return (await page.locator(selector).count()) > 0;
  } catch {
    return false;
  }
}

/** Tiers 2/3 only: the component ROOT, with no knowledge of where the painted
 * layer is within it. `null` when neither the `.atl-<kebab>` convention nor the
 * bare custom-element tag exists in this render. */
async function resolveRootSelector(page, kebab) {
  const classSel = `#storybook-root .${kebab}`;
  if (await elementExists(page, classSel))
    return { selector: classSel, source: 'root-class' };
  const tagSel = `#storybook-root ${kebab}`;
  if (await elementExists(page, tagSel))
    return { selector: tagSel, source: 'bare-tag' };
  return null;
}

async function resolveProbe(page, selector, contract) {
  const kebab = kebabCase(selector);
  const declared =
    contract && Array.isArray(contract.probes) ? contract.probes[0] : null;

  if (declared && declared.selector) {
    // A declared probe means the contract already knows the root itself is not
    // the painted layer (see the header comment's "THE PROBE ELEMENT" section).
    // Resolve the root first — the same tiers 2/3 below use — then query the
    // declared selector INSIDE it, so one relative selector ('input', '.track',
    // "input[role='combobox']") can resolve under each framework's own root
    // even though the frameworks' literal class names differ.
    const root = await resolveRootSelector(page, kebab);
    if (root) {
      const combined = `${root.selector} ${declared.selector}`;
      // `focusScope` is deliberately the ROOT, not `combined`: AtlToggle's declared probe
      // ('.track') is a SIBLING of the actual focusable `<input>`, not an ancestor, so a
      // containment check scoped to '.track' can never see the input become active even
      // when Tab genuinely reached it. The root — which does contain both — is the right
      // scope for "did focus land somewhere in this component"; `combined` stays the scope
      // for what gets PAINTED-compared once it has.
      if (await elementExists(page, combined))
        return {
          selector: combined,
          source: 'contract',
          focusScope: root.selector,
        };
    }
    // The declared selector did not resolve under this framework's root (or no
    // root was found at all). Falling through to tiers 2/3 below would measure
    // the root anyway — exactly the element the contract already says is wrong.
    // Report [NO-PROBE] instead of a silent, known-bad measurement.
    return {
      selector: '#storybook-root > *:first-child',
      source: 'fallback',
      warn: true,
      reason:
        `contract probe '${declared.selector}' (part: ${declared.part}) did not resolve` +
        (root
          ? ` under its root ('${root.selector}')`
          : ' — no component root found either') +
        (declared.reason ? `. Declared reason: ${declared.reason}` : ''),
    };
  }

  const root = await resolveRootSelector(page, kebab);
  if (root) return root;
  return {
    selector: '#storybook-root > *:first-child',
    source: 'fallback',
    warn: true,
    reason: `no contract probe, no .${kebab} element and no bare ${kebab} tag under #storybook-root`,
  };
}

// ─── Measurement ─────────────────────────────────────────────────────────────

/** Full measurement (paint + geometry + type) for the `state=default` comparison. */
async function measureFull(page, selector, row) {
  const colorVars = new Set();
  const lengthVars = new Set();
  const fillVar = tokenCssVar(row.fill);
  const strokeVar = tokenCssVar(row.stroke);
  if (fillVar) colorVars.add(fillVar);
  if (strokeVar) colorVars.add(strokeVar);
  for (const b of row.padBound || []) {
    const v = tokenCssVar(b);
    if (v) lengthVars.add(v);
  }
  const gapVar = tokenCssVar(row.gapBound);
  if (gapVar) lengthVars.add(gapVar);
  const radiusVar = tokenCssVar(row.radius);
  if (radiusVar) lengthVars.add(radiusVar);

  return page.evaluate(
    ({ sel, colorVars, lengthVars, layoutMode }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const rootCs = getComputedStyle(document.documentElement);
      const normColor = (raw) => {
        if (!raw) return null;
        const d = document.createElement('div');
        d.style.color = raw;
        document.body.appendChild(d);
        const v = getComputedStyle(d).color;
        d.remove();
        return v;
      };
      const normLength = (raw) => {
        if (!raw) return null;
        const d = document.createElement('div');
        d.style.position = 'absolute';
        d.style.visibility = 'hidden';
        d.style.paddingLeft = raw;
        document.body.appendChild(d);
        const v = parseFloat(getComputedStyle(d).paddingLeft);
        d.remove();
        return Number.isFinite(v) ? v : null;
      };
      const colors = {};
      for (const v of colorVars)
        colors[v] = normColor(rootCs.getPropertyValue(v).trim());
      const lengths = {};
      for (const v of lengthVars)
        lengths[v] = normLength(rootCs.getPropertyValue(v).trim());
      const gapRaw = layoutMode === 'VERTICAL' ? cs.rowGap : cs.columnGap;
      return {
        height: rect.height,
        backgroundColor: cs.backgroundColor,
        borderTopColor: cs.borderTopColor,
        borderTopWidth: parseFloat(cs.borderTopWidth) || 0,
        borderTopLeftRadius: parseFloat(cs.borderTopLeftRadius) || 0,
        paddingTop: parseFloat(cs.paddingTop) || 0,
        paddingRight: parseFloat(cs.paddingRight) || 0,
        paddingBottom: parseFloat(cs.paddingBottom) || 0,
        paddingLeft: parseFloat(cs.paddingLeft) || 0,
        gap: parseFloat(gapRaw) || 0,
        fontSize: parseFloat(cs.fontSize) || 0,
        lineHeightRaw: cs.lineHeight,
        colors,
        lengths,
      };
    },
    {
      sel: selector,
      colorVars: [...colorVars],
      lengthVars: [...lengthVars],
      layoutMode: row.layoutMode,
    },
  );
}

/** Paint-only measurement, for the hover/focus interaction-state rows. */
async function measurePaintOnly(page, selector, row) {
  const colorVars = new Set();
  const fillVar = tokenCssVar(row.fill);
  const strokeVar = tokenCssVar(row.stroke);
  if (fillVar) colorVars.add(fillVar);
  if (strokeVar) colorVars.add(strokeVar);
  return page.evaluate(
    ({ sel, colorVars }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rootCs = getComputedStyle(document.documentElement);
      const normColor = (raw) => {
        if (!raw) return null;
        const d = document.createElement('div');
        d.style.color = raw;
        document.body.appendChild(d);
        const v = getComputedStyle(d).color;
        d.remove();
        return v;
      };
      const colors = {};
      for (const v of colorVars)
        colors[v] = normColor(rootCs.getPropertyValue(v).trim());
      return {
        backgroundColor: cs.backgroundColor,
        borderTopColor: cs.borderTopColor,
        colors,
      };
    },
    { sel: selector, colorVars: [...colorVars] },
  );
}

function comparePaint(ctx, snap, row) {
  if (!snap) {
    // Same non-ratcheted treatment as every other [NO-PROBE]: the probe resolved a moment ago
    // (resolveProbe ran before this call) but is gone by the time measurement actually reads
    // it — most likely a hover/focus interaction changed the DOM. Nothing to compare, and
    // nothing to hold a fix to, so it warns rather than joining the baseline.
    console.warn(
      `  ⚠ [NO-PROBE] (${ctx.fw}) ${ctx.component} · ${ctx.story} · ${ctx.state}: probe element vanished while measuring`,
    );
    return;
  }
  addColorComparison(
    ctx,
    'background-color',
    snap.backgroundColor,
    row.fill,
    row.fill ? snap.colors[tokenCssVar(row.fill)] : null,
  );
  const hasStroke =
    typeof row.strokeWeight === 'number' && row.strokeWeight > 0; // typeof already excludes the 'mixed' sentinel
  if (hasStroke) {
    addColorComparison(
      ctx,
      'border-color',
      snap.borderTopColor,
      row.stroke,
      row.stroke ? snap.colors[tokenCssVar(row.stroke)] : null,
    );
  }
}

function compareFull(ctx, snap, row) {
  if (!snap) {
    // Same non-ratcheted treatment as every other [NO-PROBE]: the probe resolved a moment ago
    // (resolveProbe ran before this call) but is gone by the time measurement actually reads
    // it — most likely a hover/focus interaction changed the DOM. Nothing to compare, and
    // nothing to hold a fix to, so it warns rather than joining the baseline.
    console.warn(
      `  ⚠ [NO-PROBE] (${ctx.fw}) ${ctx.component} · ${ctx.story} · ${ctx.state}: probe element vanished while measuring`,
    );
    return;
  }
  comparePaint(ctx, snap, row);

  // GEOMETRY
  if (typeof row.height === 'number') {
    addLengthComparison(
      ctx,
      'GEOMETRY',
      'height',
      snap.height,
      row.height,
      null,
    );
  }
  if (Array.isArray(row.pad)) {
    const sideKeys = [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ];
    const sideFields = [
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
    ];
    const isBlockDerived = BLOCK_HEIGHT_DERIVED.has(ctx.component);
    for (let i = 0; i < 4; i++) {
      const bound = row.padBound ? row.padBound[i] : null;
      if (bound == null && isBlockDerived && (i === 0 || i === 2)) continue; // ADR-0107 — see BLOCK_HEIGHT_DERIVED above
      const boundVar = tokenCssVar(bound);
      const want = boundVar ? snap.lengths[boundVar] : row.pad[i];
      if (boundVar && snap.lengths[boundVar] == null) {
        warnUnresolvedToken(boundVar);
        continue;
      }
      addLengthComparison(
        ctx,
        'GEOMETRY',
        sideFields[i],
        snap[sideKeys[i]],
        want,
        boundVar,
      );
    }
  }
  if (typeof row.gap === 'number') {
    const gapVar = tokenCssVar(row.gapBound);
    const want = gapVar ? snap.lengths[gapVar] : row.gap;
    if (!(gapVar && snap.lengths[gapVar] == null)) {
      addLengthComparison(ctx, 'GEOMETRY', 'gap', snap.gap, want, gapVar);
    } else {
      warnUnresolvedToken(gapVar);
    }
  }
  if (typeof row.radiusPx === 'number') {
    const radiusVar = tokenCssVar(row.radius);
    const want = radiusVar ? snap.lengths[radiusVar] : row.radiusPx;
    if (!(radiusVar && snap.lengths[radiusVar] == null)) {
      addLengthComparison(
        ctx,
        'GEOMETRY',
        'border-radius',
        snap.borderTopLeftRadius,
        want,
        radiusVar,
      );
    } else {
      warnUnresolvedToken(radiusVar);
    }
  }
  const hasStroke =
    typeof row.strokeWeight === 'number' && row.strokeWeight > 0; // typeof already excludes the 'mixed' sentinel
  if (hasStroke) {
    addLengthComparison(
      ctx,
      'GEOMETRY',
      'border-width',
      snap.borderTopWidth,
      row.strokeWeight,
      null,
    );
  }

  // TYPE
  if (typeof row.fontSize === 'number') {
    addLengthComparison(
      ctx,
      'TYPE',
      'font-size',
      snap.fontSize,
      row.fontSize,
      null,
    );
    if (typeof row.lineHeight === 'number') {
      const wantPx = (row.fontSize * row.lineHeight) / 100; // rootPaint.lineHeight is a PERCENT (figma-snapshot.mjs)
      const renderedPx = /px$/.test(snap.lineHeightRaw || '')
        ? parseFloat(snap.lineHeightRaw)
        : null;
      if (renderedPx != null) {
        addLengthComparison(
          ctx,
          'TYPE',
          'line-height',
          renderedPx,
          wantPx,
          null,
        );
      }
    }
  }
}

// ─── Focus helper ────────────────────────────────────────────────────────────

async function focusProbe(page, selector) {
  await page.evaluate(
    () => document.body && document.body.focus && document.body.focus(),
  );
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const active = document.activeElement;
      return (
        !!active &&
        active !== document.body &&
        (active === el || el.contains(active))
      );
    }, selector);
    if (focused) return true;
  }
  return false;
}

// ─── Play completion + settle (see header comment) ────────────────────────────

/** Installed once per `page` (survives every subsequent `page.goto()`, since
 * `addInitScript` re-runs on every new document): intercepts the exact moment
 * Storybook's preview assigns `globalThis.__STORYBOOK_ADDONS_CHANNEL__` (a plain
 * assignment — verified in `preview/runtime.js`'s compiled `channel-slot.ts`,
 * see the header comment) and subscribes to `storyFinished` right then, so
 * there is no round trip during which a fast, `play`-less story could finish
 * unobserved. */
async function installStoryFinishedBridge(page) {
  await page.addInitScript(() => {
    window.__paintGateFinished = null;
    let realChannel;
    try {
      Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
        configurable: true,
        get() {
          return realChannel;
        },
        set(next) {
          realChannel = next;
          if (next && typeof next.on === 'function') {
            next.on('storyFinished', (payload) => {
              window.__paintGateFinished = payload || {};
            });
          }
        },
      });
    } catch {
      // If a future Storybook version ever stops using a plain assignment for
      // the channel slot, this accessor install would throw here rather than
      // silently missing events. Swallow so the story still renders — the
      // bounded wait below then times out and reports [PLAY-TIMEOUT] instead
      // of crashing the whole run, which is the correct failure mode for "this
      // gate's assumption about the channel no longer holds".
    }
  });
}

/** Waits for the CURRENT story (the one the last `page.goto()` navigated to) to
 * report `storyFinished` — see the header comment's "PLAY COMPLETION" section
 * for why this, and not the mount check above, is what "measure after play"
 * means. Polls via `requestAnimationFrame` inside the page rather than Node-side
 * polling, so one `page.evaluate()` round trip covers the whole wait. Returns
 * `{ finished: true, payload }` or `{ finished: false }` on timeout — the
 * caller turns the latter into `[PLAY-TIMEOUT]`, never a skip. */
async function waitForStoryFinished(page, timeoutMs) {
  return page.evaluate(async (timeout) => {
    const start = performance.now();
    return await new Promise((resolve) => {
      const check = () => {
        if (window.__paintGateFinished) {
          resolve({ finished: true, payload: window.__paintGateFinished });
          return;
        }
        if (performance.now() - start >= timeout) {
          resolve({ finished: false });
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }, timeoutMs);
}

/** Best-effort settle: waits until `selector`'s `getBoundingClientRect()` reads
 * identically on `stableFrames` consecutive animation frames, bounded by
 * `timeoutMs`. Returns `true`/`false` for `--report` diagnostics only — a
 * timeout here is NOT a finding (unlike `waitForStoryFinished`'s), it just means
 * measurement proceeds against whatever the box last read, same as before this
 * function existed. */
async function waitForStableBox(page, selector, { timeoutMs, stableFrames }) {
  return page
    .evaluate(
      async ({ selector, timeoutMs, stableFrames }) => {
        const start = performance.now();
        let last = null;
        let stableCount = 0;
        return await new Promise((resolve) => {
          const check = () => {
            const el = document.querySelector(selector);
            if (!el) {
              resolve(false);
              return;
            }
            const r = el.getBoundingClientRect();
            const box = `${r.x.toFixed(2)},${r.y.toFixed(2)},${r.width.toFixed(2)},${r.height.toFixed(2)}`;
            if (box === last) {
              stableCount++;
              if (stableCount >= stableFrames) {
                resolve(true);
                return;
              }
            } else {
              stableCount = 0;
              last = box;
            }
            if (performance.now() - start >= timeoutMs) {
              resolve(false);
              return;
            }
            requestAnimationFrame(check);
          };
          check();
        });
      },
      { selector, timeoutMs, stableFrames },
    )
    .catch(() => false);
}

// ─── Per-framework run ───────────────────────────────────────────────────────

async function runFramework(fw, browser) {
  const distDir = path.join(DIST_DIR, fw);
  const indexFile = path.join(distDir, 'index.json');
  if (!fs.existsSync(indexFile)) {
    console.error(
      `✗ [BUILD-MISSING] ${path.relative(ROOT, distDir)} has no index.json. Build it with:\n` +
        `    nx run-many -t build-storybook -p angular,react,vue\n` +
        '  (or, for one framework, `nx run ' +
        fw +
        ':build-storybook`).',
    );
    process.exit(1);
  }
  const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  const entries = Object.values(indexData.entries || indexData.stories || {});
  const idByImportExport = new Map();
  for (const e of entries) {
    if (e.type === 'story')
      idByImportExport.set(`${e.importPath}::${e.exportName}`, e.id);
  }

  const server = await serveStatic(distDir);
  const port = server.address().port;
  const page = await browser.newPage({
    viewport: { width: 1000, height: 700 },
  });
  await installStoryFinishedBridge(page);

  const storyFiles = findStoryFiles(fw);
  let measured = 0;
  let noComponent = 0;
  let noRoster = 0;
  let noIndexEntry = 0;
  // Identity lists, not counts — see SKIP_BASELINE_NOTE. 'component · story' is
  // enough to identify a skipped-demo/not-rendered occurrence (each fires at most
  // once per story); no-probe additionally carries the interaction state ('default'
  // for a probe that never resolved at all, 'focus' for one that resolved but Tab
  // never reached) because a story can flip from one no-probe shape to the other
  // without its (component, story) pair changing — a substitution a 2-part key
  // would silently absorb.
  const skippedDemoIds = [];
  const notRenderedIds = [];
  const noProbeIds = [];
  // NOT a skip bucket (see the header comment's "PLAY COMPLETION" section and
  // ADR-0128): a play that never settles is a hard error, reported through
  // main()'s unconditional hardErrors list, never through SKIP_REASONS/the
  // ratchet in paint-skip-baseline.json.
  const playTimeoutIds = [];

  for (const storyFile of storyFiles) {
    const source = fs.readFileSync(storyFile, 'utf-8');
    let csf;
    try {
      csf = loadCsf(source, {
        makeTitle: (t) => t,
        fileName: storyFile,
      }).parse();
    } catch (e) {
      console.error(
        `  ! ${path.relative(ROOT, storyFile)}: csf-tools failed to parse (${e.message})`,
      );
      continue;
    }
    const metaComponent =
      typeof csf._meta.component === 'string' ? csf._meta.component : null;
    if (!metaComponent) {
      noComponent++;
      continue;
    }
    if (args.component && metaComponent !== args.component) continue;
    if (!roster.has(metaComponent)) {
      noRoster++;
      continue;
    }
    const contract = contractsBySelector.get(metaComponent);
    const master = snapshotBySelector.get(metaComponent);
    const contextDir = path.dirname(storyFile);
    const metaRenderText = getMetaRenderText(csf, source);
    const resolver = createStoryArgsResolver(csf);
    const importPath = toRepoImportPath(storyFile);

    for (const key of Object.keys(csf._stories || {})) {
      const stats = csf._stories[key].__stats || {};
      const ownKeys = getOwnStoryKeys(csf, key);
      const isRenderOnlyDemo = !!stats.render && !ownKeys.includes('args');
      const blob = getStoryEvidenceBlob(csf, source, key, metaRenderText);
      const isForwardingDemo = isRenderOnlyDemo && isForwardingRender(blob);
      const literalOverrides = new Map();
      if (isRenderOnlyDemo && !isForwardingDemo) {
        // Not a forwarded-args render — but is it ONE configurable variant (a local demo
        // wrapper called with a literal prop, `<DialogDemo size="sm" />`) or a genuine
        // multi-instance grid (`AllVariants`)? Scan for literal evidence; more than one
        // distinct value under the same prop name means several instances render in this
        // one story, so there is no single root to measure — that is the real "demo, skip
        // it" case. Zero or one distinct value is a single measurable variant.
        const literalMap = new Map();
        scanLiteralAttrs(blob, fw, literalMap);
        scanObjectLiteralProps(blob, literalMap);
        const ambiguous = [...literalMap.values()].some((set) => set.size > 1);
        if (ambiguous) {
          // Printed every run, same as [NOT-RENDERED]/[NO-PROBE] below — this was the one
          // skip reason with a summary counter and zero per-occurrence trace anywhere.
          console.warn(
            `  ⚠ [SKIPPED-DEMO] (${fw}) ${metaComponent} · ${key}: story renders more than one ` +
              'literal value for at least one prop — a multi-instance demo with no single root to ' +
              'measure (or a single-variant demo this heuristic could not tell apart from one)',
          );
          skippedDemoIds.push(`${metaComponent} · ${key}`);
          continue;
        }
        for (const [k, set] of literalMap) literalOverrides.set(k, [...set][0]);
      }

      let resolved;
      try {
        resolved = resolver.resolve(key);
      } catch {
        continue;
      }
      const values = {};
      for (const [k, v] of Object.entries(resolved.args || {})) {
        const prim = nodeToPrimitive(v);
        if (prim !== UNRESOLVABLE) values[k] = prim;
      }

      const storyId = idByImportExport.get(`${importPath}::${key}`);
      if (!storyId) {
        noIndexEntry++;
        continue;
      }

      const ctx = { fw, component: metaComponent, story: key };
      const variantParts = buildVariantKey(
        master,
        contract,
        values,
        literalOverrides,
        fw,
        contextDir,
      );
      // Not every master has a 'state' axis at all (AtlDialog: only 'size' — one instance
      // per size, no drawn interaction states) — rootPaint's own keys have no ', state=…'
      // suffix in that case, so appending one unconditionally never matches anything. And
      // a master whose ONLY axis IS 'state' (AtlInput, AtlTextarea, AtlSelect) produces an
      // EMPTY variantParts array — rowKeyFor handles both without a spurious leading ', '.
      const hasStateAxis = !!(
        master.variantAxes && 'state' in master.variantAxes
      );
      const defaultRowKey =
        variantParts === null
          ? null
          : hasStateAxis
            ? rowKeyFor(variantParts, 'default')
            : variantParts.join(', ');
      const row = defaultRowKey
        ? (master.rootPaint || {})[defaultRowKey]
        : null;
      if (!row) {
        pushFinding(
          fw,
          metaComponent,
          key,
          'default',
          'variant-lookup',
          variantParts === null
            ? 'resolved args could not build a variant key (an axisMap-mapped axis resolved to no value)'
            : `no rootPaint row '${defaultRowKey}'`,
          'NO-VARIANT',
        );
        continue;
      }

      await page.goto(
        `http://127.0.0.1:${port}/iframe.html?id=${storyId}&viewMode=story`,
      );
      await page
        .waitForFunction(
          () => {
            const r = document.querySelector('#storybook-root');
            return !!r && r.children.length > 0;
          },
          { timeout: 15000 },
        )
        .catch(() => undefined);

      // Measure after the story's lifecycle — including its `play`, if any — has
      // actually finished, never at mount. See the header comment's "PLAY
      // COMPLETION" section for the event and where it was read from.
      const finishResult = await waitForStoryFinished(
        page,
        STORY_FINISHED_TIMEOUT_MS,
      );
      if (!finishResult.finished) {
        // ADR-0124 rule 2 / ADR-0128: a tool failure is an error-level finding
        // naming the file and the reason, never an absence — this must not fall
        // into [NO-PROBE] or [NOT-RENDERED] (both ratcheted skip buckets; see
        // the header comment's "RATCHET" section). Collected here, turned into
        // an unconditional hardError in main().
        playTimeoutIds.push(`${metaComponent} · ${key}`);
        continue;
      }

      if (args.theme === 'dark') {
        await page.evaluate(() =>
          document.documentElement.setAttribute('data-theme', 'dark'),
        );
      }
      // Every component transitions background-color/border-color (ADR at the CSS layer, not
      // this gate's concern). Hover and focus are measured on the SAME page as the default
      // state, right after a mouse move / Tab press — without this, a computed-style read can
      // land mid-transition and report a colour that never appears in a screenshot, real user
      // interaction, or Figma. Killing transitions/animations makes every state change instant.
      await page.addStyleTag({
        content:
          '*, *::before, *::after { transition: none !important; animation: none !important; }',
      });

      const probe = await resolveProbe(page, metaComponent, contract);
      if (probe.warn) {
        // [NO-PROBE] is NOT part of the per-finding ratchet in paint-baseline.json (see
        // BASELINE_NOTE / the header comment's "RATCHET" section): it means nothing
        // trustworthy was measured, not that something measured disagrees with Figma. It
        // IS tracked, as an identity, by the separate skip ratchet below (SKIP_BASELINE_NOTE)
        // — 'default' state, since this failure happens before any state-specific check.
        console.warn(
          `  ⚠ [NO-PROBE] (${fw}) ${metaComponent} · ${key}: ${probe.reason}`,
        );
        noProbeIds.push(`${metaComponent} · ${key} · default`);
        continue;
      }

      // NOT RENDERED: the probe element resolved, but is not actually drawn in this
      // lifecycle state (a closed AtlDialog/AtlDrawer/AtlChat popover, most often) — Figma's
      // rootPaint row describes the OPEN box, so comparing to a closed one is comparing to
      // the wrong lifecycle state, not measuring drift. Checked before any comparison runs;
      // like [NO-PROBE], reported and skipped, never ratcheted.
      const notRenderedReason = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return 'probe element vanished before measuring';
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return 'display: none';
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return 'zero width';
        if (rect.height === 0) return 'zero height';
        if (el.tagName === 'DIALOG' && !el.hasAttribute('open'))
          return '<dialog> without [open]';
        return null;
      }, probe.selector);
      if (notRenderedReason) {
        console.warn(
          `  ⚠ [NOT-RENDERED] (${fw}) ${metaComponent} · ${key}: ${notRenderedReason} — skipping paint/geometry/type comparisons`,
        );
        notRenderedIds.push(`${metaComponent} · ${key}`);
        continue;
      }

      if (args.report && key === 'Default') {
        const matched = await page.evaluate((sel) => {
          const els = document.querySelectorAll(sel);
          const el = els[0];
          return el
            ? {
                count: els.length,
                tag: el.tagName.toLowerCase(),
                className: String(el.className || ''),
              }
            : null;
        }, probe.selector);
        if (matched) {
          console.log(
            `  probe  ${fw.padEnd(7)} ${metaComponent.padEnd(14)} '${probe.selector}' → ` +
              `${matched.count} match(es): <${matched.tag}${matched.className ? ` class="${matched.className}"` : ''}>` +
              (matched.count !== 1 ? '  ⚠ expected exactly 1' : ''),
          );
        }
      }

      measured++;
      measuredByComponent.set(
        metaComponent,
        (measuredByComponent.get(metaComponent) || 0) + 1,
      );
      // See the header comment's "SETTLE" section: storyFinished says the
      // lifecycle ended, not that the browser has stopped moving the box.
      await waitForStableBox(page, probe.selector, {
        timeoutMs: SETTLE_TIMEOUT_MS,
        stableFrames: SETTLE_STABLE_FRAMES,
      });
      const snap = await measureFull(page, probe.selector, row);
      compareFull({ ...ctx, state: 'default' }, snap, row);

      const hoverKey = hasStateAxis ? rowKeyFor(variantParts, 'hover') : null;
      const hoverRow = hoverKey ? (master.rootPaint || {})[hoverKey] : null;
      if (hoverRow) {
        await page
          .locator(probe.selector)
          .hover()
          .catch(() => undefined);
        await waitForStableBox(page, probe.selector, {
          timeoutMs: SETTLE_TIMEOUT_MS,
          stableFrames: SETTLE_STABLE_FRAMES,
        });
        const hoverSnap = await measurePaintOnly(
          page,
          probe.selector,
          hoverRow,
        );
        comparePaint({ ...ctx, state: 'hover' }, hoverSnap, hoverRow);
        await page.mouse.move(0, 0);
      }

      const focusKey = hasStateAxis ? rowKeyFor(variantParts, 'focus') : null;
      const focusRow = focusKey ? (master.rootPaint || {})[focusKey] : null;
      if (focusRow) {
        const focused = await focusProbe(
          page,
          probe.focusScope || probe.selector,
        );
        if (focused) {
          await waitForStableBox(page, probe.selector, {
            timeoutMs: SETTLE_TIMEOUT_MS,
            stableFrames: SETTLE_STABLE_FRAMES,
          });
          const focusSnap = await measurePaintOnly(
            page,
            probe.selector,
            focusRow,
          );
          comparePaint({ ...ctx, state: 'focus' }, focusSnap, focusRow);
        } else {
          console.warn(
            `  ⚠ [NO-PROBE] (${fw}) ${metaComponent} · ${key} · focus: could not focus the probe element ` +
              '(or a focusable descendant) via Tab from the document body',
          );
          noProbeIds.push(`${metaComponent} · ${key} · focus`);
        }
      }
    }
  }

  await page.close();
  await new Promise((resolve) => server.close(resolve));
  return {
    measured,
    skippedDemo: skippedDemoIds.length,
    noComponent,
    noRoster,
    noIndexEntry,
    noProbe: noProbeIds.length,
    notRendered: notRenderedIds.length,
    playTimeout: playTimeoutIds.length,
    skippedDemoIds,
    notRenderedIds,
    noProbeIds,
    playTimeoutIds,
  };
}

// ─── Ratchet ─────────────────────────────────────────────────────────────────

function keyOf(f) {
  return `${f.fw}|${f.component}|${f.story}|${f.state}|${f.field}`;
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return null;
  return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf-8'));
}

function gitShaOrUnknown() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
  } catch {
    return 'unknown';
  }
}

function writeBaseline() {
  // The note mirrors BASELINE_NOTE above — a constant in this script, not
  // hand-maintained data in the JSON — so a full re-baseline always carries the
  // CURRENT rules forward. An earlier version of this function preserved
  // `existing.meta.note` once a baseline file existed, on the theory that the
  // note is committed data nobody should silently overwrite — but that would
  // have frozen round 1's pre-probe/pre-NOT-RENDERED description of the ratchet
  // the moment round 2 changed the rules, since --update-baseline never touches
  // meta.note again after the first write. The note documents the SCRIPT's
  // current behaviour, so it has to regenerate whenever the script does.
  const out = {
    meta: {
      note: BASELINE_NOTE,
      generatedAt: new Date().toISOString(),
      gitSha: gitShaOrUnknown(),
    },
    findings: findings.map((f) => ({ key: keyOf(f), ...f })),
  };
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(
    `✓ baseline updated: ${out.findings.length} finding(s) recorded in tools/figma/paint-baseline.json`,
  );
}

function settleAgainstBaseline() {
  const baseline = loadBaseline();
  const allBaselineFindings =
    baseline && baseline.findings ? baseline.findings : [];
  // Scoped staleness (round 2): a `--component`/`--fw` run only MEASURES the stories in
  // scope, so a baseline entry for a component or framework this invocation never touched
  // must not be judged "stale" — it simply was not re-checked. Restrict the comparison set
  // to baseline entries whose (fw, component) was actually run, and say so in the summary
  // (see the `scoped` flag this returns). An unscoped run (no --component, no --fw) evaluates
  // the whole baseline, exactly as before. `isScoped` itself is the module-level flag
  // (declared next to the CLI parsing) — main()'s roster floor reuses the exact same flag
  // rather than each deriving its own notion of "scoped".
  const scopedBaselineFindings = allBaselineFindings.filter(
    (f) =>
      targetFrameworks.includes(f.fw) &&
      (!args.component || f.component === args.component),
  );
  const baselineByKey = new Map(scopedBaselineFindings.map((f) => [f.key, f]));
  const currentByKey = new Map(findings.map((f) => [keyOf(f), f]));

  const newErrors = [];
  const recordedByTag = new Map();
  for (const [key, f] of currentByKey) {
    if (baselineByKey.has(key)) {
      recordedByTag.set(f.tag, (recordedByTag.get(f.tag) || 0) + 1);
    } else {
      newErrors.push(f);
    }
  }
  const staleErrors = [];
  for (const [key, bf] of baselineByKey) {
    if (!currentByKey.has(key)) staleErrors.push(bf);
  }
  return {
    newErrors,
    staleErrors,
    recordedByTag,
    baselineExists: !!baseline,
    scopedCount: scopedBaselineFindings.length,
    totalBaselineCount: allBaselineFindings.length,
  };
}

// ─── Skip ratchet (skipped-demo / not-rendered / no-probe) ────────────────────
// Identity-shaped, matching ADR-0080's own baselines — see SKIP_BASELINE_NOTE above
// for the full rule and why a count-shaped version of this was rejected before being
// committed. Evaluated per (framework, reason), scoped the same way the roster floor
// is: a --component run measures a deliberate ONE-component subset, and the full-
// roster sets this ratchet compares are meaningless for that — so it is not evaluated
// at all when args.component is set. A --fw run still measures every component in the
// frameworks it targets, so it IS evaluated, restricted to targetFrameworks — the
// same asymmetry settleAgainstBaseline() already has.

function loadSkipBaseline() {
  if (!fs.existsSync(SKIP_BASELINE_FILE)) return null;
  return JSON.parse(fs.readFileSync(SKIP_BASELINE_FILE, 'utf-8'));
}

function recordedSkipIds(baseline, tag, fw) {
  const entry = baseline && baseline.reasons ? baseline.reasons[tag] : null;
  const arr = entry && entry.perFramework ? entry.perFramework[fw] : null;
  return new Set(Array.isArray(arr) ? arr : []);
}

/** Writes/merges the skip baseline. A --fw-scoped run only measured SOME frameworks,
 * so it merges into whatever is already on disk rather than overwriting the whole
 * file — otherwise `--fw react --update-baseline` would silently drop angular's and
 * vue's recorded identities. A --component-scoped run does not touch this file at all
 * (see the header comment): the sets it would compute are not the whole roster's
 * sets, and writing them would record a false (and much smaller) debt. */
function writeSkipBaseline(perFw) {
  if (args.component) {
    console.log(
      '\n(--component run — tools/figma/paint-skip-baseline.json left untouched: the recorded sets ' +
        'are whole-roster sets, not meaningful for a single-component run)',
    );
    return;
  }
  const existing = loadSkipBaseline();
  const reasons = {};
  for (const r of SKIP_REASONS) {
    const priorPerFw =
      (existing &&
        existing.reasons &&
        existing.reasons[r.tag] &&
        existing.reasons[r.tag].perFramework) ||
      {};
    const perFramework = { ...priorPerFw };
    for (const fw of targetFrameworks) {
      perFramework[fw] = [...new Set(perFw[fw][r.idsKey])].sort();
    }
    const ordered = {};
    for (const fw of FRAMEWORKS) {
      if (Array.isArray(perFramework[fw])) ordered[fw] = perFramework[fw];
    }
    reasons[r.tag] = { why: r.why, perFramework: ordered };
  }
  const out = {
    meta: {
      note: SKIP_BASELINE_NOTE,
      generatedAt: new Date().toISOString(),
      gitSha: gitShaOrUnknown(),
    },
    reasons,
  };
  fs.writeFileSync(SKIP_BASELINE_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(
    `✓ skip ratchet updated: tools/figma/paint-skip-baseline.json (${targetFrameworks.join(', ')})`,
  );
}

/** Compares this run's skipped-demo/not-rendered/no-probe identities to the recorded
 * baseline. Returns `{ evaluated: false }` for a --component run (see above); otherwise
 * one row per (framework in targetFrameworks × reason) carrying the set sizes plus the
 * [SKIP-RISE]/[SKIP-STALE] blocker strings, each naming the one identity it concerns —
 * a substitution (one identity leaving the set, a different one entering it for the
 * same framework+reason) produces BOTH, never a silent net-zero. */
function settleSkipRatchet(perFw) {
  if (args.component) return { evaluated: false };
  const baseline = loadSkipBaseline();
  const rows = [];
  const errors = [];
  for (const fw of targetFrameworks) {
    for (const r of SKIP_REASONS) {
      const currentSet = new Set(perFw[fw][r.idsKey]);
      const recordedSet = recordedSkipIds(baseline, r.tag, fw);
      const newIds = [...currentSet]
        .filter((id) => !recordedSet.has(id))
        .sort();
      const staleIds = [...recordedSet]
        .filter((id) => !currentSet.has(id))
        .sort();
      rows.push({
        fw,
        tag: r.tag,
        current: currentSet.size,
        recorded: recordedSet.size,
        matches: newIds.length === 0 && staleIds.length === 0,
      });
      for (const id of newIds) {
        errors.push(
          `[SKIP-RISE] (${fw}) ${r.tag}: '${id}' is not recorded in ` +
            `tools/figma/paint-skip-baseline.json. ${r.why} If this is expected debt, run ` +
            '--update-baseline to record it; otherwise this change introduced new debt.',
        );
      }
      for (const id of staleIds) {
        errors.push(
          `[SKIP-STALE] (${fw}) ${r.tag}: '${id}' was recorded but no longer occurs — an ` +
            'improvement nobody recorded. Run --update-baseline to re-record it.',
        );
      }
    }
  }
  return { evaluated: true, baselineExists: !!baseline, rows, errors };
}

// ─── Report helpers ──────────────────────────────────────────────────────────

function topFindingShapes(list, n) {
  const byShape = new Map();
  for (const f of list) {
    const shape = `[${f.tag}] ${f.component} · ${f.field}`;
    byShape.set(shape, (byShape.get(shape) || 0) + 1);
  }
  return [...byShape.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    console.error(
      '✗ this gate needs a browser: @playwright/test is not resolvable. Run npm ci, then ' +
        'npx playwright install chromium.',
    );
    process.exit(1);
  }
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.error(
      `✗ this gate needs a browser and could not launch one — ${String(err.message).split('\n')[0]}\n` +
        '  Run: npx playwright install chromium',
    );
    process.exit(1);
  }

  const t0 = performance.now();
  const perFw = {};
  for (const fw of targetFrameworks) {
    const fwT0 = performance.now();
    perFw[fw] = await runFramework(fw, browser);
    perFw[fw].ms = performance.now() - fwT0;
  }
  await browser.close();
  const totalMs = performance.now() - t0;

  if (args.report) {
    console.log('\n--- measurements (--report) ---');
    for (const r of reportRows) {
      console.log(
        `  ${r.ok ? 'PASS' : 'FAIL'}  ${r.fw.padEnd(7)} ${r.component.padEnd(14)} ${String(r.story).padEnd(14)} ` +
          `${r.state.padEnd(7)} ${r.field.padEnd(16)} rendered=${JSON.stringify(r.rendered)} figma=${JSON.stringify(
            r.figma,
          )}${r.tokenVar ? ` (${r.tokenVar})` : ''}`,
      );
    }
  }

  console.log('\n--- per-framework ---');
  for (const fw of targetFrameworks) {
    const s = perFw[fw];
    console.log(
      `[${fw}] measured ${s.measured} stor${s.measured === 1 ? 'y' : 'ies'} ` +
        `(skipped-demo: ${s.skippedDemo}, no-component: ${s.noComponent}, off-roster: ${s.noRoster}, ` +
        `no-index-entry: ${s.noIndexEntry}, not-rendered: ${s.notRendered}, no-probe: ${s.noProbe}, ` +
        `play-timeout: ${s.playTimeout}), ${s.ms.toFixed(0)} ms`,
    );
  }

  const byFwTag = new Map();
  for (const f of findings) {
    const k = `${f.fw}|${f.tag}`;
    byFwTag.set(k, (byFwTag.get(k) || 0) + 1);
  }
  // NOT-RENDERED and NO-PROBE are never pushed to `findings` (they are not ratcheted — see
  // BASELINE_NOTE) so they are shown here from the per-framework counters instead, clearly
  // marked as such: they are warnings encountered during the run, not comparisons made.
  console.log('\n--- findings per framework, per tag (before baselining) ---');
  for (const fw of targetFrameworks) {
    const tags = ['PAINT', 'GEOMETRY', 'TYPE', 'NO-VARIANT'];
    const parts = tags.map((t) => `${t} ${byFwTag.get(`${fw}|${t}`) || 0}`);
    parts.push(
      `NOT-RENDERED ${perFw[fw].notRendered} (warning, not ratcheted)`,
    );
    parts.push(`NO-PROBE ${perFw[fw].noProbe} (warning, not ratcheted)`);
    console.log(`[${fw}] ${parts.join(', ')}`);
  }

  const top = topFindingShapes(findings, 10);
  if (top.length) {
    console.log('\n--- ten most frequent finding shapes ---');
    for (const [shape, count] of top)
      console.log(`  ${count.toString().padStart(4)}  ${shape}`);
  }

  // ─── B: per-framework measurement floor (ADR-0034) ───────────────────────
  // A framework that measured zero stories produced zero findings by construction,
  // not because it agrees with Figma. The baseline can't see this at all (it records
  // only findings), so it has to be asserted here, unconditionally, every run.
  const hardErrors = [];
  for (const fw of targetFrameworks) {
    if (perFw[fw].measured === 0) {
      hardErrors.push(
        `[NO-MEASUREMENTS] (${fw}) 0 stories measured this run. Check dist/storybook/${fw} is a current ` +
          'build (npm run check:storybook-manifests) and that --component/--fw actually selects stories ' +
          'in this framework.',
      );
    }
    // A story present in the source CSF has no legitimate reason to be absent from the
    // built index — that is a stale/partial build or an excluded story, never a design
    // decision, so this is a plain floor (0 is the only correct value) rather than a
    // ratchet like the three skip reasons below (ADR-0124 rule 1).
    if (perFw[fw].noIndexEntry > 0) {
      hardErrors.push(
        `[NO-INDEX-ENTRY] (${fw}) ${perFw[fw].noIndexEntry} stor${perFw[fw].noIndexEntry === 1 ? 'y' : 'ies'} ` +
          `exist in source CSF but have no entry in dist/storybook/${fw}/index.json — the build is stale, ` +
          'or a story was excluded from it. Rebuild with npm run check:storybook-manifests.',
      );
    }
    // [PLAY-TIMEOUT]: a play that never settles is a finding, not a skip (ADR-0124
    // rule 2 / ADR-0128) — it must not fall into [NO-PROBE]/[NOT-RENDERED], both
    // ratcheted, so it is an unconditional hard error here instead, same tier as
    // [NO-MEASUREMENTS]/[NO-INDEX-ENTRY]/[ROSTER]. Blocks even --update-baseline.
    for (const id of perFw[fw].playTimeoutIds) {
      hardErrors.push(
        `[PLAY-TIMEOUT] (${fw}) ${id}: the story's render lifecycle never reported 'storyFinished' within ` +
          `${STORY_FINISHED_TIMEOUT_MS}ms — a play function that never settles, or a story whose render never ` +
          "completes. check:paint measures a story's fully rendered state, never a mid-play snapshot.",
      );
    }
  }

  // ─── C: roster floor (ADR-0034) ───────────────────────────────────────────
  // `roster` (contract ∩ snapshot, built above from the two sources of truth — never
  // from the baseline, which records only findings and so cannot tell "clean" apart
  // from "never measured") must have at least one measurement, in some framework, for
  // every member: a blocker unless recorded in PAINT_ROSTER_EXEMPT. Scoped runs
  // (--component/--fw) measure a deliberate subset of the roster by design, so the
  // floor only applies unscoped — same `isScoped` flag settleAgainstBaseline() uses
  // for baseline staleness above.
  let rosterMeasuredCount = 0;
  if (!isScoped) {
    const rosterWarnings = [];
    for (const component of [...roster].sort()) {
      const count = measuredByComponent.get(component) || 0;
      if (count > 0) {
        rosterMeasuredCount++;
        continue;
      }
      const exempt = PAINT_ROSTER_EXEMPT.get(component);
      if (!exempt) {
        hardErrors.push(
          `[ROSTER] ${component}: 0 measurements in every framework and no PAINT_ROSTER_EXEMPT entry. ` +
            'Either give it a measurable story (a probe that resolves and renders), or record why in ' +
            "tools/scripts/lib/allowlists.js (kind: 'design' | 'gap').",
        );
      } else if (exempt.kind === 'gap') {
        rosterWarnings.push(`[GAP] ${component}: ${exempt.why}`);
      }
      // kind: 'design' — closed question, stays silent (same convention as the other
      // *_EXEMPT maps in tools/scripts/lib/allowlists.js).
    }
    // Allowlist hygiene: load-bearing, so it must not rot (same rule ADR-0034 already
    // applies to A11Y_PARITY_EXEMPT).
    for (const [component, entry] of PAINT_ROSTER_EXEMPT) {
      if (!roster.has(component)) {
        hardErrors.push(
          `[STALE] PAINT_ROSTER_EXEMPT names '${component}', which is not in the contract+snapshot roster. ` +
            'Remove it.',
        );
      } else if ((measuredByComponent.get(component) || 0) > 0) {
        hardErrors.push(
          `[STALE] PAINT_ROSTER_EXEMPT exempts '${component}' (${entry.kind}) but it now has measurements. ` +
            'Remove the entry so the component is held to the gate.',
        );
      }
    }
    for (const w of rosterWarnings) console.warn(`  ⚠ ${w}`);
    console.log(
      `\n${rosterMeasuredCount} of ${roster.size} roster component(s) measured at least once ` +
        `(${PAINT_ROSTER_EXEMPT.size} exempt).`,
    );
  }

  for (const e of hardErrors) console.error(`✗ ${e}`);

  if (args.updateBaseline) {
    if (hardErrors.length) {
      console.error(
        `\n${hardErrors.length} error(s) above — refusing to write tools/figma/paint-baseline.json from an ` +
          'incomplete run.',
      );
      process.exit(1);
    }
    writeBaseline();
    writeSkipBaseline(perFw);
    console.log(`\ntotal runtime: ${totalMs.toFixed(0)} ms`);
    process.exit(0);
  }

  const {
    newErrors,
    staleErrors,
    recordedByTag,
    baselineExists,
    scopedCount,
    totalBaselineCount,
  } = settleAgainstBaseline();

  // ─── A: a missing baseline is an error, not a free pass ──────────────────
  // (the one exemption — a run invoked with --update-baseline — already exited above,
  // before this point is ever reached).
  if (!baselineExists) {
    console.error(
      '\n✗ [BASELINE-MISSING] tools/figma/paint-baseline.json not found. Every finding printed above was ' +
        'measured but never compared to anything — that is not a passing run, it is an unrun one. Review ' +
        'them, then run `node tools/scripts/check-paint.mjs --update-baseline` and commit the file.',
    );
  } else {
    if (isScoped) {
      console.log(
        `\n(scoped run — staleness evaluated over ${scopedCount} of ${totalBaselineCount} baseline ` +
          `entr(y/ies): component=${args.component || 'all'}, fw=${targetFrameworks.join(',')})`,
      );
    }
    console.log('\n--- findings ---');
    for (const f of newErrors) {
      console.error(
        `✗ [${f.tag}] (${f.fw}) ${f.component} · ${f.story} · ${f.state} · ${f.field}: ${f.detail}`,
      );
    }
    for (const f of staleErrors) {
      console.error(
        `✗ [STALE-BASELINE] (${f.fw}) ${f.component} · ${f.story} · ${f.state} · ${f.field} — recorded ` +
          `finding no longer reproduces: ${f.detail}. Either it was fixed (re-run --update-baseline) or ` +
          'the measurement no longer runs (which is the more interesting case).',
      );
    }
    if (recordedByTag.size) {
      console.log('\n--- recorded (in the baseline) ---');
      for (const [tag, count] of recordedByTag)
        console.log(`  ${tag} ×${count}`);
    }
  }

  // ─── D: skip ratchet (skipped-demo / not-rendered / no-probe) ─────────────
  const skipResult = settleSkipRatchet(perFw);
  if (!skipResult.evaluated) {
    console.log(
      '\n(--component run — skip ratchet not evaluated: the aggregate counts are not meaningful for ' +
        'a single component)',
    );
  } else if (!skipResult.baselineExists) {
    console.error(
      '\n✗ [SKIP-BASELINE-MISSING] tools/figma/paint-skip-baseline.json not found. Every skipped-demo / ' +
        'not-rendered / no-probe count above was measured but never compared to anything. Review them, ' +
        'then run `node tools/scripts/check-paint.mjs --update-baseline` and commit the file.',
    );
  } else {
    console.log(
      '\n--- skip ratchet (tools/figma/paint-skip-baseline.json) ---',
    );
    for (const fw of targetFrameworks) {
      const parts = SKIP_REASONS.map((r) => {
        const row = skipResult.rows.find((x) => x.fw === fw && x.tag === r.tag);
        return `${r.tag} ${row.current}${row.matches ? ' (recorded)' : ` (recorded ${row.recorded})`}`;
      });
      console.log(`  [${fw}] ${parts.join(', ')}`);
    }
    for (const e of skipResult.errors) console.error(`✗ ${e}`);
  }

  console.log(`\ntotal runtime: ${totalMs.toFixed(0)} ms`);

  if (baselineExists && (newErrors.length || staleErrors.length)) {
    console.error(
      `\n${newErrors.length} new finding(s), ${staleErrors.length} stale baseline entr(y/ies).`,
    );
  }
  const skipBlocking =
    skipResult.evaluated &&
    (!skipResult.baselineExists || skipResult.errors.length > 0);
  if (
    skipResult.evaluated &&
    skipResult.baselineExists &&
    skipResult.errors.length
  ) {
    console.error(
      `\n${skipResult.errors.length} skip-ratchet issue(s) above (tools/figma/paint-skip-baseline.json).`,
    );
  }
  if (
    hardErrors.length ||
    !baselineExists ||
    newErrors.length ||
    staleErrors.length ||
    skipBlocking
  ) {
    process.exit(1);
  }
  console.log('\n✓ check:paint — no drift beyond the recorded baseline.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
