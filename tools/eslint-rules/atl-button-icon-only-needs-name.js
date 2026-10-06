'use strict';

/**
 * atl-button-icon-only-needs-name
 *
 * An `@angular-eslint/template` rule (ADR-0152). Flags an `<atl-button>` that has
 * no text content and no accessible-name attribute: an icon-only button a screen
 * reader announces as just "button".
 *
 *   <atl-button><atl-icon name="close" /></atl-button>            // flagged
 *   <atl-button aria-label="Close"><atl-icon name="close" /></atl-button>   // ok
 *
 * Named by any of: `aria-label`, `[aria-label]`, `[attr.aria-label]`,
 * `aria-labelledby` (and its bound forms). Named by content when the button holds
 * text, an interpolation, an `<atl-icon label="...">`, or any element other than a
 * bare `<atl-icon>` (a visually-hidden `<span>Close</span>` beside the icon is the
 * documented way to name it from content). Content is read through `@if`, `@for`,
 * `@switch`, `@defer` and `*ngIf` wrappers: `@if (x) { <atl-icon /> }` is still
 * icon-only, while `@if (x) { text }` is not.
 *
 * Why the type-check cannot: `<atl-button>` projects its content with
 * `<ng-content>`, so `strictTemplates` sees an element with arbitrary children and
 * an unconstrained attribute set. Whether those children add up to an accessible
 * name is a fact about the rendered DOM. The component warns at runtime in dev mode
 * (`AtlButton`, after first render, only for a button the app actually renders);
 * this rule reports the same defect at lint time, with a file location.
 *
 * Mirrors the dev-mode check in AtlButton: it tests `textContent` and the
 * `aria-label` / `aria-labelledby` attributes, so `title` is NOT accepted as a name.
 *
 * Known false negatives (the rule gives up rather than guess, so it never blocks
 * a correct template):
 *   - `<ng-content>`, `<ng-container>`, `<ng-template>` or any non-`atl-icon`
 *     element inside the button counts as possible text.
 *   - `[attr.aria-label]="null"` counts as named, though it renders no label.
 *   - `[innerHTML]`, `[innerText]` and `[textContent]` bindings count as content.
 *
 * Known false positive: a name supplied from outside the template, by a directive
 * or a host binding on the component that wraps this template. Disable the rule
 * for that line.
 *
 * Template-only: it reads the template AST, never the component class.
 */

const NAME_ATTRS = new Set(['aria-label', 'aria-labelledby']);
const CONTENT_PROPS = new Set(['innerHTML', 'innerText', 'textContent']);

// The angular-eslint template parser's node types carry no numeric suffix
// (`Element`, `Text`, `BoundText`); a build that does (`Element$1`) is stripped.
const kind = (node) => String(node.type).replace(/\$\d+$/, '');

/**
 * Every attribute-like entry on an element: static, bound, and `[attr.x]` (the
 * parser reports `[attr.aria-label]` under the plain name `aria-label`).
 */
const attrsOf = (el) => [...(el.attributes ?? []), ...(el.inputs ?? [])];

const hasNameAttr = (el) => attrsOf(el).some((a) => NAME_ATTRS.has(a.name));

const hasContentBinding = (el) =>
  attrsOf(el).some((a) => CONTENT_PROPS.has(a.name));

// Child lists of every container kind: elements, `*ngIf` templates, and the
// `@if` / `@for` / `@switch` / `@defer` blocks with their branches.
const CHILD_KEYS = [
  'children',
  'branches',
  'cases',
  'groups',
  'empty',
  'placeholder',
  'loading',
  'error',
];

function childrenOf(node) {
  const out = [];
  for (const key of CHILD_KEYS) {
    const value = node[key];
    if (Array.isArray(value)) out.push(...value);
    else if (value) out.push(value);
  }
  return out;
}

/**
 * Classify what `node` contributes to the button's name:
 *   'icon'  a decorative `<atl-icon>`
 *   'ws'    whitespace
 *   'named' text, an interpolation, a labelled icon, or anything we cannot judge
 *           statically (another element, `<ng-content>`, `<ng-template>`).
 * Containers (blocks, `*ngIf` templates) contribute whatever their children do.
 */
function contributions(node) {
  switch (kind(node)) {
    case 'Text':
      return [node.value.trim() ? 'named' : 'ws'];
    case 'BoundText':
      return ['named'];
    case 'Element':
      if (node.name === 'atl-icon') {
        return [
          attrsOf(node).some((a) => a.name === 'label') ? 'named' : 'icon',
        ];
      }
      return ['named'];
    case 'Content':
      return ['named'];
    case 'Template':
      // `<ng-template>` is opaque; a `*ngIf`-style structural wrapper has a
      // `tagName` and is read through like a block.
      return node.tagName === 'ng-template'
        ? ['named']
        : childrenOf(node).flatMap(contributions);
    default:
      // IfBlock, IfBlockBranch, ForLoopBlock, SwitchBlock, DeferredBlock, ...
      return childrenOf(node).flatMap(contributions);
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '<atl-button> with no text content needs aria-label or aria-labelledby',
    },
    messages: {
      missing:
        '<atl-button> has no text content and no accessible name. Add aria-label (or aria-labelledby), or visible text.',
    },
    schema: [],
  },
  create(context) {
    return {
      Element(node) {
        if (node.name !== 'atl-button') return;
        if (hasNameAttr(node) || hasContentBinding(node)) return;
        const kinds = (node.children ?? [])
          .flatMap(contributions)
          .filter((k) => k !== 'ws');
        if (kinds.every((k) => k === 'icon')) {
          context.report({
            loc: context.sourceCode.parserServices.convertNodeSourceSpanToLoc(
              node.startSourceSpan ?? node.sourceSpan,
            ),
            messageId: 'missing',
          });
        }
      },
    };
  },
};
