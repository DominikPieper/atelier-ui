'use strict';

/**
 * story-description-source
 *
 * Every Storybook story for a component spec must declare a component-level
 * description so the generated Component Manifest (Storybook MCP) carries
 * real context for downstream agents. Without this, the hosted MCP at
 * `atelier.pieper.io/storybook-<fw>/mcp` serves an empty description per
 * component and agents fall back to reading raw source — wasteful and
 * lossy.
 *
 * What this rule checks, on a story file's default export:
 *   1. It declares `parameters.docs.description.component`.
 *   2. That value is DERIVED from a shared source — an
 *      `<identifier>.<sourceProperty>` member access (default
 *      `sourceProperty: 'purpose'`, e.g. `metadata.purpose`) — never a bare
 *      literal. A literal here can silently drift from the source of
 *      truth; a derived reference cannot.
 *
 * `sourceProperty` is a rule option, not a hardcoded three-levels-deep
 * string, on purpose: ADR-0121 plans to move `purpose` out of the metadata
 * barrel modules and into each component's own class JSDoc. When that
 * lands, the accepted shape changes at the call site
 * (`metadata.purpose` -> something else) without touching this rule's
 * logic — only the option passed to it in the eslint config.
 *
 * Formerly `tools/scripts/check-story-descriptions.js`, which called
 * itself "Heuristics, not full AST — targeted regular expressions" against
 * the raw source text. An ESLint rule gets the actual AST: it resolves the
 * default export (whether declared inline or via a `const meta = {…};
 * export default meta;` — this codebase's universal convention) instead of
 * regexing `description\s*:\s*\{[^}]*component\s*:\s*[^,}]+` against the
 * whole file, so it isn't fooled by, say, that same text appearing inside
 * an unrelated template-literal code sample elsewhere in the file.
 *
 * Directory-level exemptions (components with no metadata file at all, so
 * no description is expected) are NOT this rule's concern — a rule sees one
 * file at a time and has no per-directory allowlist. That exclusion lives
 * where the rule is wired up (`ignores` glob patterns in each lib's
 * eslint.config.mjs), not inside this file.
 */

const { ESLintUtils } = require('@typescript-eslint/utils');
const { getObjectProperty, unwrapExpression } = require('./utils');

const createRule = ESLintUtils.RuleCreator(
  (name) => `tools/eslint-rules/${name}.js`,
);

const DEFAULT_SOURCE_PROPERTY = 'purpose';

/** `meta`'s `ObjectExpression`, whether declared inline (`export default {…}`) or via a top-level `const meta = {…}; export default meta;`. */
function resolveDefaultExportObject(context, declarationNode) {
  const declaration = unwrapExpression(declarationNode);
  if (declaration.type === 'ObjectExpression') return declaration;
  if (declaration.type !== 'Identifier') return undefined;

  for (const statement of context.sourceCode.ast.body) {
    if (statement.type !== 'VariableDeclaration') continue;
    for (const declarator of statement.declarations) {
      if (
        declarator.id.type !== 'Identifier' ||
        declarator.id.name !== declaration.name
      )
        continue;
      if (!declarator.init) continue;
      const init = unwrapExpression(declarator.init);
      if (init.type === 'ObjectExpression') return init;
    }
  }
  return undefined;
}

/** Is `node` a single-level `<identifier>.<sourceProperty>` member access? */
function isDerivedFromSource(node, sourceProperty) {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    node.object.type === 'Identifier' &&
    node.property.type === 'Identifier' &&
    node.property.name === sourceProperty
  );
}

module.exports = createRule({
  name: 'story-description-source',
  meta: {
    type: 'problem',
    docs: {
      description:
        "Every Storybook story's default export must set " +
        'parameters.docs.description.component, sourced from a shared ' +
        "`<identifier>.<sourceProperty>` reference (default 'purpose', e.g. " +
        '`metadata.purpose`) rather than a bare literal, so the Storybook MCP manifest can ' +
        'never drift from that source of truth.',
    },
    messages: {
      missingDescription:
        "No 'parameters.docs.description.component' set on this story's default export. Source " +
        "it from a '<name>.{{sourceProperty}}' reference (e.g. 'metadata.{{sourceProperty}}').",
      inlineDescription:
        "'parameters.docs.description.component' is not a '<name>.{{sourceProperty}}' reference " +
        "(e.g. 'metadata.{{sourceProperty}}') — a literal here can drift from the source of truth.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          sourceProperty: {
            type: 'string',
            description:
              'The property name that makes `component: <name>.<sourceProperty>` count as ' +
              "'derived' rather than a literal.",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ sourceProperty: DEFAULT_SOURCE_PROPERTY }],
  create(context, [options]) {
    const sourceProperty = options.sourceProperty ?? DEFAULT_SOURCE_PROPERTY;

    return {
      ExportDefaultDeclaration(node) {
        const metaObject = resolveDefaultExportObject(
          context,
          node.declaration,
        );

        const parameters = getObjectProperty(metaObject, 'parameters');
        const docs = getObjectProperty(
          unwrapExpression(parameters?.value),
          'docs',
        );
        const description = getObjectProperty(
          unwrapExpression(docs?.value),
          'description',
        );
        const component = getObjectProperty(
          unwrapExpression(description?.value),
          'component',
        );

        if (!component) {
          context.report({
            node: metaObject ?? node,
            messageId: 'missingDescription',
            data: { sourceProperty },
          });
          return;
        }

        if (
          !isDerivedFromSource(
            unwrapExpression(component.value),
            sourceProperty,
          )
        ) {
          context.report({
            node: component,
            messageId: 'inlineDescription',
            data: { sourceProperty },
          });
        }
      },
    };
  },
});
