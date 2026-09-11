'use strict';

/**
 * Small, shared AST helpers for the local rules in this directory. Kept
 * dependency-free (no `@typescript-eslint/utils` types used here) so both
 * rule files can `require()` this without pulling in anything beyond plain
 * TSESTree node shapes.
 */

/**
 * The `Property` node keyed `name` in `objectExpression.properties`, or
 * `undefined` if `objectExpression` isn't an `ObjectExpression`, has no such
 * key, or the key is computed (`[foo]: …`) — a computed key can't be
 * resolved statically, so it's treated as "not this property" rather than
 * guessed at.
 *
 * Matches both an `Identifier` key (`{ host: … }`) and a string `Literal`
 * key (`{ 'host': … }` / `{ '[attr.id]': … }`) — object literals in this
 * codebase use both forms depending on whether the key is a valid
 * identifier.
 *
 * @param {import('@typescript-eslint/utils').TSESTree.Node | undefined} objectExpression
 * @param {string} name
 */
function getObjectProperty(objectExpression, name) {
  if (!objectExpression || objectExpression.type !== 'ObjectExpression')
    return undefined;
  return objectExpression.properties.find((prop) => {
    if (prop.type !== 'Property' || prop.computed) return false;
    if (prop.key.type === 'Identifier') return prop.key.name === name;
    if (prop.key.type === 'Literal') return prop.key.value === name;
    return false;
  });
}

/**
 * The static string value of `node`: an `Identifier`'s name, or a string
 * `Literal`'s value. `undefined` for anything else (template literals,
 * numbers, computed expressions, …) — those aren't statically known.
 *
 * @param {import('@typescript-eslint/utils').TSESTree.Node | undefined} node
 */
function getStringValue(node) {
  if (!node) return undefined;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'Literal' && typeof node.value === 'string')
    return node.value;
  return undefined;
}

/**
 * Unwraps `expr as T`, `expr satisfies T`, and `expr!` down to the inner
 * expression, repeatedly (`(expr as T) satisfies U` unwraps fully). Story
 * files in this repo don't use any of these today, but a plain
 * `ObjectExpression` check would silently stop matching the day one does —
 * unwrapping is cheap insurance, not speculative scope.
 *
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 */
function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression')
  ) {
    current = current.expression;
  }
  return current;
}

module.exports = { getObjectProperty, getStringValue, unwrapExpression };
