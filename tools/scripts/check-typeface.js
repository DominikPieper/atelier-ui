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
 *   [RESET-AFTER]  `all: unset` resets font-family, so a declaration before it in
 *                  the same rule does nothing. This one is measured-from-experience:
 *                  the dialog's declaration was silently wiped exactly this way.
 *
 * `font-family: inherit` is not a declaration of the typeface — it is a form
 * control refusing the UA font — and is ignored here.
 *
 * Run via:  node tools/scripts/check-typeface.js  (or  npm run check:typeface)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS } = require('./lib/component-discovery');

const ROOT = path.resolve(__dirname, '../..');
const FAMILY_TOKENS = /var\(--ui-font-(family|display|mono)\)/;

const errors = [];
let checked = 0;

/**
 * Is this selector a root rather than something inside one? Decided structurally:
 * a root is one compound selector with no descendant or child combinator. Deriving
 * the class from the directory name does not work — `tabs/` renders
 * `.atl-tab-group`, `drawer/` renders `.atl-drawer-host`.
 */
function isRootSelector(selector) {
  const sel = selector.trim();
  if (/^:host\b/.test(sel)) return !/[ >+~]/.test(sel.replace(/:host\([^)]*\)/, ':host'));
  if (!sel.startsWith('.atl-')) return false;
  return !/[ >+~]/.test(sel);
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
    // Tied to the rule that carries the typeface rather than to any root-shaped
    // selector: `.atl-combobox-input` has no combinator either, so a structural
    // test accepted a descendant and let two comboboxes through.
    let rootFamilyRules = 0;
    let rootFamilyRulesWithLeading = 0;
    for (const file of files) {
      const rel = `libs/${fw}/src/lib/${dir}/${file}`;
      const css = fs.readFileSync(path.join(dirPath, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

      for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        // The crude rule splitter can run a preceding `:is( … )` list into this
        // selector; report the last comma-separated part, which is the one the
        // declaration actually belongs to.
        const parts = rule[1].split(/,(?![^(]*\))/);
        const selector = parts[parts.length - 1].trim().replace(/\s+/g, ' ');
        const body = rule[2];
        const decl = /(^|;)\s*font-family\s*:\s*([^;]+)/.exec(body);
        if (!decl) continue;
        const value = decl[2].trim();
        if (value === 'inherit') continue; // a control refusing the UA font
        if (!FAMILY_TOKENS.test(value)) continue; // a literal stack is check:css-tokens' business

        declaresSomewhere = true;


        // --ui-font-mono and --ui-font-display are content typefaces: the code
        // element and the one display line carry them, not the component root.
        const isContentFace = /var\(--ui-font-(mono|display)\)/.test(value);
        // An element that resets everything with `all: unset` has to restate the
        // typeface itself — inheritance cannot reach it.
        const resetsItself = /(^|;)\s*all\s*:\s*(unset|initial|revert)/.test(body);

        if (isRootSelector(selector) && !isContentFace) {
          rootFamilyRules++;
          if (/(^|;)\s*line-height\s*:/.test(body)) rootFamilyRulesWithLeading++;
        }

        if (!isRootSelector(selector) && !isContentFace && !resetsItself) {
          errors.push(
            `[DESCENDANT] ${rel} declares the typeface on \`${selector}\`, which is not the component root. ` +
              `Declare it once on the root so the component is right wherever it renders.`
          );
        }

        // A reset AFTER the declaration wipes it. (The dialog's declaration was
        // silently wiped exactly this way — and the first version of this check had
        // the comparison the wrong way round, flagging the correct order instead.)
        const afterDecl = body.slice(decl.index + decl[0].length);
        if (/(^|;)\s*all\s*:\s*(unset|initial|revert)/.test(afterDecl)) {
          errors.push(
            `[RESET-WIPED] ${rel} declares the typeface on \`${selector}\` and then resets it with \`all: unset\` ` +
              `further down the same rule, so the declaration does nothing. Move it below the reset.`
          );
        }
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

if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} typeface issue(s) across ${checked} component stylesheet set(s).`);
  process.exit(1);
}
console.log(`✓ every component states its own typeface and leading on its root (${checked} component(s) × framework).`);
