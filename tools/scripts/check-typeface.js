#!/usr/bin/env node
/**
 * check-typeface.js
 *
 * The library states its own typeface (ADR-0035), and `--ui-font-family`'s manifest
 * constraint says to apply it "on :root or the app shell — do not respecify per
 * component". Taken literally that leaves a component depending on the consumer to
 * do something, and this repo has now measured that failure twice: Storybook had no
 * box-sizing reset (ADR-0043) and no font application, so components rendered with
 * the wrong geometry and the system font.
 *
 * Measured before this gate existed: inside an app whose own font was Georgia,
 * AtlButton, AtlInput, AtlToast and AtlTable rendered Instrument Sans while AtlCard,
 * AtlDialog, AtlChat, AtlSkeleton and AtlAvatarGroup rendered Georgia — a card next
 * to a button, in one app, in two typefaces. Angular had five more.
 *
 * So the rule this gate enforces is the constraint's intent, one level down:
 *
 *   [NO-TYPEFACE]  a component's stylesheet must declare the family somewhere, or
 *                  the component inherits whatever the consuming app uses.
 *   [DESCENDANT]   only the component root may declare it. A descendant declaring
 *                  it means the root does not, and the component is then only
 *                  correct when that particular descendant is on screen (which is
 *                  how AtlChat ended up with four declarations and no root one).
 *   [NO-LEADING]   the root must also state a line-height. A typeface without a
 *                  leading is only half the metric: the component still takes the
 *                  consuming app’s prose leading, which is what made the table
 *                  cell 42px in one page and 51px in another (ADR-0052). Stating
 *                  it on the root gives every descendant a leading the library
 *                  controls, without reaching into content the app supplies.
 *   [NO-SIZE]      a root that states --ui-line-height-normal has declared itself
 *                  a prose surface, and must state a font-size too — otherwise the
 *                  prose it leads is sized by the consuming page. Same defect as
 *                  [NO-LEADING], one axis over. A root led --ui-line-height-tight
 *                  is single-line chrome and is exempt by design: .atl-radio-group
 *                  delegates its size to .atl-radio, and .atl-tab-group leading
 *                  prose tight is a wrong-LEADING defect, not a missing-size one.
 *                  `font-size: inherit` is not a size — it is the defect spelled
 *                  out. Ratcheted against tools/parity/typeface-baseline.json,
 *                  which records the ROOTS and not a count, because the fix
 *                  redraws five masters and is blocked on the Figma side
 *                  (ADR-0078, ADR-0080).
 *   [FONT-RAW]     a `font:` shorthand is one --ui-type-* role or `inherit`, never a
 *                  hand-assembled value — that would hide a size from
 *                  check:token-bypass and a comparison from check:figma, both of
 *                  which ask about the `font-size` longhand.
 *   [FONT-AFTER]   the `font:` shorthand resets font-style, font-variant,
 *                  font-stretch and line-height, so a longhand ABOVE it in the
 *                  same rule is wiped. Same shape as [RESET-WIPED], different
 *                  reset — and one atl-menu.css had already been bitten by.
 *   [RESET-AFTER]  `all: unset` resets font-family, so a declaration before it in
 *                  the same rule does nothing. This one is measured-from-experience:
 *                  the dialog's declaration was silently wiped exactly this way.
 *
 * `font-family: inherit` is not a declaration of the typeface — it is a form
 * control refusing the UA font — and is ignored here.
 *
 * Run via:
 *   node tools/scripts/check-typeface.js                    check (baseline included)
 *   node tools/scripts/check-typeface.js --update-baseline  re-record the [NO-SIZE] counts
 * or  npm run check:typeface
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS } = require('./lib/component-discovery');
const { rootsFor } = require('./lib/component-roots');
const { typeRoles, roleOfFontShorthand } = require('./lib/type-roles');

const ROOT = path.resolve(__dirname, '../..');
const FAMILY_TOKENS = /var\(--ui-font-(family|display|mono)\)/;
const ROLES = typeRoles();
const BASELINE_REL = 'tools/parity/typeface-baseline.json';
const BASELINE_FILE = path.join(ROOT, BASELINE_REL);
const UPDATE_BASELINE = process.argv.includes('--update-baseline');

const errors = [];
/** @type {{dir: string, rel: string, selector: string}[]} — the [NO-SIZE] population. */
const noSize = [];
/** `font-size: inherit` is a root DEFERRING its size, which is the defect itself — the
 *  prose still renders at the consuming page's size. Same reading the family branch
 *  below already applies to `font-family: inherit` (a control refusing the UA font). */
const SIZE_DEFERS = /^(inherit|unset|revert|revert-layer)\b/;
let checked = 0;

/**
 * Is this selector a root rather than something inside one? Decided by NAME, from
 * the list in lib/component-roots.js. It used to be decided structurally — "one
 * compound selector with no combinator" — which reads as a root test but is really
 * a depth test: `.atl-dialog-content`, `.atl-card-header` and `.atl-combobox-input`
 * have no combinator either, so a declaration on a slot wrapper counted as a root
 * declaration and two comboboxes went past [DESCENDANT].
 *
 * Angular's `:host` keeps the structural rule — a host IS a root by construction —
 * but a host NARROWED by another `.atl-*` class answers to the same name list React
 * and Vue do. Without that the two branches measure different populations: the card's
 * `:host(.atl-card-content)` rule and the byte-identical `.atl-card-content` rule in
 * the other two frameworks were counted in Angular and invisible in the other two, in
 * a repo whose premise is that the three adapters are comparable.
 */
function isRootSelector(selector, dir) {
  const sel = selector.trim();
  if (/^:host\b/.test(sel)) {
    if (/[ >+~]/.test(sel.replace(/:host\([^)]*\)/, ':host'))) return false;
    const sibling = /^:host\(\s*(\.atl-[a-z0-9-]+)/.exec(sel);
    return sibling && sibling[1] !== `.atl-${dir}` ? rootsFor(dir).has(sibling[1]) : true;
  }
  if (/[ >+~]/.test(sel)) return false;
  const leading = /^(\.[a-z0-9-]+)/.exec(sel);
  return leading ? rootsFor(dir).has(leading[1]) : false;
}

/**
 * The key that groups every rule addressing ONE root, so a size stated in one rule
 * answers for a leading stated in another. Angular ships several components from a
 * single stylesheet, so `:host(.atl-card-content)` and `:host(atl-chat-message)`
 * are OTHER components' hosts and get their own key, while `:host(.size-md)`,
 * `:host(.variant-drawer)` and `:host(.atl-drawer)` — the directory's own root
 * class, used to narrow rather than to name a sibling — are all this same host.
 */
function rootKey(selector, dir) {
  const sel = selector.trim();
  if (/^:host\b/.test(sel)) {
    const sibling = /^:host\(\s*(\.atl-[a-z0-9-]+|[a-z][a-z0-9-]*)/.exec(sel);
    return sibling && sibling[1] !== `.atl-${dir}` ? sibling[1] : ':host';
  }
  const leading = /^(\.[a-z0-9-]+)/.exec(sel);
  return leading ? leading[1] : sel;
}

for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  if (!fs.existsSync(base)) continue;
  for (const dir of fs.readdirSync(base)) {
    const dirPath = path.join(base, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.css'));
    if (files.length === 0) continue;
    checked++;

    let declaresSomewhere = false;
    // Tied to the rule that carries the typeface, and counted across the whole
    // directory: a directory declares its family and its leading, or it does not.
    let rootFamilyRules = 0;
    let rootFamilyRulesWithLeading = 0;
    for (const file of files) {
      const rel = `libs/${fw}/src/lib/${dir}/${file}`;
      const css = fs.readFileSync(path.join(dirPath, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      // [NO-SIZE] asks about a root, not a rule, so a root's rules are gathered
      // before they are judged. Per FILE and not per directory, because Angular's
      // shared stylesheets hold several roots and each answers for itself.
      /** @type {Map<string, {selector: string, prose: boolean, size: boolean}>} */
      const rootsInFile = new Map();

      for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        // The crude rule splitter can run a preceding `:is( … )` list into this
        // selector; report the last comma-separated part, which is the one the
        // declaration actually belongs to.
        const parts = rule[1].split(/,(?![^(]*\))/);
        const selector = parts[parts.length - 1].trim().replace(/\s+/g, ' ');
        const body = rule[2];

        // ── The `font:` shorthand ────────────────────────────────────────────
        // ADR-0036 asks component CSS to reference a ROLE, and `font:` is how a
        // role is applied. It carries the family AND the leading, so a rule using
        // one satisfies both [NO-TYPEFACE] and [NO-LEADING] — which this gate did
        // not know, so it blocked the very change ADR-0036 prescribes (ADR-0073).
        const short = /(^|;)\s*font\s*:\s*([^;]+)/.exec(body);
        const shortRole = short ? roleOfFontShorthand(short[2], ROLES) : null;

        // ── What this root has said about prose and size, so far ─────────────
        // A role reference carries both, so it answers for either longhand. Only
        // a root is asked: a font-size on `.atl-card-header` or `.accordion-trigger`
        // sizes that element, never the prose the root leads.
        if (isRootSelector(selector, dir)) {
          const key = rootKey(selector, dir);
          const seen = rootsInFile.get(key) || { selector, prose: false, size: false };
          const role = shortRole ? ROLES.get(shortRole) : null;
          const leadsProse = /(^|;)\s*line-height\s*:\s*var\(\s*--ui-line-height-normal\s*\)/.test(body);
          seen.prose = seen.prose || leadsProse || (role ? role.lineHeight === '--ui-line-height-normal' : false);
          const sizeDecl = /(^|;)\s*font-size\s*:\s*([^;]+)/.exec(body);
          const statesSize = sizeDecl ? !SIZE_DEFERS.test(sizeDecl[2].trim()) : false;
          seen.size = seen.size || statesSize || Boolean(role);
          rootsInFile.set(key, seen);
        }

        // The shorthand RESETS font-style, font-variant, font-stretch and
        // line-height, so a longhand before it in the same rule is wiped. This is
        // measured, not theoretical: atl-menu.css carries the scar in a comment —
        // "Declared above it, the row's stated line-height was silently [wiped]".
        // `font:` is either a ROLE or `inherit` — nothing else. Both other shapes
        // are holes: a hand-assembled `font: 600 15px/1.25 Inter` hides a font-size
        // literal from check:token-bypass (which asks about the `font-size` property,
        // not the shorthand) and leaves [ROOT-PAINT]'s typography comparison null.
        // True of all 18 shorthands in the library when this was written: 12 roles
        // and 6 `inherit` (the native-element reset).
        if (short && !shortRole && short[2].trim().replace(/;$/, '') !== 'inherit') {
          errors.push(
            `[FONT-RAW] ${rel} sets \`font: ${short[2].trim()}\` on \`${selector}\`. A \`font:\` ` +
              `shorthand must be one --ui-type-* role or \`inherit\`: any other value hides a size ` +
              `from check:token-bypass and a comparison from check:figma, both of which read the ` +
              `\`font-size\` longhand.`
          );
        }

        if (short) {
          const before = body.slice(0, short.index + short[1].length);
          const wiped = [...before.matchAll(/(^|;)\s*(font-(?:style|variant|stretch|size|weight|family)|line-height)\s*:/g)]
            .map((m) => m[2]);
          if (wiped.length) {
            errors.push(
              `[FONT-AFTER] ${rel} declares \`${[...new Set(wiped)].join('\`, \`')}\` above \`font:\` on ` +
                `\`${selector}\`. The shorthand resets font-style, font-variant, font-stretch and ` +
                `line-height, so those declarations do nothing. Put \`font:\` first, then the overrides.`
            );
          }
        }

        const decl = /(^|;)\s*font-family\s*:\s*([^;]+)/.exec(body);
        if (!decl && !shortRole) continue;
        // A role reference stands in for the longhand it contains.
        const value = decl ? decl[2].trim() : `var(${ROLES.get(shortRole).family})`;
        if (value === 'inherit') continue; // a control refusing the UA font
        if (!FAMILY_TOKENS.test(value)) continue; // a literal stack is check:css-tokens' business

        declaresSomewhere = true;


        // --ui-font-mono and --ui-font-display are content typefaces: the code
        // element and the one display line carry them, not the component root.
        const isContentFace = /var\(--ui-font-(mono|display)\)/.test(value);
        // An element that resets everything with `all: unset` has to restate the
        // typeface itself — inheritance cannot reach it.
        const resetsItself = /(^|;)\s*all\s*:\s*(unset|initial|revert)/.test(body);

        if (isRootSelector(selector, dir) && !isContentFace) {
          rootFamilyRules++;
          // The role supplies the leading; so does the longhand.
          if (shortRole || /(^|;)\s*line-height\s*:/.test(body)) rootFamilyRulesWithLeading++;
        }

        if (!isRootSelector(selector, dir) && !isContentFace && !resetsItself) {
          errors.push(
            `[DESCENDANT] ${rel} declares the typeface on \`${selector}\`, which is not the component root. ` +
              `Declare it once on the root so the component is right wherever it renders. If \`${selector}\` ` +
              `really is a second root inside this directory, name it in EXTRA_ROOTS in ` +
              `tools/scripts/lib/component-roots.js — that list is where a shared directory's other roots live.`
          );
        }

        // A reset AFTER the declaration wipes it. (The dialog's declaration was
        // silently wiped exactly this way — and the first version of this check had
        // the comparison the wrong way round, flagging the correct order instead.)
        const afterDecl = body.slice(decl ? decl.index + decl[0].length : short.index + short[0].length);
        if (/(^|;)\s*all\s*:\s*(unset|initial|revert)/.test(afterDecl)) {
          errors.push(
            `[RESET-WIPED] ${rel} declares the typeface on \`${selector}\` and then resets it with \`all: unset\` ` +
              `further down the same rule, so the declaration does nothing. Move it below the reset.`
          );
        }
      }

      for (const root of rootsInFile.values()) {
        if (root.prose && !root.size) noSize.push({ dir, rel, selector: root.selector });
      }
    }

    if (rootFamilyRules > 0 && rootFamilyRulesWithLeading === 0) {
      errors.push(
        `[NO-LEADING] libs/${fw}/src/lib/${dir}/ states its typeface but no line-height on the root, so every line inside it is led by whatever the consuming app sets. State the leading on the same root: --ui-line-height-tight for single-line chrome, --ui-line-height-normal where the component carries prose.`
      );
    }

    if (!declaresSomewhere) {
      errors.push(
        `[NO-TYPEFACE] libs/${fw}/src/lib/${dir}/ never declares var(--ui-font-family) (or -display / -mono), ` +
          `so the component renders in whatever font the consuming app uses while its neighbours render the ` +
          `library's. Declare it on the component root.`
      );
    }
  }
}

// ── [NO-SIZE]: judged against a recorded count, not blocked outright ──────────
// The population is real and the fix is known — a font-size next to the leading on
// five roots — but paying it redraws five Figma masters and is blocked on the
// variable-collection problem the roles analysis records, so it cannot be paid
// today. ADR-0066 rejected "a warning nobody can clear", and a plain blocker would
// leave check:all red until that unblocks. So the gate passes at the recorded
// count, fails when it RISES (naming what is now found), and fails when it DROPS
// without being re-recorded — the same rule [STALE-EXEMPTION] applies to an
// allowlist entry, one abstraction up: an improvement nobody records can silently
// reverse. When a component's count reaches zero, delete its key; when the whole
// entry is gone, delete the ratchet and make [NO-SIZE] a plain blocker (ADR-0078).
//
// The baseline records IDENTITIES, not counts. A count is blind to substitution: fix
// one root and break another in the same directory and the number never moves, so the
// two properties the ratchet exists to guarantee — a rise blocks, a drop blocks — are
// both defeated at once, silently. Measured, not theorised: sizing `.atl-accordion-group`
// while leading `.atl-accordion-item` prose passed green under the counting version.
// A root's identity is its file plus its selector, with no line numbers, so it survives
// the churn the per-directory count was chosen to survive.
const observed = {};
for (const hit of noSize) (observed[hit.dir] = observed[hit.dir] || []).push(`${hit.rel} \`${hit.selector}\``);
for (const dir of Object.keys(observed)) observed[dir].sort();
// Both tolerate a value that is not a list, so a hand-edited or pre-identity file is
// reported by the shape guard below rather than crashing the run before it gets there.
const len = (v) => (Array.isArray(v) ? v.length : Number(v) || 0);
const sum = (roots) => Object.values(roots).reduce((a, b) => a + len(b), 0);
const sorted = (roots) =>
  Object.fromEntries(Object.keys(roots).sort().map((k) => [k, Array.isArray(roots[k]) ? [...roots[k]].sort() : roots[k]]));

if (!fs.existsSync(BASELINE_FILE) && !UPDATE_BASELINE) {
  console.error(
    `✗ [NO-SIZE] ${BASELINE_REL} is missing, so a regression against the recorded count would pass ` +
      `unnoticed. Restore it from git, or record today's counts with ` +
      `\`node tools/scripts/check-typeface.js --update-baseline\` and write the entry's \`why\`.`
  );
  process.exit(1);
}

const baseline = fs.existsSync(BASELINE_FILE)
  ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))
  : { meta: {}, checks: {} };
if (!baseline.checks) baseline.checks = {};
if (!baseline.checks['NO-SIZE']) baseline.checks['NO-SIZE'] = { kind: 'gap', why: '', perComponent: {} };
const entry = baseline.checks['NO-SIZE'];
const recorded = entry.perComponent || {};

if (UPDATE_BASELINE) {
  // A baseline recorded from a broken tree records the breakage. Every OTHER typeface
  // error is a plain blocker with a fix available today, and the [NO-SIZE] messages
  // send the reader here — so the documented remedy must not also be the command that
  // swallows a [DESCENDANT] or a [FONT-RAW] and prints a green line over it.
  if (errors.length > 0) {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error(
      `\n${errors.length} typeface issue(s) stand, so ${BASELINE_REL} was NOT written — a baseline ` +
        `recorded from a broken tree records the breakage. Fix these first, then re-run with ` +
        `--update-baseline.`
    );
    process.exit(1);
  }
  const next = sorted(observed);
  // Diff-stable: a no-op update must not rewrite `generatedAt` and leave a one-line
  // diff for someone to review.
  if (JSON.stringify(next) === JSON.stringify(sorted(recorded))) {
    console.log(`✓ baseline unchanged: ${BASELINE_REL} (NO-SIZE ${sum(recorded)} root(s)); not rewritten.`);
    process.exit(0);
  }
  const delta = sum(observed) - sum(recorded);
  entry.perComponent = next;
  baseline.meta = {
    ...baseline.meta,
    generatedAt: new Date().toISOString(),
    updatedBy: 'node tools/scripts/check-typeface.js --update-baseline',
  };
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(
    `✓ baseline updated: ${BASELINE_REL} (NO-SIZE ${sum(recorded)} → ${sum(observed)}, ` +
      `${delta === 0 ? 'same total, different roots' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`}).`
  );
  process.exit(0);
}

// A recorded root with no reason is the unclearable exemption ADR-0066 threw out, one
// abstraction up: nobody can retire a debt when nobody wrote down why it is not 0. And
// `kind` is required by the message that asks for it, so it is checked in the same
// condition — an unset one printed the literal string `undefined` in the green line.
if (!entry.why || !['design', 'gap'].includes(entry.kind)) {
  errors.push(
    `[NO-SIZE] the \`NO-SIZE\` entry in ${BASELINE_REL} records roots with no \`why\` or no valid \`kind\`, ` +
      `so a later reader cannot tell "decided against" from "forgotten" (ADR-0066). State why the debt ` +
      `stands, and set \`kind\` to \`design\` (a closed question) or \`gap\` (an unresolved defect).`
  );
}

for (const dir of [...new Set([...Object.keys(recorded), ...Object.keys(observed)])].sort()) {
  const want = recorded[dir] || [];
  const have = observed[dir] || [];
  if (!Array.isArray(want)) {
    errors.push(
      `[NO-SIZE] ${dir} in ${BASELINE_REL} records a count rather than the list of roots it stands for, so a ` +
        `new root hidden by a fixed one would pass. Re-record with ` +
        `\`node tools/scripts/check-typeface.js --update-baseline\`.`
    );
    continue;
  }
  const added = have.filter((root) => !want.includes(root));
  const gone = want.filter((root) => !have.includes(root));
  // Reported as two independent findings, not as a net delta: a substitution — one root
  // fixed, another broken — is a rise AND a drop, and a count reports it as neither.
  if (added.length) {
    errors.push(
      `[NO-SIZE] ${dir}: ${added.length} root(s) state --ui-line-height-normal and never a font-size that ` +
        `${BASELINE_REL} does not record — ${added.join(', ')}. A root that declares itself a prose surface ` +
        `and never states a size renders every line it does not size itself at the consuming page's size ` +
        `(16px in a default browser, whatever the app sets elsewhere). State the size on the same root, next ` +
        `to the leading: --ui-font-size-md for prose. \`font-size: inherit\` is not a size — it is this same ` +
        `defect spelled out. If the root must not size itself, record it with ` +
        `\`node tools/scripts/check-typeface.js --update-baseline\` and say why in the entry's \`why\`.`
    );
  }
  if (gone.length) {
    errors.push(
      `[NO-SIZE] ${dir}: ${gone.length} recorded root(s) no longer state --ui-line-height-normal without a ` +
        `font-size — ${gone.join(', ')}. An improvement that is not recorded can silently reverse. Run ` +
        `\`node tools/scripts/check-typeface.js --update-baseline\` to lock it in.`
    );
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} typeface issue(s) across ${checked} component stylesheet set(s).`);
  process.exit(1);
}
console.log(`✓ every component states its own typeface and leading on its root (${checked} component(s) × framework).`);
// A count with the reason inline, not one warning per occurrence — the shape
// ADR-0066 prescribed for a population nobody can act on today.
const debt = Object.keys(recorded)
  .sort()
  .map((dir) => `${dir} ${len(recorded[dir])}`)
  .join(', ');
console.log(
  `  [NO-SIZE] ${sum(observed)} prose root(s) state --ui-line-height-normal and no font-size, at the recorded ` +
    `baseline (${entry.kind}: ${debt || 'none'} — ${BASELINE_REL}).`
);
