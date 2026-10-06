'use strict';

/**
 * atl-sub-component-needs-parent
 *
 * An `@angular-eslint/template` rule (ADR-0152). Flags an Atl sub-component used
 * with none of its required parent among its ancestors in the same template:
 *
 *   <atl-option optionValue="a">A</atl-option>                          // flagged
 *   <atl-select label="X"><atl-option optionValue="a">A</atl-option></atl-select>   // ok
 *
 * One data-driven rule: `SUB_COMPONENT_PARENTS` below maps each child selector to
 * the parent selector it needs. The parent may be any ancestor, not only the
 * direct parent, and is read through `@if`, `@for`, `@switch`, `@defer`,
 * `*ngIf` and `<ng-template>` wrappers (Angular resolves `inject()` through the
 * declaring template, so a wrapper never hides an ancestor).
 *
 * Why the type-check cannot: `strictTemplates` checks inputs, outputs and element
 * names, not where an element sits. The dependency is an `inject(ATL_SELECT)`
 * inside the child class (or, for slots, a documented composition), invisible to
 * the template type-checker. Without a parent the child throws NG0201 on first
 * render, and the slot-only children render without their parent's wiring. This
 * rule reports it at lint time, with a file location.
 *
 * Keeping the table true: a table of selectors is a second copy of knowledge that
 * lives in the components. `atl-sub-component-needs-parent.test.js` reads the
 * Angular sources in this repo and fails when the table disagrees with the
 * `inject()` calls, selectors and provider tokens there (it runs in
 * `check:eslint-rules`). The test does not ship to a scaffolded workspace, which
 * has no component sources to read.
 *
 * Template-local only. The rule sees one template at a time. A sub-component
 * written inside a custom element is NOT flagged, because that element's own
 * template may forward it into the parent with `<ng-content>`:
 *
 *   <my-select-chrome><atl-option /></my-select-chrome>   // chrome renders <atl-select><ng-content/></atl-select>
 *
 * "Custom element" means any hyphenated element that is not an `atl-*` element
 * or an Angular built-in (`ng-container`, `ng-template`, `ng-content`).
 *
 * Known false negative: the wrapper case above (a custom element between the child
 * and the template root silences the rule for that child).
 *
 * Known false positive: a component whose whole template is a fragment of
 * sub-components (an `atl-option` list with no `atl-select` in it), projected
 * into a parent elsewhere. The rule cannot see across the component boundary;
 * disable it for that template.
 */

/**
 * Child selector -> the parent selector it requires.
 *
 * Verified against `libs/angular/src/lib/**`; the test file next to this rule
 * re-derives the `inject` rows from the sources and checks the `slot` rows
 * against the class JSDoc. A `via` of `inject` means the child class calls
 * `inject()` on a token (or class) that only the parent provides; `slot` means
 * the child has no such dependency but is documented, styled and wired as part
 * of its parent.
 */
const SUB_COMPONENT_PARENTS = Object.freeze({
  'atl-option': { parent: 'atl-select', via: 'inject' },
  'atl-tab': { parent: 'atl-tab-group', via: 'inject' },
  'atl-breadcrumb-item': { parent: 'atl-breadcrumbs', via: 'inject' },
  'atl-accordion-item': { parent: 'atl-accordion-group', via: 'inject' },
  'atl-step': { parent: 'atl-stepper', via: 'inject' },
  'atl-dialog-header': { parent: 'atl-dialog', via: 'inject' },
  'atl-dialog-content': { parent: 'atl-dialog', via: 'slot' },
  'atl-dialog-footer': { parent: 'atl-dialog', via: 'slot' },
  'atl-drawer-header': { parent: 'atl-drawer', via: 'inject' },
  'atl-drawer-content': { parent: 'atl-drawer', via: 'slot' },
  'atl-drawer-footer': { parent: 'atl-drawer', via: 'slot' },
  'atl-chat-header': { parent: 'atl-chat', via: 'inject' },
  'atl-chat-input': { parent: 'atl-chat', via: 'inject' },
  'atl-menu-item': { parent: 'atl-menu', via: 'slot' },
});

const ANGULAR_BUILTINS = new Set(['ng-container', 'ng-template', 'ng-content']);

// The angular-eslint template parser's node types carry no numeric suffix; a build
// that does (`Element$1`) is stripped.
const kind = (node) => String(node.type).replace(/\$\d+$/, '');

/** A custom element that could forward projected content into a parent. */
function isForwardingCandidate(name) {
  return (
    name.includes('-') &&
    !name.startsWith('atl-') &&
    !ANGULAR_BUILTINS.has(name)
  );
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'an Atl sub-component must be used inside its required parent component',
    },
    messages: {
      orphan:
        '<{{child}}> must be used inside <{{parent}}>. Without it the component throws on first render or renders unwired.',
    },
    schema: [],
  },
  create(context) {
    return {
      Element(node) {
        const entry = SUB_COMPONENT_PARENTS[node.name];
        if (!entry) return;
        for (let up = node.parent; up; up = up.parent) {
          if (kind(up) !== 'Element') continue;
          if (up.name === entry.parent) return;
          if (isForwardingCandidate(up.name)) return;
        }
        context.report({
          loc: context.sourceCode.parserServices.convertNodeSourceSpanToLoc(
            node.startSourceSpan ?? node.sourceSpan,
          ),
          messageId: 'orphan',
          data: { child: node.name, parent: entry.parent },
        });
      },
    };
  },
};

module.exports = rule;
module.exports.SUB_COMPONENT_PARENTS = SUB_COMPONENT_PARENTS;
