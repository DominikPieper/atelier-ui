'use strict';

/**
 * Local stylelint plugin for this repo's own CSS-discipline invariants —
 * the stylelint counterpart of `tools/eslint-rules/`. A stylelint plugin
 * module may export a single rule definition or an array of them (stylelint
 * flattens either shape when loading `plugins`); this file exports the
 * array so `stylelint.config.mjs` only needs one entry in `plugins` to pick
 * up every rule below.
 *
 * Each rule file calls `stylelint.createPlugin(ruleName, rule)` itself and
 * is `require()`-able on its own — this index just collects them, the same
 * relationship `tools/eslint-rules/index.js` has to its own rule files.
 */

module.exports = [
  require('./no-raw-color-literal'),
  require('./no-undeclared-token'),
  require('./no-primitive-token'),
  require('./no-token-bypass'),
];
