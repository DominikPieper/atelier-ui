'use strict';

/**
 * atelier/no-undeclared-token
 *
 * Every `--ui-*` custom property a stylesheet READS via `var(--ui-x, ...)`
 * must be declared somewhere in the token source(s) named by the `tokenFiles`
 * secondary option (repo-root-relative paths, e.g.
 * `['libs/create-workspace/src/generators/preset/files/styles/tokens.css']`).
 * A `var()` fallback is what makes an undeclared reference silent: the
 * component still renders, plausibly, at a value the design system does not
 * control. Two real incidents motivated this (not hypothetical):
 *
 *   - all three code-block stylesheets read `var(--ui-font-mono, …)` while
 *     nothing declared it, so every code block silently rendered in the
 *     Menlo fallback until ADR-0035 declared the token.
 *   - AtlTooltip read `var(--ui-z-tooltip, 200)`, which no token source had
 *     ever declared, so the tooltip's stacking level was the literal 200
 *     while every other floating layer used --ui-z-dropdown (ADR-0075).
 *
 * `tokenFiles` is a required secondary option, not a hardcoded path, because
 * the declared-token SET differs by scope: component CSS is checked only
 * against the shared `tokens.css` (one file, three frameworks' own copies
 * kept byte-identical to it by `check:tokens`), while the docs site's CSS is
 * checked against that file UNION `docs/src/styles/docs-theme.css` (which
 * both declares docs-only tokens and re-declares/overrides some `--ui-*`
 * ones). A stylelint config wires the two scopes to two different
 * `tokenFiles` lists via per-glob overrides, rather than this rule guessing
 * which file(s) apply to which CSS.
 *
 * `--ui-` itself (as opposed to `--docs-*` or any other custom-property
 * prefix) is NOT an option: unlike `tokenFiles`, there is no known reason
 * this repo would ever want to police a different prefix, so it stays a
 * constant the way `atelier/host-attr-guard`'s `HOST_GUARD_KEY` does.
 *
 * Reports once per `var(--ui-x)` occurrence, attributed to the declaration
 * that reads it — the formerly-`check-css-tokens.js` script instead
 * aggregated one message per undeclared token name across the whole repo
 * ("read by N component stylesheet(s)"); a linter reporting per file, at
 * the exact line, is the more useful shape for the same fact and is what a
 * `root.walkDecls` visitor naturally produces.
 *
 * Formerly Pass C of `tools/scripts/check-css-tokens.js`.
 */

const fs = require('fs');
const path = require('path');
const stylelint = require('stylelint');
const { REPO_ROOT, isNonEmptyString } = require('./utils');

const ruleName = 'atelier/no-undeclared-token';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (name) =>
    `[UNDECLARED] '${name}' is read here via var() but is declared in no ` +
    'configured token source. The component silently renders at its ' +
    "var() fallback (if any), which the design system doesn't control. " +
    'Declare the token, or reference one that exists.',
});

const meta = {
  url: 'tools/stylelint-rules/no-undeclared-token.js',
};

// Matches a `var(--ui-...)` READ inside a declaration's value.
const TOKEN_READ = /var\(\s*(--ui-[a-z0-9-]+)/g;
// Matches a `--ui-...` DECLARATION (`--ui-x: <value>;`) inside a token
// source file. A token may be re-declared across selectors (light / dark /
// [data-theme] blocks); only its existence matters here.
const TOKEN_DECLARATION = /(--ui-[a-zA-Z0-9-]+)\s*:/g;

/** The set of `--ui-*` names declared in `tokenFiles` (repo-root-relative paths). */
function readDeclaredTokens(tokenFiles) {
  const declared = new Set();
  for (const relFile of tokenFiles) {
    const absFile = path.resolve(REPO_ROOT, relFile);
    const src = fs.readFileSync(absFile, 'utf-8');
    for (const match of src.matchAll(TOKEN_DECLARATION)) {
      declared.add(match[1]);
    }
  }
  return declared;
}

/** @type {import('stylelint').Rule} */
const rule = (primary, secondaryOptions) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(
      result,
      ruleName,
      { actual: primary, possible: [true] },
      {
        actual: secondaryOptions,
        possible: { tokenFiles: [isNonEmptyString] },
      },
    );
    if (!validOptions) return;

    const tokenFiles = secondaryOptions.tokenFiles;
    const declaredTokens = readDeclaredTokens(tokenFiles);

    root.walkDecls((decl) => {
      for (const match of decl.value.matchAll(TOKEN_READ)) {
        const name = match[1];
        if (declaredTokens.has(name)) continue;

        stylelint.utils.report({
          message: messages.rejected(name),
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
