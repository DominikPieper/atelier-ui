'use strict';

/**
 * ESLint processor: lints the Angular templates of Storybook stories (ADR-0152).
 *
 * `@angular-eslint`'s own `extract-inline-html` processor reads the `template:` of an
 * `@Component({...})` decorator. A story does not write one: it returns
 * `{ template: \`<atl-select>...\`, props, moduleMetadata }` from `render`, so the
 * Angular template rules never saw a story's markup (the cookbook, the showcase and
 * every component story are written that way). This processor extracts those
 * `template:` strings, plus whatever the Angular processor extracts, so one
 * `processor` entry on `*.stories.ts` covers both.
 *
 * Each story template becomes a virtual file named `story-template-N.atl-tpl`, NOT
 * `.html`, on purpose: the library's `**\/*.html` blocks carry the stricter rule set
 * written for component source (no-call-expression, prefer-control-flow, ...), which
 * a story's `${argsToTemplate(args)}` markup was never held to. Only the blocks that
 * name the `.atl-tpl` extension apply to it.
 *
 * Positions: the virtual file is the whole story file with everything outside the
 * template blanked to spaces (newlines kept), and `${...}` substitutions blanked the
 * same way. Line and column in the virtual file are therefore the line and column in
 * the real file, and no position mapping is needed on the way back.
 *
 * Repo-only: the scaffold lints plain `@Component` templates and does not ship this.
 */

const ts = require('typescript');
const angular = require('@angular-eslint/eslint-plugin-template').processors[
  'extract-inline-html'
];

const blank = (s) => s.replace(/[^\r\n]/g, ' ');

function storyTemplates(text, filename) {
  if (!/\.stories\.ts$/.test(filename) || !text.includes('template')) return [];
  const sf = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const out = [];
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'template' &&
      // A `@Component({ template })` is the stock processor's, and is linted
      // there under the full `**/*.html` rule set.
      !(
        ts.isCallExpression(node.parent.parent) &&
        node.parent.parent.parent &&
        ts.isDecorator(node.parent.parent.parent)
      )
    ) {
      const init = node.initializer;
      if (
        ts.isNoSubstitutionTemplateLiteral(init) ||
        ts.isTemplateExpression(init) ||
        ts.isStringLiteral(init)
      ) {
        // The content between the quotes / backticks.
        const start = init.getStart() + 1;
        const end = init.getEnd() - 1;
        let body = text.slice(start, end);
        if (ts.isTemplateExpression(init)) {
          // Blank every `${...}` span, so an expression never reaches the HTML parser.
          const base = start;
          const spans = init.templateSpans.map((s) => {
            const open = s.expression.getStart() - 2; // the `${`
            const close = s.literal.getStart(); // the `}` that ends it
            return [open - base, close + 1 - base];
          });
          for (const [a, b] of spans) {
            body = body.slice(0, a) + blank(body.slice(a, b)) + body.slice(b);
          }
        }
        out.push({
          text: blank(text.slice(0, start)) + body + blank(text.slice(end)),
          filename: `story-template-${out.length}.atl-tpl`,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

// How many blocks the Angular processor produced per file, so `postprocess` can hand
// it exactly its own. ESLint lints files one at a time, so this never holds more than
// the file in flight.
const angularBlocks = new Map();

module.exports = {
  meta: { name: 'atelier-story-templates', version: '0.0.0' },
  supportsAutofix: false,
  preprocess(text, filename) {
    const inline = angular.preprocess(text, filename);
    angularBlocks.set(filename, inline.length);
    return [...inline, ...storyTemplates(text, filename)];
  },
  postprocess(messages, filename) {
    const split = angularBlocks.get(filename) ?? messages.length;
    angularBlocks.delete(filename);
    return [
      ...angular.postprocess(messages.slice(0, split), filename),
      // Our blocks keep the real file's line and column, so they pass through.
      ...messages.slice(split).flat(),
    ];
  },
};
