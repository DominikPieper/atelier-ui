'use strict';

/**
 * atelier/no-raw-color-literal
 *
 * A component (or docs-site) stylesheet must not spell a colour as a raw
 * literal — a hex triplet/quad (`#fff`, `#00647055`), or an `rgb()`/`rgba()`/
 * `hsl()`/`hsla()` function call — anywhere a declaration's value is not
 * itself the argument list of a `var(...)` call. Colours come from `--ui-*`
 * custom properties; a raw literal is how the design system's single source
 * of colour drifts (a one-off `#006470` that does not track the token it
 * happens to equal today).
 *
 * Two allowances, both structural (not configurable — see below):
 *   - a literal fallback inside `var(--token, <fallback>)` is good defensive
 *     practice; the token still drives the value when it resolves, so the
 *     fallback text is stripped before this rule ever looks at the value.
 *   - `box-shadow`/`text-shadow` (and their `-webkit-` forms) legitimately
 *     carry rgba alpha, and `mask-image`/`-webkit-mask-image` gradient stops
 *     set the mask's alpha (opaque vs. transparent), not a rendered colour —
 *     both are exempt on every property that matches, not on a per-file
 *     allowlist, because the exemption is about what the CSS *means*, not
 *     about which file it lives in.
 *
 * A file/literal pair that is deliberate for some OTHER reason (rare — the
 * inherited script's own docs-only allowlist has stood empty since it was
 * introduced, ADR-0089 §2) is the `exempt` secondary option: an array of
 * `{ file, literal, reason }`, `file` repo-root-relative POSIX
 * (`docs/src/styles/global.css`), `literal` the exact matched text (e.g.
 * `'#000'`, `'rgba('`). A reason is required — this is a rule option with a
 * reason recorded next to it, not an inline `stylelint-disable` comment,
 * so it stays visible to whoever next audits exemptions rather than living
 * unaudited next to the declaration it excuses.
 *
 * Formerly Pass A of `tools/scripts/check-css-tokens.js`.
 */

const stylelint = require('stylelint');
const { toRepoRelative, isNonEmptyString } = require('./utils');

const ruleName = 'atelier/no-raw-color-literal';

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (prop, literal) =>
    `[RAW-COLOR] '${prop}' uses literal '${literal}' — use a --ui-* token ` +
    '(or var(--token, fallback)) instead of a raw color literal.',
});

const meta = {
  url: 'tools/stylelint-rules/no-raw-color-literal.js',
};

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;

// Both patterns tolerate an optional leading `-` and an optional `webkit-`
// segment independently (so `box-shadow`, `-webkit-box-shadow`, and the
// unprefixed-but-still-matched `webkit-box-shadow` all match) — copied
// verbatim from the script this replaces, which is the actual property-name
// shape this repo's CSS uses.
const SHADOW_PROP = /^-?(webkit-)?(box|text)-shadow$/;
const MASK_PROP = /^-?(webkit-)?mask-image$/;

/**
 * Remove every `var(...)` call (balanced parens) from `value` so a literal
 * fallback inside one doesn't count as a raw literal in the declaration's
 * own value.
 *
 * @param {string} value
 */
function stripVarCalls(value) {
  let result = '';
  let i = 0;
  while (i < value.length) {
    if (value.startsWith('var(', i)) {
      let depth = 0;
      let j = i + 3; // at the '('
      for (; j < value.length; j++) {
        if (value[j] === '(') depth++;
        else if (value[j] === ')') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      i = j;
    } else {
      result += value[i];
      i++;
    }
  }
  return result;
}

/** Is `entry` a well-formed `{ file, literal, reason }` exemption? */
function isExemptionEntry(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    isNonEmptyString(entry.file) &&
    isNonEmptyString(entry.literal) &&
    isNonEmptyString(entry.reason)
  );
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
        possible: { exempt: [isExemptionEntry] },
        optional: true,
      },
    );
    if (!validOptions) return;

    const exempt = (secondaryOptions && secondaryOptions.exempt) || [];
    const inputFile = root.source && root.source.input.file;
    const relFile = inputFile ? toRepoRelative(inputFile) : undefined;

    root.walkDecls((decl) => {
      const prop = decl.prop.toLowerCase();
      if (SHADOW_PROP.test(prop) || MASK_PROP.test(prop)) return;

      const stripped = stripVarCalls(decl.value);
      const match = stripped.match(COLOR_LITERAL);
      if (!match) return;

      const literal = match[0];
      const isExempt = exempt.some(
        (entry) => entry.file === relFile && entry.literal === literal,
      );
      if (isExempt) return;

      stylelint.utils.report({
        message: messages.rejected(decl.prop, literal),
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
