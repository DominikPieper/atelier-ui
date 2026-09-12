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
 *     **The empty default applies only when `allowlistsFile` is absent.**
 *     When it IS supplied, the loaded module's exports are validated:
 *     `PRIMITIVE_TOKENS` must be an array and `PRIMITIVE_EXEMPTIONS` must be
 *     a `Map`. A module that fails to load resolution still throws
 *     `MODULE_NOT_FOUND` as before (unchanged, already loud); a module that
 *     DOES load but doesn't actually export those two names — a typo, a
 *     rename on one side only — used to be silently treated as the same
 *     "zero exemptions" default, which is exactly ADR-0124's failure class:
 *     the staleness scan skips (nothing to report) AND every real
 *     `PRIMITIVE_TOKENS` match goes undetected (nothing to forbid), and the
 *     rule reports a clean pass over a config that never actually loaded
 *     (2026-09-12 stylelint review, claim 2). Now a mis-shaped supplied
 *     module reports `[INVALID-ALLOWLISTS]` at `error` severity on every
 *     file this override touches, via `stylelint.utils.report()` rather than
 *     a thrown exception — a thrown error aborts the ENTIRE stylelint run
 *     (verified: one throwing rule turns the whole CLI invocation into a
 *     bare Node stack trace, exit 1, with no per-file breakdown and no
 *     structured formatter output for any other file), where `report()`
 *     keeps every other file's real findings intact, keeps `--formatter
 *     json` usable, and reuses the exact channel `[STALE]`/`[GAP]`/etc.
 *     already report through — the same tradeoff `validateOptions` above
 *     already makes for a malformed *option*; this is the same call for a
 *     malformed *file the option points at*.
 *
 * Formerly tools/scripts/check-primitives.js (check:token-tiers).
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const {
  REPO_ROOT,
  toRepoRelative,
  isNonEmptyString,
  normalizeRepoRelative,
} = require('./utils');

const ruleName = 'atelier/no-primitive-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (token, primitive) =>
    `[PRIMITIVE] references ${token} (${primitive.label}). Use ${primitive.useInstead}. ${primitive.why}`,
  stale: (key, kind) =>
    `[STALE] PRIMITIVE_EXEMPTIONS carries '${key}' (${kind}) but no component CSS under the configured componentRoot references it any more. Remove the entry.`,
  invalidAllowlists: (allowlistsFile, reason) =>
    `[INVALID-ALLOWLISTS] '${allowlistsFile}' ${reason} A supplied allowlistsFile must actually export both — a missing or misspelled export is a broken configuration, not the documented empty default (which only applies when allowlistsFile is omitted entirely).`,
});

const meta = {
  url: 'tools/stylelint-rules/no-primitive-token.js',
};

// Matches a `var(--ui-…)` READ inside a declaration's value.
const TOKEN_READ = /var\(\s*(--ui-[a-z0-9-]+)/g;

/** Human-readable description of what `require()` actually returned, for the
 *  `[INVALID-ALLOWLISTS]` message. */
function describeExport(value) {
  if (value === undefined) return 'is undefined (no such export)';
  if (Array.isArray(value)) return 'is an array';
  if (value instanceof Map) return 'is a Map';
  return `is a ${typeof value}`;
}

const allowlistsCache = new Map(); // absolute allowlistsFile path -> result below

/**
 * `{ module: null, invalidReason: null }` when `allowlistsFile` is absent —
 * the documented default for a scaffold, which starts with ZERO exemptions
 * (see header).
 *
 * When `allowlistsFile` IS supplied, the loaded module's shape is validated:
 * `PRIMITIVE_TOKENS` must be an array, `PRIMITIVE_EXEMPTIONS` must be a
 * `Map`. Either missing or wrongly-shaped yields `{ module: null,
 * invalidReason: <string> }` instead of silently falling back to the same
 * empty defaults the absent-option case uses — see header for why (claim 2).
 * A module that itself fails to `require()` (a typo'd PATH, not a typo'd
 * EXPORT) still throws `MODULE_NOT_FOUND` here, unchanged and already loud.
 */
function getAllowlists(allowlistsFile) {
  if (!allowlistsFile) return { module: null, invalidReason: null };
  const absPath = path.resolve(REPO_ROOT, allowlistsFile);
  if (!allowlistsCache.has(absPath)) {
    const required = require(absPath);
    const problems = [];
    if (!Array.isArray(required.PRIMITIVE_TOKENS)) {
      problems.push(
        `'PRIMITIVE_TOKENS' ${describeExport(required.PRIMITIVE_TOKENS)}, expected an array`,
      );
    }
    if (!(required.PRIMITIVE_EXEMPTIONS instanceof Map)) {
      problems.push(
        `'PRIMITIVE_EXEMPTIONS' ${describeExport(required.PRIMITIVE_EXEMPTIONS)}, expected a Map`,
      );
    }
    allowlistsCache.set(
      absPath,
      problems.length === 0
        ? { module: required, invalidReason: null }
        : { module: null, invalidReason: problems.join('; ') },
    );
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

// Computed at most once per (componentRoot, allowlistsFile) pair per process
// — one project's stylelint run only ever lints one project's files, but the
// module stays loaded (and its module-scope state with it) for every file in
// that run. Keyed on the PAIR, not on `componentRoot` alone: the scan result
// depends on which `PRIMITIVE_TOKENS` patterns it matched against, and that
// comes from `allowlistsFile` — two overrides sharing a `componentRoot` but
// pointing at different allowlists modules used to serve the first one's
// scan (and its `staleReportedForRoot` flag) to the second, silently
// suppressing the second's own staleness check (2026-09-12 stylelint review,
// claim 3, reproduced: a componentRoot processed second had its own
// genuinely-stale exemption go unreported once a differently-configured
// override sharing that root ran first in the same process).
function cacheKey(componentRoot, allowlistsFile) {
  // JSON-encode the tuple rather than joining with a separator character:
  // that's unambiguous no matter what either string contains, unlike a
  // literal join (space, NUL, or any other single character) which two
  // different (componentRoot, allowlistsFile) pairs could in principle
  // both produce.
  return JSON.stringify([componentRoot, allowlistsFile || '']);
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
          componentRoot: [isNonEmptyString],
          allowlistsFile: [isNonEmptyString],
        },
      },
    );
    if (!validOptions) return;

    // Normalized BEFORE the `inScope` compare below and before it's used in
    // any cache key — see `normalizeRepoRelative`'s header for why a raw
    // `componentRoot: './libs/react/src/lib'`, a trailing slash, or an
    // absolute path would otherwise disagree with `toRepoRelative(inputFile)`
    // and silently disable every staleness check for this override (claim 4).
    const rawComponentRoot = secondaryOptions && secondaryOptions.componentRoot;
    const componentRoot = rawComponentRoot
      ? normalizeRepoRelative(rawComponentRoot)
      : undefined;
    const allowlistsFile = secondaryOptions && secondaryOptions.allowlistsFile;
    const { module: allowlists, invalidReason } = getAllowlists(allowlistsFile);
    if (invalidReason) {
      stylelint.utils.report({
        message: messages.invalidAllowlists(allowlistsFile, invalidReason),
        node: root,
        result,
        ruleName,
      });
    }
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
    const rootKey = cacheKey(componentRoot, allowlistsFile);

    if (inScope && hasExemptions && !seenByRoot.has(rootKey)) {
      seenByRoot.set(
        rootKey,
        scanComponentRootForSeenKeys(
          path.resolve(REPO_ROOT, componentRoot),
          PRIMITIVE_TOKENS,
        ),
      );
    }
    const seenKeys =
      inScope && hasExemptions ? seenByRoot.get(rootKey) : new Set();

    // Allowlist hygiene, reported once per (componentRoot, allowlistsFile)
    // per run (anchored to whichever file happens to be first) — ADR-0034
    // requires this check to actually run, not just the per-occurrence
    // [GAP] warning below.
    if (inScope && hasExemptions && !staleReportedForRoot.has(rootKey)) {
      staleReportedForRoot.add(rootKey);
      for (const [exemptKey, entry] of PRIMITIVE_EXEMPTIONS) {
        if (!seenKeys.has(exemptKey)) {
          stylelint.utils.report({
            message: messages.stale(exemptKey, entry.kind),
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
