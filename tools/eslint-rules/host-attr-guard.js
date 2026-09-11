'use strict';

/**
 * host-attr-guard
 *
 * Angular quirk (ADR-0091): a static attribute written on a component's tag
 * matches an aliased/plain `input()` of the same name AND independently
 * stays on the host element as a literal DOM attribute — Angular keeps
 * static attributes even when they also bind an input (unlike a
 * `[prop]="…"` binding, which does not reflect). So `<atl-input
 * aria-label="Name">` puts `aria-label` on BOTH the `<atl-input>` host and
 * (via the aliased input) the inner `<input>`; `<atl-input id="x">`
 * duplicates `id` onto both elements the same way.
 *
 * Two ways that bites:
 *   - `id` duplicated onto host + inner control is invalid HTML (two
 *     elements, one id) and breaks `<label for>` association, since the
 *     host is not labelable and is first in document order.
 *   - `aria-label`/`aria-labelledby` on a roleless host is a harmless no-op
 *     today, but becomes a second, competing accessible name the moment
 *     that host gains a `role` (already true for Select, whose host
 *     carries `role="combobox"`).
 *
 * This rule enforces the fix per Angular `@Component` class:
 *   - aliases an input to `aria-label`       -> host needs '[attr.aria-label]': 'null'
 *   - aliases an input to `aria-labelledby'` -> host needs '[attr.aria-labelledby]': 'null'
 *   - declares an input literally named `id` -> host needs '[attr.id]': 'null'
 *
 * Formerly `tools/scripts/check-host-attr-guards.js`, a regex/line-based
 * gate whose header names its main implementation hazard: several files
 * declare MORE THAN ONE `@Component` (`atl-dialog.ts` holds four,
 * `atl-table.ts` holds six), and grading per FILE would let one
 * component's `host` satisfy a sibling's requirement. That script worked
 * around it by slicing each file into per-`@Component(…) export class Foo
 * { … }` text blocks at the `@Component(` boundary. An ESLint rule visiting
 * one `ClassDeclaration` at a time gets that per-class scoping for free —
 * a sibling class's `host` object is a different AST node the visitor never
 * looks at — which is most of why this belongs in a linter, not a script.
 */

const { ESLintUtils } = require('@typescript-eslint/utils');
const { getObjectProperty, getStringValue } = require('./utils');

const createRule = ESLintUtils.RuleCreator(
  (name) => `tools/eslint-rules/${name}.js`,
);

/** The `host` binding key that must be forced to the string `'null'` for each guarded attribute. */
const HOST_GUARD_KEY = Object.freeze({
  id: '[attr.id]',
  'aria-label': '[attr.aria-label]',
  'aria-labelledby': '[attr.aria-labelledby]',
});

/** Is `node` a call to the Angular signal-input family (`input(...)` or `input.required(...)`)? */
function isInputCall(node) {
  if (!node || node.type !== 'CallExpression') return false;
  const callee = node.callee;
  if (callee.type === 'Identifier') return callee.name === 'input';
  if (callee.type === 'MemberExpression' && !callee.computed) {
    return (
      callee.object.type === 'Identifier' && callee.object.name === 'input'
    );
  }
  return false;
}

/** The `host: { … }` object literal of an `@Component({…})` decorator, or `undefined`. */
function getHostObject(componentDecorator) {
  const configArg = componentDecorator.expression.arguments[0];
  if (!configArg || configArg.type !== 'ObjectExpression') return undefined;
  const hostProp = getObjectProperty(configArg, 'host');
  return hostProp && hostProp.value.type === 'ObjectExpression'
    ? hostProp.value
    : undefined;
}

/** The set of `[attr.x]` keys this host object forces to the literal string `'null'`. */
function getGuardedKeys(hostObject) {
  const guarded = new Set();
  if (!hostObject) return guarded;
  for (const prop of hostObject.properties) {
    if (prop.type !== 'Property') continue;
    const key = getStringValue(prop.key);
    const value = prop.value.type === 'Literal' ? prop.value.value : undefined;
    if (key !== undefined && value === 'null') guarded.add(key);
  }
  return guarded;
}

module.exports = createRule({
  name: 'host-attr-guard',
  meta: {
    type: 'problem',
    docs: {
      description:
        "An Angular @Component whose input aliases 'aria-label'/'aria-labelledby', or is " +
        "literally named 'id', must force that attribute absent on its OWN host " +
        "('[attr.x]': 'null') — Angular keeps a static host attribute even when it also binds " +
        'an aliased input, so without the guard a caller-supplied attribute lands on both the ' +
        'host and the aliased/inner control at once (ADR-0091).',
    },
    messages: {
      missingIdGuard:
        "'{{className}}' declares an input literally named 'id' but its own @Component host has " +
        "no '[attr.id]': 'null' guard. A static id=\"…\" attribute on <{{className}}>'s tag would " +
        'match this input AND independently stay on the host element (Angular keeps static ' +
        "attributes even when they also bind an input) — add '[attr.id]': 'null' to this class's " +
        'host (ADR-0091).',
      missingAriaLabelGuard:
        "'{{className}}' aliases an input to 'aria-label' but its own @Component host has no " +
        "'[attr.aria-label]': 'null' guard. A static aria-label=\"…\" attribute on " +
        "<{{className}}>'s tag would match this input AND independently stay on the host element " +
        '(Angular keeps static attributes even when they also bind an input) — add ' +
        "'[attr.aria-label]': 'null' to this class's host (ADR-0091).",
      missingAriaLabelledbyGuard:
        "'{{className}}' aliases an input to 'aria-labelledby' but its own @Component host has no " +
        "'[attr.aria-labelledby]': 'null' guard. A static aria-labelledby=\"…\" attribute on " +
        "<{{className}}>'s tag would match this input AND independently stay on the host element " +
        '(Angular keeps static attributes even when they also bind an input) — add ' +
        "'[attr.aria-labelledby]': 'null' to this class's host (ADR-0091).",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ClassDeclaration(node) {
        const componentDecorator = (node.decorators ?? []).find(
          (d) =>
            d.expression.type === 'CallExpression' &&
            d.expression.callee.type === 'Identifier' &&
            d.expression.callee.name === 'Component',
        );
        if (!componentDecorator) return;

        const guarded = getGuardedKeys(getHostObject(componentDecorator));
        const className = node.id ? node.id.name : '<anonymous>';

        for (const member of node.body.body) {
          if (
            member.type !== 'PropertyDefinition' ||
            !isInputCall(member.value)
          )
            continue;

          const propName = getStringValue(member.key);
          if (propName === 'id' && !guarded.has(HOST_GUARD_KEY.id)) {
            context.report({
              node: member,
              messageId: 'missingIdGuard',
              data: { className },
            });
          }

          const optionsArg = member.value.arguments[1];
          const aliasProp =
            optionsArg && optionsArg.type === 'ObjectExpression'
              ? getObjectProperty(optionsArg, 'alias')
              : undefined;
          const alias = aliasProp ? getStringValue(aliasProp.value) : undefined;

          if (
            alias === 'aria-label' &&
            !guarded.has(HOST_GUARD_KEY['aria-label'])
          ) {
            context.report({
              node: member,
              messageId: 'missingAriaLabelGuard',
              data: { className },
            });
          }
          if (
            alias === 'aria-labelledby' &&
            !guarded.has(HOST_GUARD_KEY['aria-labelledby'])
          ) {
            context.report({
              node: member,
              messageId: 'missingAriaLabelledbyGuard',
              data: { className },
            });
          }
        }
      },
    };
  },
});
