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
 * this rule `require()`s that file directly rather than duplicating or
 * relocating it. That file's own header calls it "the single source of truth
 * for the gates' hand-maintained EXCEPTIONS"; a stylelint rule enforcing a
 * CSS-discipline invariant is the same kind of consumer a script gate was,
 * so splitting these two maps out to live beside the rule instead would cost
 * an auditor a second file to check for no structural gain. Same two kinds
 * as every other allowlist there (ADR-0034): `kind: 'design'` is a closed
 * question and stays silent; `kind: 'gap'` should bind and hasn't yet, and
 * warns on every run — via a per-message `severity: 'warning'` override,
 * since stylelint applies severity per report(), not just per rule.
 *
 * Staleness (ADR-0034: an allowlist entry naming something that no longer
 * exists, or no longer violates, is itself a blocker) is checked once per
 * process against a direct filesystem scan of THIS framework's own
 * `libs/<fw>/src/lib/**\/*.css` — not the other two frameworks', because Nx
 * wires one `stylelint` target per framework project, and reading a SIBLING
 * project's files from inside this one is the undeclared cross-project input
 * trap ADR-0126's Consequences names (nx.json declares this rule's own
 * `require()`s, not another project's tree). Every entry in
 * `PRIMITIVE_EXEMPTIONS` today is referenced identically in all three
 * frameworks' mirrored CSS (verified 2026-09-12), so a per-framework scan
 * agrees with the retired script's whole-repo one for everything that exists
 * now. The gap this leaves: an exemption that is legitimately
 * framework-asymmetric (bound in only one or two of the three) would be
 * reported stale by the framework(s) that don't reference it — a real
 * narrowing from the retired script's single-process, any-of-three view. No
 * entry today is asymmetric; if one becomes so, widen the scan here.
 *
 * Scope is deliberately component CSS only — every framework's own
 * `src/lib` component stylesheets — because the token source declares
 * primitives (that's its job) and the docs app is a consumer like any other
 * product surface. Wired only on that override block in
 * stylelint.config.mjs, never on docs'.
 *
 * Formerly tools/scripts/check-primitives.js (check:token-tiers).
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const { REPO_ROOT, toRepoRelative } = require('./utils');
const {
  PRIMITIVE_TOKENS,
  PRIMITIVE_EXEMPTIONS,
} = require('../scripts/lib/allowlists');

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

/** Which framework's tree `absFile` belongs to, or null if it's outside all three. */
function frameworkOf(absFile) {
  const m = toRepoRelative(absFile).match(
    /^libs\/(angular|react|vue)\/src\/lib\//,
  );
  return m ? m[1] : null;
}

/**
 * Every `PRIMITIVE_EXEMPTIONS` key (`<dir>:<token>`) actually referenced
 * anywhere in `libs/<fw>/src/lib/**\/*.css` — a direct filesystem scan,
 * independent of which files stylelint itself hands this rule during this
 * run, so staleness is computed correctly even for a file this particular
 * invocation never visits.
 */
function scanFrameworkForSeenKeys(fw) {
  const seen = new Set();
  const base = path.join(REPO_ROOT, 'libs', fw, 'src/lib');
  if (!fs.existsSync(base)) return seen;
  for (const dir of fs.readdirSync(base)) {
    const dirPath = path.join(base, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const entry of fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith('.css'))) {
      const css = fs.readFileSync(path.join(dirPath, entry), 'utf-8');
      for (const m of css.matchAll(TOKEN_READ)) {
        const token = m[1];
        if (PRIMITIVE_TOKENS.some((p) => p.match.test(token))) {
          seen.add(`${dir}:${token}`);
        }
      }
    }
  }
  return seen;
}

// Computed at most once per framework per process — one project's stylelint
// run only ever lints one framework's files, but the module stays loaded
// (and its module-scope state with it) for every file in that run.
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

    // Allowlist hygiene, reported once per framework's run (anchored to
    // whichever file happens to be first) — ADR-0034 requires this check to
    // actually run, not just the per-occurrence [GAP] warning below.
    if (fw && !staleReportedForFramework.has(fw)) {
      staleReportedForFramework.add(fw);
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
