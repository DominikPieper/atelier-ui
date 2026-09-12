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
 * per `componentRoot` per process, against a direct filesystem scan of THAT
 * root's own `**\/*.css` tree, not any other project's — see that file's
 * header for the full reasoning and the one known gap (a root-asymmetric
 * exemption would be falsely reported stale by the root(s) that don't
 * reference it; none of today's four entries are asymmetric, verified
 * 2026-09-12).
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
 * THREE secondary options, all repo-relative POSIX paths, none guessed —
 * the config declares topology the way `no-undeclared-token`'s `tokenFiles`
 * already does:
 *   - `tokenFile` (required in practice): the single canonical token source
 *     to read DECLARED VALUES from (`tokenValue` below) — this repo passes
 *     the same `libs/create-workspace/.../tokens.css` `no-undeclared-token`
 *     uses. Omitted, `tokenValue` is `{}` and the family-match half of this
 *     rule silently finds nothing to match (the border-width half is
 *     unaffected — it never reads token values).
 *   - `componentRoot` (required for staleness): the one directory this
 *     invocation's `libs/<fw>/src/lib` (or a scaffold's own tree) lives at.
 *     Replaces a `frameworkOf()` regex that used to pattern-match the input
 *     file's path against `libs/(angular|react|vue)/src/lib/` to guess which
 *     of three hardcoded trees to scan — the config already knows which
 *     tree each Nx target lints (one target per project), so asking it to
 *     say so is not a bigger ask than `tokenFiles` already is. Omitted, the
 *     staleness scan (which needs a directory to walk) does not run; the
 *     per-declaration bypass/border check is unaffected — it never depended
 *     on knowing the framework, only on `dir` (a plain basename).
 *   - `allowlistsFile` (optional): repo-relative path to a CommonJS module
 *     exporting `TOKEN_BYPASS_EXEMPT`. This repo passes
 *     `tools/scripts/lib/allowlists.js`, unchanged. **Absent — the
 *     documented default for a scaffold, which starts with ZERO
 *     exemptions — `TOKEN_BYPASS_EXEMPT` is `{}`.** An empty exemption
 *     object also means the staleness scan is skipped outright, not just
 *     "runs and finds nothing": scanning a tree to police an empty map is
 *     work with no finding it could ever produce, so the scan (and the
 *     per-root cache it would populate) is short-circuited before it
 *     touches the filesystem. Loaded lazily, per file, from inside the rule
 *     closure (cached by resolved absolute path) rather than at module
 *     `require()` time — the old code's top-level `require('../scripts/lib/
 *     allowlists')` ran the instant `index.js` loaded this file into the
 *     `plugins` array, which happens whenever ANY rule in the plugin is
 *     used, whether or not `no-token-bypass` itself is turned on for that
 *     project. A scaffold has no such file at all, so that top-level
 *     `require()` would throw `MODULE_NOT_FOUND` merely from loading the
 *     plugin — before any config decision about whether to enable this rule
 *     even applies.
 *
 * Formerly tools/scripts/check-token-bypass.js (check:token-bypass).
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const { REPO_ROOT, toRepoRelative, isNonEmptyString } = require('./utils');

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

/** Token → value, read once per resolved `tokenFile` path from the light
 *  (`:root`) block of the canonical token source and cached by absolute
 *  path — the same single file for every framework, unlike
 *  no-undeclared-token's `tokenFiles`, because token-bypass never scopes to
 *  docs. Already a declared nx.json `stylelint` input since stage 1. */
function readTokenValues(absPath) {
  const tokensCss = fs
    .readFileSync(absPath, 'utf-8')
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

const tokenValueCache = new Map(); // absolute tokenFile path -> tokenValue map

/** `{}` when `tokenFile` is absent — the family-match check then never
 *  matches anything (nothing to compare against); the border-width check is
 *  unaffected, since it never reads token values. */
function getTokenValues(tokenFile) {
  if (!tokenFile) return {};
  const absPath = path.resolve(REPO_ROOT, tokenFile);
  if (!tokenValueCache.has(absPath)) {
    tokenValueCache.set(absPath, readTokenValues(absPath));
  }
  return tokenValueCache.get(absPath);
}

const allowlistsCache = new Map(); // absolute allowlistsFile path -> its exports

/** `null` when `allowlistsFile` is absent — the documented default for a
 *  scaffold, which starts with ZERO exemptions (see header). */
function getAllowlists(allowlistsFile) {
  if (!allowlistsFile) return null;
  const absPath = path.resolve(REPO_ROOT, allowlistsFile);
  if (!allowlistsCache.has(absPath)) {
    allowlistsCache.set(absPath, require(absPath));
  }
  return allowlistsCache.get(absPath);
}

/** Which declared tokens in `family` hold exactly `value`. */
function tokensHolding(value, family, tokenValue) {
  return Object.keys(tokenValue).filter(
    (name) => family.test(name) && tokenValue[name] === value,
  );
}

/**
 * Every `TOKEN_BYPASS_EXEMPT` key (`<dir>:<prop>:<value>`) actually
 * referenced anywhere under `componentRoot`'s own `**\/*.css` — a direct
 * filesystem scan over raw text (no PostCSS AST available here), independent
 * of which files stylelint hands this rule during this run.
 */
function scanComponentRootForSeenKeys(absBase, tokenValue) {
  const seen = new Set();
  if (!fs.existsSync(absBase)) return seen;
  for (const dir of fs.readdirSync(absBase)) {
    const dirPath = path.join(absBase, dir);
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
        if (tokensHolding(value, family, tokenValue).length > 0) {
          seen.add(`${dir}:${prop}:${value}`);
        }
      }
    }
  }
  return seen;
}

const seenByRoot = new Map();
const staleReportedForRoot = new Set();

/** @type {import('stylelint').Rule} */
const rule = (primary, secondaryOptions) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(
      result,
      ruleName,
      { actual: primary, possible: [true] },
      {
        actual: secondaryOptions,
        possible: {
          tokenFile: [isNonEmptyString],
          componentRoot: [isNonEmptyString],
          allowlistsFile: [isNonEmptyString],
        },
      },
    );
    if (!validOptions) return;

    const componentRoot = secondaryOptions && secondaryOptions.componentRoot;
    const tokenValue = getTokenValues(
      secondaryOptions && secondaryOptions.tokenFile,
    );
    const allowlists = getAllowlists(
      secondaryOptions && secondaryOptions.allowlistsFile,
    );
    const TOKEN_BYPASS_EXEMPT =
      (allowlists && allowlists.TOKEN_BYPASS_EXEMPT) || {};

    const inputFile = root.source && root.source.input.file;
    const relFile = inputFile ? toRepoRelative(inputFile) : undefined;
    const dir = relFile ? path.basename(path.dirname(relFile)) : undefined;
    const inScope =
      Boolean(componentRoot) &&
      Boolean(relFile) &&
      (relFile === componentRoot || relFile.startsWith(`${componentRoot}/`));
    // Scanning a tree to police an empty map is work with no finding it
    // could ever produce — skip the scan (and the staleness report loop)
    // outright rather than run it and find nothing, every file, forever.
    const hasExemptions = Object.keys(TOKEN_BYPASS_EXEMPT).length > 0;

    if (inScope && hasExemptions && !seenByRoot.has(componentRoot)) {
      seenByRoot.set(
        componentRoot,
        scanComponentRootForSeenKeys(
          path.resolve(REPO_ROOT, componentRoot),
          tokenValue,
        ),
      );
    }
    const seenKeys =
      inScope && hasExemptions ? seenByRoot.get(componentRoot) : new Set();

    // Allowlist hygiene, reported once per componentRoot's run — see
    // no-primitive-token.js for why this is the anchor and its limitation.
    if (inScope && hasExemptions && !staleReportedForRoot.has(componentRoot)) {
      staleReportedForRoot.add(componentRoot);
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
      const holders = tokensHolding(value, family, tokenValue);
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
