'use strict';

/**
 * Test harness for the `@angular-eslint/template` rules in this directory: ESLint's
 * RuleTester wired to node:test and to the angular-eslint template parser. Repo-only,
 * never shipped to the scaffold (see sync-preflight.mjs).
 */

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const templateParser = require('@angular-eslint/template-parser');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parser: templateParser },
});

/**
 * @param {string} name rule name, for the test titles
 * @param {object} rule the rule module
 * @param {{valid: Record<string,string>, invalid: Record<string,{code: string, errors: object[]}>}} cases
 *   Cases are keyed by a sentence that names the branch they pin down.
 */
function run(name, rule, { valid, invalid }) {
  tester.run(name, rule, {
    valid: Object.entries(valid).map(([title, code]) => ({
      name: title,
      code,
      filename: 'case.html',
    })),
    invalid: Object.entries(invalid).map(([title, c]) => ({
      name: title,
      filename: 'case.html',
      ...c,
    })),
  });
}

module.exports = { run };
