'use strict';

/**
 * atelier/rooted-selector
 *
 * A component stylesheet is global CSS: `libs/styles/src/<dir>/atl-<name>.css` is
 * imported by React and Vue as a plain side effect, and a bare `button { … }`,
 * `.foo { … }` or `@keyframes spin` in it would restyle every page that loads the
 * library, not the component. So every selector in such a file must start with a
 * component class, and every animation must be named for the library:
 *
 *   - a selector starts with a `.atl-*` class (`.atl-select > .select-wrapper`),
 *   - or with `:is(` a list of them (`:is(.atl-a, .atl-b) *`), every argument rooted,
 *   - or with a `[data-theme…]` attribute on an ancestor, followed by one of the above
 *     (`[data-theme='dark'] .atl-card`);
 *   - `@keyframes` names start with `atl-`.
 *
 * "The component's own class" is any `.atl-*`: a component owns more than one root
 * (`.atl-menu`, `.atl-menu-panel`; `.atl-select`, `.atl-option`), and which directory
 * may style which root is what `check:dead-selectors` and `check:box-sizing` judge,
 * because that needs the other files. This rule reads one file and decides on that
 * file alone, which is why it is a lint rule and not a gate (ADR-0126, ADR-0130).
 *
 * Out of scope on purpose: keyframe selectors (`from`, `to`, `50%`) are not selectors
 * of the page, and a rule nested inside a rule is scoped by its parent, which this
 * rule has already judged. Where the rule applies is the config's business: it is
 * wired in `stylelint.config.mjs` for the shared sheets and the per-framework
 * overrides only, never for the docs site or a scaffolded workspace's own CSS, which
 * have no `.atl-` root and are not component sheets.
 *
 * Takes no secondary options.
 */

const stylelint = require('stylelint');

const ruleName = 'atelier/rooted-selector';

const messages = stylelint.utils.ruleMessages(ruleName, {
  unrooted: (selector) =>
    `[UNROOTED] selector '${selector}' does not start with a .atl-* class — a component ` +
    'stylesheet is global CSS, so this rule styles every page that loads it. Root it ' +
    "(`.atl-<name> …`, `:is(.atl-a, .atl-b) …`, or `[data-theme='…'] .atl-<name> …`).",
  keyframes: (name) =>
    `[KEYFRAMES] @keyframes '${name}' is not named atl-* — keyframe names are global, ` +
    'so an unprefixed one collides with the consuming app. Rename it atl-<name>.',
});

const meta = {
  url: 'tools/stylelint-rules/rooted-selector.js',
};

const ATL_CLASS = /^\.atl-[A-Za-z0-9_-]+/;
const THEME_PREFIX = /^\[data-theme[^\]]*\]\s*>?\s*/;

/** Split `text` on `separator` at bracket/paren depth 0, outside quotes. */
function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Index of the `)` closing the `(` at `open`, or -1. */
function closingParen(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

/** Does one selector (no top-level comma) begin with a component root? */
function isRooted(selector) {
  let s = selector.trim();
  const theme = THEME_PREFIX.exec(s);
  if (theme) s = s.slice(theme[0].length);
  if (ATL_CLASS.test(s)) return true;
  if (/^:is\(/i.test(s)) {
    const close = closingParen(s, 3);
    if (close === -1) return false;
    const args = splitTopLevel(s.slice(4, close), ',');
    return args.every((arg) => arg.trim() !== '' && isRooted(arg));
  }
  return false;
}

const KEYFRAMES = /^(-[a-z]+-)?keyframes$/i;

/** @type {import('stylelint').Rule} */
const rule = (primary) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });
    if (!validOptions) return;

    root.walkRules((node) => {
      const parent = node.parent;
      if (parent && parent.type === 'atrule' && KEYFRAMES.test(parent.name))
        return;
      if (parent && parent.type === 'rule') return;
      for (const selector of splitTopLevel(node.selector, ',')) {
        if (isRooted(selector)) continue;
        stylelint.utils.report({
          message: messages.unrooted(selector.trim().replace(/\s+/g, ' ')),
          node,
          result,
          ruleName,
        });
      }
    });

    root.walkAtRules(KEYFRAMES, (node) => {
      if (/^atl-/.test(node.params.trim())) return;
      stylelint.utils.report({
        message: messages.keyframes(node.params.trim()),
        node,
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
