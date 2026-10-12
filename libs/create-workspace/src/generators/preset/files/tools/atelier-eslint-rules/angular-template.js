'use strict';

/**
 * ESLint flat-config plugin for Atl consumer templates (ADR-0152): the two
 * `@angular-eslint/template` rules that check HOW the components are used, which
 * `strictTemplates` cannot. It is separate from `index.js` on purpose: the scaffold
 * ships this file and its two rules byte-identical (sync-preflight.mjs) and has none
 * of `index.js`'s repo-only rules (`host-attr-guard`, ...) to carry.
 *
 * Wired as `atelier-template` for `**\/*.html` and inline templates. The rule
 * tests stay in this repo.
 */

module.exports = {
  meta: { name: 'atelier-template-rules', version: '0.0.0' },
  rules: {
    'atl-button-icon-only-needs-name': require('./atl-button-icon-only-needs-name'),
    'atl-sub-component-needs-parent': require('./atl-sub-component-needs-parent'),
  },
};
