'use strict';

/**
 * atelier/no-primitive-token
 *
 * ADR-0018 tiers tokens primitive → semantic → component. Component CSS is
 * meant to read the semantic tier — `--ui-color-primary`, not the ramp step
 * behind it; `--ui-type-code`, not the font stack it names. A component that
 * reaches past the semantic tier into a primitive re-decides, in one
 * stylesheet, something the token layer already decided for everyone, and it
 * does so invisibly (the result looks right in that one component). Two ADRs
 * left exactly this hole open: ADR-0036 (a component could name
 * `--ui-font-display` directly and pair it with a weight the face doesn't
 * have) and ADR-0038 (a component could name a `--ui-color-teal-*` ramp step
 * directly, pinning it to one theme's shade of the brand colour).
 *
 * `PRIMITIVE_TOKENS` (the forbidden patterns, with what to use instead and
 * why) and `PRIMITIVE_EXEMPTIONS` (the `<component-dir>:<token>` pairs that
 * may reference one anyway) both stay in `tools/scripts/lib/allowlists.js` —
 * this rule reaches that file through the `allowlistsFile` secondary option
 * (see below) rather than duplicating or relocating it. That file's own
 * header calls it "the single source of truth for the gates' hand-maintained
 * EXCEPTIONS"; a stylelint rule enforcing a CSS-discipline invariant is the
 * same kind of consumer a script gate was, so splitting these two maps out
 * to live beside the rule instead would cost an auditor a second file to
 * check for no structural gain. Same two kinds as every other allowlist
 * there (ADR-0034): `kind: 'design'` is a closed question and stays silent;
 * `kind: 'gap'` should bind and hasn't yet, and warns on every run — via a
 * per-message `severity: 'warning'` override, since stylelint applies
 * severity per report(), not just per rule.
 *
 * Staleness (ADR-0034: an allowlist entry naming something that no longer
 * exists, or no longer violates, is itself a blocker) is checked once per
 * `componentRoot` per process against a direct filesystem scan of THAT
 * root's own `**\/*.css` — not any other project's, because Nx wires one
 * `stylelint` target per project, and reading a SIBLING project's files from
 * inside this one is the undeclared cross-project input trap ADR-0126's
 * Consequences names (nx.json declares this rule's own inputs, not another
 * project's tree). Every entry in `PRIMITIVE_EXEMPTIONS` today is referenced
 * identically in all three frameworks' mirrored CSS (verified 2026-09-12),
 * so a per-`componentRoot` scan agrees with the retired script's whole-repo
 * one for everything that exists now. The gap this leaves: an exemption that
 * is legitimately framework-asymmetric (bound in only one or two of the
 * three) would be reported stale by the root(s) that don't reference it — a
 * real narrowing from the retired script's single-process, any-of-three
 * view. No entry today is asymmetric; if one becomes so, widen the scan
 * here.
 *
 * Scope is deliberately component CSS only — every framework's own
 * `src/lib` component stylesheets — because the token source declares
 * primitives (that's its job) and the docs app is a consumer like any other
 * product surface. Wired only on that override block in
 * stylelint.config.mjs, never on docs'.
 *
 * TWO secondary options, both repo-relative POSIX paths, neither guessed —
 * the config declares topology the way `no-undeclared-token`'s `tokenFiles`
 * already does:
 *   - `componentRoot` (required for staleness): the one directory this
 *     invocation's `libs/<fw>/src/lib` (or a scaffold's own tree) lives at.
 *     Replaces a `frameworkOf()` regex that used to pattern-match the input
 *     file's path against `libs/(angular|react|vue)/src/lib/` to guess which
 *     of three hardcoded trees to scan. Omitted, the staleness scan does not
 *     run; the per-declaration primitive check is unaffected — it never
 *     depended on knowing the framework, only on `dir` (a plain basename).
 *   - `allowlistsFile` (optional): repo-relative path to a CommonJS module
 *     exporting `PRIMITIVE_TOKENS` and `PRIMITIVE_EXEMPTIONS`. This repo
 *     passes `tools/scripts/lib/allowlists.js`, unchanged. **Absent — the
 *     documented default for a scaffold, which starts with ZERO
 *     exemptions — `PRIMITIVE_TOKENS` is `[]` and `PRIMITIVE_EXEMPTIONS` is
 *     an empty `Map`.** An empty `PRIMITIVE_TOKENS` makes the whole rule a
 *     no-op (nothing left to forbid), which is exactly the shape a rule
 *     nobody configured should have. An empty `PRIMITIVE_EXEMPTIONS` also
 *     means the staleness scan is skipped outright, not just "runs and finds
 *     nothing": scanning a tree to police an empty map is work with no
 *     finding it could ever produce, so the scan (and the per-root cache it
 *     would populate) is short-circuited before it touches the filesystem.
 *     Loaded lazily, per file, from inside the rule closure (cached by
 *     resolved absolute path) rather than at module `require()` time — the
 *     old code's top-level `require('../scripts/lib/allowlists')` ran the
 *     instant `index.js` loaded this file into the `plugins` array, which
 *     happens whenever ANY rule in the plugin is used, whether or not
 *     `no-primitive-token` itself is turned on for that project. A scaffold
 *     has no such file at all, so that top-level `require()` would throw
 *     `MODULE_NOT_FOUND` merely from loading the plugin — before any config
 *     decision about whether to enable this rule even applies.
 *
 * Formerly tools/scripts/check-primitives.js (check:token-tiers).
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const { REPO_ROOT, toRepoRelative, isNonEmptyString } = require('./utils');

const ruleName = 'atelier/no-primitive-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (token, primitive) =>
    `[PRIMITIVE] references ${token} (${primitive.label}). Use ${primitive.useInstead}. ${primitive.why}`,
  stale: (key, kind) =>
    `[STALE] PRIMITIVE_EXEMPTIONS carries '${key}' (${kind}) but no component CSS in this framework references it any more. Remove the entry.`,
});

const meta = {
  url: 'tools/stylelint-rules/no-primitive-token.js',
};

// Matches a `var(--ui-…)` READ inside a declaration's value.
const TOKEN_READ = /var\(\s*(--ui-[a-z0-9-]+)/g;

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

/**
 * Every `PRIMITIVE_EXEMPTIONS` key (`<dir>:<token>`) actually referenced
 * anywhere under `componentRoot`'s own `**\/*.css` — a direct filesystem
 * scan, independent of which files stylelint itself hands this rule during
 * this run, so staleness is computed correctly even for a file this
 * particular invocation never visits.
 */
function scanComponentRootForSeenKeys(absBase, primitiveTokens) {
  const seen = new Set();
  if (!fs.existsSync(absBase)) return seen;
  for (const dir of fs.readdirSync(absBase)) {
    const dirPath = path.join(absBase, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const entry of fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.css'))) {
      const css = fs.readFileSync(path.join(dirPath, entry), 'utf-8');
      for (const m of css.matchAll(TOKEN_READ)) {
        const token = m[1];
        if (primitiveTokens.some((p) => p.match.test(token))) {
          seen.add(`${dir}:${token}`);
        }
      }
    }
  }
  return seen;
}

// Computed at most once per componentRoot per process — one project's
// stylelint run only ever lints one project's files, but the module stays
// loaded (and its module-scope state with it) for every file in that run.
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
          componentRoot: [isNonEmptyString],
          allowlistsFile: [isNonEmptyString],
        },
      },
    );
    if (!validOptions) return;

    const componentRoot = secondaryOptions && secondaryOptions.componentRoot;
    const allowlists = getAllowlists(
      secondaryOptions && secondaryOptions.allowlistsFile,
    );
    const PRIMITIVE_TOKENS = (allowlists && allowlists.PRIMITIVE_TOKENS) || [];
    const PRIMITIVE_EXEMPTIONS =
      (allowlists && allowlists.PRIMITIVE_EXEMPTIONS) || new Map();

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
    const hasExemptions = PRIMITIVE_EXEMPTIONS.size > 0;

    if (inScope && hasExemptions && !seenByRoot.has(componentRoot)) {
      seenByRoot.set(
        componentRoot,
        scanComponentRootForSeenKeys(
          path.resolve(REPO_ROOT, componentRoot),
          PRIMITIVE_TOKENS,
        ),
      );
    }
    const seenKeys =
      inScope && hasExemptions ? seenByRoot.get(componentRoot) : new Set();

    // Allowlist hygiene, reported once per componentRoot's run (anchored to
    // whichever file happens to be first) — ADR-0034 requires this check to
    // actually run, not just the per-occurrence [GAP] warning below.
    if (inScope && hasExemptions && !staleReportedForRoot.has(componentRoot)) {
      staleReportedForRoot.add(componentRoot);
      for (const [key, entry] of PRIMITIVE_EXEMPTIONS) {
        if (!seenKeys.has(key)) {
          stylelint.utils.report({
            message: messages.stale(key, entry.kind),
            node: root,
            result,
            ruleName,
          });
        }
      }
    }

    root.walkDecls((decl) => {
      for (const match of decl.value.matchAll(TOKEN_READ)) {
        const token = match[1];
        const primitive = PRIMITIVE_TOKENS.find((p) => p.match.test(token));
        if (!primitive) continue;

        const key = `${dir}:${token}`;
        const exemption = PRIMITIVE_EXEMPTIONS.get(key);
        if (exemption) {
          if (exemption.kind === 'gap') {
            stylelint.utils.report({
              message: `[GAP] ${key} — ${exemption.reason}`,
              node: decl,
              result,
              ruleName,
              severity: 'warning',
            });
          }
          continue;
        }

        stylelint.utils.report({
          message: messages.rejected(token, primitive),
          node: decl,
          result,
          ruleName,
        });
      }
    });
  };
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = stylelint.createPlugin(ruleName, rule);
