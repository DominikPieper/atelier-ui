'use strict';

/**
 * atelier/no-token-bypass
 *
 * Catches a literal whose value a token already holds — the one kind of
 * unbound value that is objectively wrong. This rule deliberately does NOT
 * demand that every value be a token: of the ~190 literals in the component
 * stylesheets, most are component dimensions (an avatar size, a toggle
 * track, a step circle) with exactly one user, and tokenising them would
 * produce a hundred single-use tokens — the rule of three violated in token
 * form. What IS wrong is a literal that duplicates a token in the FAMILY its
 * own property should draw from — two real, invisible defects were found
 * this way (AtlTab and AtlCodeBlock's header both hardcoding `2.5rem` where
 * `--ui-control-height-md` already said 2.5rem, ADR-0047).
 *
 * Family per property (z-index → --ui-z-*, opacity → --ui-opacity-*,
 * font-size/line-height/font-weight/letter-spacing → their own --ui-* family,
 * border-radius → --ui-radius-*, box-shadow → --ui-shadow-*, transition/
 * animation-duration → --ui-duration-*, padding/margin/gap → --ui-spacing-*,
 * min-height/height/width/min-width → --ui-control-height-*), so the rule
 * never suggests a spacing token for a width. Border widths get their own
 * check: any literal length on a `border*` property is a bypass, because
 * `--ui-border-width`/`--ui-border-width-thick` are the only two values that
 * family holds and neither aliases a "normal" CSS default the way `0` does.
 *
 * `TOKEN_BYPASS_EXEMPT` (kept in tools/scripts/lib/allowlists.js — see
 * no-primitive-token.js's header for why these exemption maps were not
 * relocated out of that file) carries the same two kinds as every other
 * allowlist there (ADR-0034): `kind: 'design'` — the shared value is a
 * coincidence, binding it would be wrong — stays silent; `kind: 'gap'` — it
 * should bind and hasn't yet — warns on every run via a per-report
 * `severity: 'warning'` override.
 *
 * Staleness is checked the same way no-primitive-token.js checks it: once
 * per framework per process, against a direct filesystem scan of THIS
 * framework's own `libs/<fw>/src/lib/**\/*.css`, not the other two — see that
 * file's header for the full reasoning and the one known gap (a
 * framework-asymmetric exemption would be falsely reported stale by the
 * framework(s) that don't reference it; none of today's four entries are
 * asymmetric, verified 2026-09-12).
 *
 * One thing this port improves rather than copies: the retired script
 * hand-rolled a `(^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+)` regex over
 * comment-stripped CSS text to recover `prop: value` pairs. A stylelint rule
 * gets that for free, correctly, from `root.walkDecls` — no hand-rolled
 * parsing needed for the per-file violation check. The pre-scan used only
 * for staleness still uses the same regex, because at that point there is no
 * PostCSS AST — it exists purely to answer "is this literal referenced
 * anywhere", not to attribute a violation to a location.
 *
 * Scope is deliberately component CSS only — every framework's own
 * `src/lib` component stylesheets — the retired script never touched the
 * docs app, and neither does this rule.
 *
 * Formerly tools/scripts/check-token-bypass.js (check:token-bypass).
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const { REPO_ROOT, toRepoRelative } = require('./utils');
const { TOKEN_BYPASS_EXEMPT } = require('../scripts/lib/allowlists');

const ruleName = 'atelier/no-token-bypass';

const messages = stylelint.utils.ruleMessages(ruleName, {
  bypass: (prop, value, holders) =>
    `[BYPASS] sets ${prop}: ${value}, which is exactly what ${holders
      .map((h) => `var(${h})`)
      .join(
        ' / ',
      )} holds. Bind it, or exempt it in TOKEN_BYPASS_EXEMPT with a reason.`,
  border: (prop, value) =>
    `[BORDER] sets ${prop}: ${value} with a literal width. Use var(--ui-border-width) ` +
    'or var(--ui-border-width-thick); if the value is a graphic device rather than a border ' +
    'weight, exempt it in TOKEN_BYPASS_EXEMPT with a reason.',
  stale: (key) =>
    `[STALE-EXEMPT] TOKEN_BYPASS_EXEMPT lists '${key}', but no stylesheet in this framework has that literal any more. Remove the entry.`,
});

const meta = {
  url: 'tools/stylelint-rules/no-token-bypass.js',
};

const TOKEN_SOURCE = path.join(
  REPO_ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css',
);

/** Which token family a property may draw from. Copied verbatim from the retired script. */
const FAMILY = {
  'z-index': /^--ui-z-/,
  opacity: /^--ui-opacity-/,
  'letter-spacing': /^--ui-letter-spacing-/,
  'font-weight': /^--ui-font-weight-/,
  'font-size': /^--ui-font-size-/,
  'line-height': /^--ui-line-height-/,
  'border-radius': /^--ui-radius-/,
  'box-shadow': /^--ui-shadow-/,
  'transition-duration': /^--ui-duration-/,
  'animation-duration': /^--ui-duration-/,
  padding: /^--ui-spacing-/,
  'padding-top': /^--ui-spacing-/,
  'padding-right': /^--ui-spacing-/,
  'padding-bottom': /^--ui-spacing-/,
  'padding-left': /^--ui-spacing-/,
  margin: /^--ui-spacing-/,
  'margin-top': /^--ui-spacing-/,
  'margin-right': /^--ui-spacing-/,
  'margin-bottom': /^--ui-spacing-/,
  'margin-left': /^--ui-spacing-/,
  gap: /^--ui-spacing-/,
  'row-gap': /^--ui-spacing-/,
  'column-gap': /^--ui-spacing-/,
  'min-height': /^--ui-control-height-/,
  height: /^--ui-control-height-/,
  width: /^--ui-control-height-/,
  'min-width': /^--ui-control-height-/,
};

/** Border widths get their own rule: any literal length is a bypass. */
const BORDER_PROP = /^border(-top|-right|-bottom|-left)?(-width)?$/;

/** Values that mean "nothing", not "a measurement". */
const STRUCTURAL = new Set([
  '0',
  'none',
  'auto',
  'inherit',
  'initial',
  'unset',
  'currentColor',
  'transparent',
]);

/** Token → value, read once from the light (`:root`) block of the canonical
 *  token source — the same single file for every framework, unlike
 *  no-undeclared-token's `tokenFiles`, because token-bypass never scopes to
 *  docs. Already a declared nx.json `stylelint` input since stage 1. */
function readTokenValues() {
  const tokensCss = fs
    .readFileSync(TOKEN_SOURCE, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const darkAt = tokensCss.indexOf('@media (prefers-color-scheme: dark)');
  const lightBlock = darkAt === -1 ? tokensCss : tokensCss.slice(0, darkAt);
  const tokenValue = {};
  for (const m of lightBlock.matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const value = m[2].trim();
    if (value.startsWith('var(')) continue; // an alias, not a value of its own
    tokenValue[m[1]] = value;
  }
  return tokenValue;
}
const tokenValue = readTokenValues();

/** Which declared tokens in `family` hold exactly `value`. */
function tokensHolding(value, family) {
  return Object.keys(tokenValue).filter(
    (name) => family.test(name) && tokenValue[name] === value,
  );
}

/** Which framework's tree `absFile` belongs to, or null if it's outside all three. */
function frameworkOf(absFile) {
  const m = toRepoRelative(absFile).match(
    /^libs\/(angular|react|vue)\/src\/lib\//,
  );
  return m ? m[1] : null;
}

/**
 * Every `TOKEN_BYPASS_EXEMPT` key (`<dir>:<prop>:<value>`) actually
 * referenced anywhere in `libs/<fw>/src/lib/**\/*.css` — a direct filesystem
 * scan over raw text (no PostCSS AST available here), independent of which
 * files stylelint hands this rule during this run.
 */
function scanFrameworkForSeenKeys(fw) {
  const seen = new Set();
  const base = path.join(REPO_ROOT, 'libs', fw, 'src/lib');
  if (!fs.existsSync(base)) return seen;
  for (const dir of fs.readdirSync(base)) {
    const dirPath = path.join(base, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.css'))) {
      const css = fs
        .readFileSync(path.join(dirPath, file), 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/(^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+)/g)) {
        const prop = m[2];
        const value = m[3].trim().replace(/\s+/g, ' ');
        if (value.includes('var(--ui-')) continue;
        if (STRUCTURAL.has(value)) continue;

        if (BORDER_PROP.test(prop)) {
          const width = value.match(/^([\d.]+)(px|rem|em)\b/);
          if (width) seen.add(`${dir}:${prop}:${width[0]}`);
          continue;
        }
        const family = FAMILY[prop];
        if (!family) continue;
        if (tokensHolding(value, family).length > 0) {
          seen.add(`${dir}:${prop}:${value}`);
        }
      }
    }
  }
  return seen;
}

const seenByFramework = new Map();
const staleReportedForFramework = new Set();

/** @type {import('stylelint').Rule} */
const rule = (primary) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });
    if (!validOptions) return;

    const inputFile = root.source && root.source.input.file;
    const fw = inputFile ? frameworkOf(inputFile) : null;
    const relFile = inputFile ? toRepoRelative(inputFile) : undefined;
    const dir = relFile ? path.basename(path.dirname(relFile)) : undefined;

    if (fw && !seenByFramework.has(fw)) {
      seenByFramework.set(fw, scanFrameworkForSeenKeys(fw));
    }
    const seenKeys = fw ? seenByFramework.get(fw) : new Set();

    // Allowlist hygiene, reported once per framework's run — see
    // no-primitive-token.js for why this is the anchor and its limitation.
    if (fw && !staleReportedForFramework.has(fw)) {
      staleReportedForFramework.add(fw);
      for (const key of Object.keys(TOKEN_BYPASS_EXEMPT)) {
        if (!seenKeys.has(key)) {
          stylelint.utils.report({
            message: messages.stale(key),
            node: root,
            result,
            ruleName,
          });
        }
      }
    }

    root.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase();
      const value = decl.value.trim().replace(/\s+/g, ' ');
      if (value.includes('var(--ui-')) return;
      if (STRUCTURAL.has(value)) return;

      if (BORDER_PROP.test(prop)) {
        const width = value.match(/^([\d.]+)(px|rem|em)\b/);
        if (!width) return;

        const key = `${dir}:${prop}:${width[0]}`;
        const exempt = TOKEN_BYPASS_EXEMPT[key];
        if (exempt) {
          if (exempt.kind === 'gap') {
            stylelint.utils.report({
              message: `[GAP] ${prop}: ${width[0]} still unbound. ${exempt.why}`,
              node: decl,
              result,
              ruleName,
              severity: 'warning',
            });
          }
          return;
        }
        stylelint.utils.report({
          message: messages.border(prop, value),
          node: decl,
          result,
          ruleName,
        });
        return;
      }

      const family = FAMILY[prop];
      if (!family) return;
      const holders = tokensHolding(value, family);
      if (holders.length === 0) return;

      const key = `${dir}:${prop}:${value}`;
      const exempt = TOKEN_BYPASS_EXEMPT[key];
      if (exempt) {
        if (exempt.kind === 'gap') {
          stylelint.utils.report({
            message: `[GAP] ${prop}: ${value} should bind to var(${holders[0]}). ${exempt.why}`,
            node: decl,
            result,
            ruleName,
            severity: 'warning',
          });
        }
        return;
      }
      stylelint.utils.report({
        message: messages.bypass(prop, value, holders),
        node: decl,
        result,
        ruleName,
      });
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = stylelint.createPlugin(ruleName, rule);
