# P3.3 spike: Angular consumer-usage lint rules (2026-10-06)

Question: is it worth shipping `@angular-eslint` template rules that check how a _consumer_ uses the Atl components? Build only if at least three checks survive that Angular's strict template type-check does not already catch.

**Verdict: build, but small.** Five checks survive (four rules). Recommended scope is below. The honest counter-argument is in the last section.

## Method

- Scratch consumer in the session scratchpad (`.../scratchpad/p3-3/`): one standalone component per candidate, importing `@atelier-ui/angular` through a tsconfig `paths` entry pointing at `dist/libs/angular/types` (built 2026-10-05, v0.3.6).
- Compiled with `ngc -p tsconfig.json` and `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` all true, the same three flags `libs/create-workspace/src/generators/preset/preset.ts` forces on the scaffolded app (~L736).
- Linted the same files with the preset the scaffold ships: angular-eslint `templateAccessibility` (11 rules), via `eslint -c eslint.a11y-only.cjs src`.
- Classes: (a) the type-check already errors; (b) a runtime signal exists, no build-time signal; (c) neither.

## Candidate table

| #   | Candidate                                                                          | Source                                                                                                  | Class         | Evidence                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| c01 | Icon-only `<atl-button><atl-icon name="close"/></atl-button>`, no `aria-label`     | AtlButton dev-mode check (`atl-button.ts` ~L100, `console.warn` after first render); button metadata    | **(b)** warn  | `ngc`: no output. a11y preset: no output. Runtime: `console.warn` after render, dev mode only.                                                  |
| c02 | `<atl-dialog>` with no `atl-dialog-header` and no `aria-label` / `aria-labelledby` | dialog JSDoc; DB `dialog-header-required`                                                               | **(c)**       | `ngc`: no output. a11y preset: no output. Source: template binds `aria-labelledby` to a header id that never exists; no warn in `libs/angular`. |
| c03 | `<atl-drawer>` with no `atl-drawer-header`                                         | drawer source (`[attr.aria-labelledby]="headerId"`, no `aria-label` input); DB `drawer-header-required` | **(c)**       | `ngc`: no output. a11y preset: no output. Dangling `aria-labelledby`, no warn.                                                                  |
| c04 | `<atl-dialog-header>` outside `atl-dialog`                                         | composition; DB `sub-component-required-parent`                                                         | **(b)** throw | `ngc`: no output. Source: `inject(ATL_DIALOG)` without `optional`, so NG0201 at first render (inferred, not run).                               |
| c05 | `<atl-option>` outside `atl-select`                                                | composition                                                                                             | **(b)** throw | `ngc`: no output. `inject(ATL_SELECT)` non-optional (inferred).                                                                                 |
| c06 | `<atl-tab>` outside `atl-tab-group`                                                | composition                                                                                             | **(b)** throw | `ngc`: no output. `inject(ATL_TAB_GROUP)` non-optional (inferred).                                                                              |
| c07 | `<atl-breadcrumb-item>` outside `atl-breadcrumbs`                                  | composition                                                                                             | **(b)** throw | `ngc`: no output. `inject(ATL_BREADCRUMBS)` non-optional (inferred).                                                                            |
| c08 | `<atl-input placeholder="Email"/>` with no `label`, `aria-label` or external label | input JSDoc ("without one of these the input has no accessible name"); DB `form-label-required`         | **(c)**       | `ngc`: no output. a11y preset: no output (`label-has-associated-control` only sees native `<input>`/`<label>`). No runtime warn.                |
| c09 | `<div atlTooltip="Help">` on a non-interactive host                                | AtlTooltip is `[atlTooltip]` on any element; DB `tooltip-requires-interactive-parent`                   | **(c)**       | `ngc`: no output. a11y preset: no output. No runtime warn.                                                                                      |
| c10 | `<atl-select></atl-select>` with no `label` / `aria-label` and no options          | select JSDoc; DB `select-requires-options`, `form-label-required`                                       | **(c)**       | `ngc`: no output. a11y preset: no output.                                                                                                       |
| c11 | `<atl-accordion-item>` outside `atl-accordion-group`                               | composition                                                                                             | **(b)** throw | `ngc`: no output. `inject(AtlAccordionGroup)` non-optional (inferred).                                                                          |
| c12 | `<atl-menu-item>` outside `atl-menu`                                               | composition                                                                                             | **(b)** throw | `ngc`: no output (runtime behaviour not inspected, so unverified).                                                                              |
| c13 | `<atl-avatar src="a.png"/>` with no `name` / `alt`                                 | avatar source                                                                                           | **(c)**       | `ngc`: no output. Weak: host `aria-label` is derived; low value, dropped from survivors.                                                        |

Controls, to prove the harness really enforces strict templates (all class (a)):

| Control                                         | Evidence                                                                                |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `<atl-option>` without `optionValue`            | `NG8008: Required input 'optionValue' from component AtlOption must be specified.`      |
| `<atl-tab>` without `label`                     | `NG8008: Required input 'label' from component AtlTab must be specified.`               |
| `<atl-button variant="huge">`                   | `TS2322: Type '"huge"' is not assignable to type 'AtlButtonVariant'.`                   |
| `<atl-icon name="nope">`                        | `TS2322: Type '"nope"' is not assignable to type 'AtlIconName'.`                        |
| `<atl-buton>` (typo)                            | `NG8001: 'atl-buton' is not a known element`                                            |
| missing import of `AtlIcon`                     | `NG8001: 'atl-icon' is not a known element`                                             |
| `<atl-button colour="red">` (unknown attribute) | no output, a plain attribute on a component is legal. Class (c), but not a useful rule. |

**Counts:** 13 candidates. (a): 0. (b): 7 (one warns, six throw). (c): 6. Controls: 6 of 7 errored as expected.

Existing a11y lint: running the scaffold's `templateAccessibility` preset over all 13 candidates produced exit 0 and no output. Sanity check that the pipeline is live: a native `<img src>` with no alt and a `<div (click)>` in the same run produced three errors.

## Surviving list

The (b) throw class only adds value at lint time as an earlier, file-located signal, because NG0201 is already loud at first render. Counting each as a rule candidate:

1. **icon-only atl-button needs a name** (c01). Real gap: warn only, dev mode, after render.
2. **dialog/drawer needs a header or an explicit name** (c02, c03). Real gap: silent a11y defect.
3. **form control needs a label** (c08, c10; atl-input, atl-select, probably atl-textarea/combobox). Real gap: silent.
4. **sub-component needs its parent** (c04-c07, c11, c12). Earlier error only; one data-driven rule.
5. **tooltip needs an interactive host** (c09). Real gap: silent, but only a heuristic.

Five survive, so the "at least three" bar is met. The strongest three by value: 1, 2, 3.

## DB UX plugin: mapping onto Atl

Source: `db-ux-design-system/core-web`, `packages/eslint-plugin/src/rules/`. Rules are written for Angular, React and Vue at once (`createAngularVisitors` plus JSX/Vue paths).

| DB rule                                                                                                                                                                                                      | Atl equivalent                                                                                        | Maps?                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `dialog-header-required`                                                                                                                                                                                     | AtlDialog + AtlDialogHeader (#2)                                                                      | yes                                            |
| `drawer-header-required`                                                                                                                                                                                     | AtlDrawer + AtlDrawerHeader (#2)                                                                      | yes                                            |
| `form-label-required`                                                                                                                                                                                        | AtlInput / AtlSelect / AtlTextarea / AtlCheckbox / AtlRadio / AtlToggle (#3)                          | yes                                            |
| `sub-component-required-parent`                                                                                                                                                                              | AtlOption, AtlTab, AtlBreadcrumbItem, AtlAccordionItem, AtlMenuItem, dialog/drawer header+footer (#4) | yes, direct                                    |
| `tooltip-requires-interactive-parent`                                                                                                                                                                        | AtlTooltip (#5)                                                                                       | yes                                            |
| `button-no-text-requires-tooltip` (`noText`)                                                                                                                                                                 | #1, adapted: Atl has no `noText`; the signal is "only an icon child"                                  | partly                                         |
| `select-requires-options`                                                                                                                                                                                    | AtlSelect without `atl-option` children                                                               | yes, weak (options are often `@for`-generated) |
| `accordion-item-headline-required`                                                                                                                                                                           | AtlAccordionItem needs `atlAccordionHeader`                                                           | possible, not tested                           |
| `close-button-text-required`, `tag-removable-remove-button-required`, `navigation-item-back-button-text-required`, `*-burger-menu-label-required`, `custom-select-tags-remove-text-required`                 | no Atl component                                                                                      | no                                             |
| `badge-corner-placement-rules`, `badge-no-inline-in-interactive`                                                                                                                                             | AtlBadge has no corner placement                                                                      | no                                             |
| `button-type-required`, `button-single-icon-attribute`                                                                                                                                                       | AtlButton is `role="button"` on a custom element, no `type`                                           | no                                             |
| `input-type-required`, `input-file-type-validation`                                                                                                                                                          | AtlInput `type` defaults to `'text'` and is a typed union                                             | no                                             |
| `link-external-security`, `custom-heading-single-heading`, `prefer-icon-attribute`, `text-or-children-required`, `no-nested-accordion`, `no-interactive-tooltip-content`, `form-validation-message-required` | no direct Atl component or API                                                                        | no                                             |

Seven map; DB's own rule list is mostly DB-API-specific (`noText`, `icon` attributes), which Atl's slot-based API does not have.

## Prototype rule

Path (scratch): `/private/tmp/claude-501/-Users-dominikpieper-Projects-atelier/56932b2a-5aee-437a-b1f9-6f468df65ebb/scratchpad/p3-3/rules/atl-button-icon-only-needs-name.js` (54 lines). Config: `eslint.config.cjs` beside it. Copy of the logic:

```js
// Prototype: <atl-button> whose only content is an <atl-icon> (no label) and which
// carries no accessible-name attribute. Mirrors the runtime check in AtlButton.
const NAME_ATTRS = new Set(['aria-label', 'aria-labelledby', 'title']);
const kind = (n) => String(n.type).replace(/\$\d+$/, '');

const hasNameAttr = (el) =>
  [...(el.attributes ?? []), ...(el.inputs ?? [])].some((a) => {
    const n = a.name.replace(/^attr\./, '');
    return NAME_ATTRS.has(n);
  });

// 'icon' = decorative atl-icon, 'text' = real text/interpolation,
// 'unknown' = anything we cannot judge statically (blocks, other elements, ng-content).
function classify(child) {
  switch (kind(child)) {
    case 'Text':
      return child.value.trim() ? 'text' : 'ws';
    case 'BoundText':
      return 'text';
    case 'Element': {
      if (child.name === 'atl-icon') {
        const labelled = [...(child.attributes ?? []), ...(child.inputs ?? [])].some((a) => a.name === 'label');
        return labelled ? 'unknown' : 'icon';
      }
      return 'unknown';
    }
    default:
      return 'unknown'; // @if/@for blocks, ng-content, templates
  }
}

module.exports = {
  meta: {
    type: 'problem',
    messages: { missing: '<atl-button> contains only an <atl-icon> and has no accessible name. Add aria-label (or visible text).' },
    schema: [],
  },
  create(context) {
    return {
      Element(node) {
        if (node.name !== 'atl-button' || hasNameAttr(node)) return;
        const kinds = (node.children ?? []).map(classify).filter((k) => k !== 'ws');
        if (kinds.includes('icon') && kinds.every((k) => k === 'icon')) {
          context.report({
            loc: context.sourceCode.parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
            messageId: 'missing',
          });
        }
      },
    };
  },
};
```

Note: in this angular-eslint template parser the node types are unsuffixed (`Element`, `Text`, `BoundText`). My first attempt used `Element$1` (the name DB's rule checks for, which comes from the bundled build) and silently matched nothing. A vendored rule must be tested against the parser version it will run on.

Run (`eslint -c eslint.config.cjs src`, exit 1):

```
src/c01_iconbtn.ts            error  <atl-button> contains only an <atl-icon> and has no accessible name ...
src/fp/bad_ifwrap_outer.ts    error  (same)   button wrapped in @if
src/fp/bad_plain.ts           error  (same)
src/fp/bad_twoicons.ts        error  (same)   two icons, multi-line, whitespace-only text nodes
```

Ten negative fixtures stayed silent: static `aria-label`, `[attr.aria-label]`, `[aria-label]`, `aria-labelledby`, visible text, interpolation, `<atl-icon label="...">`, an `@if` block beside the icon, a sibling `<span>`, and `[attr.aria-label]="null"`.

Known false negative: `[attr.aria-label]="null"` counts as named. Known deliberate leniency: any non-`atl-icon` element, block or `<ng-content>` child makes the rule give up rather than guess.

## Cost estimate

| Rule                    | Lines (rule + helpers)                                                                 | Main false-positive risks                                                                                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 icon-only button name | ~55 (done)                                                                             | Name supplied by a directive or host binding the rule cannot see; `title` accepted as a name here, which is debatable.                                                                                                                               |
| 2 dialog/drawer header  | ~50                                                                                    | Header projected by a wrapper component (`<my-dialog-chrome>`); header inside `@if`/`@for` (needs descent through blocks); `[attr.aria-label]` bound.                                                                                                |
| 3 form control label    | ~60                                                                                    | External `<label for>` plus `[id]` (the documented escape hatch, so skip when `[id]`/`id` is set); wrapping `<label>`; label via `aria-labelledby` to an element elsewhere.                                                                          |
| 4 sub-component parent  | ~80 (data-driven table of ~8 child-to-parent pairs; walk `node.parent` through blocks) | Lower than it looks: Angular resolves `inject()` through the declaring template's element tree, so a same-template ancestor check matches what the injector sees. Remaining: a host component that itself provides `ATL_SELECT`, and custom parents. |
| 5 tooltip host          | ~40                                                                                    | Interactive-ness of a custom component host is unknowable; would need an allowlist of native tags plus `tabindex`/`role`. Highest false-positive rate.                                                                                               |

Plus per rule: 4-6 RuleTester cases (the repo already tests the vendored stylelint rules, see the `test(stylelint)` commits) and a wiring entry. Total for rules 1-4: roughly 250 lines of rule code plus ~200 of tests.

Ongoing cost: the parent table and the "must have name" lists are a second copy of knowledge that lives in the components and `libs/spec/src/metadata`. There is no drift gate for it. Either generate the table from the docgen manifest or accept it will drift.

## Curriculum lens (owner preference)

My judgement, not measured:

- Participants building their own design system hit exactly these two families: "this sub-component only works inside that parent" and "this control needs an accessible name the compiler cannot see". The type-check cannot express either, so a rule is the right tool. That is a concept a workshop can teach.
- The scaffold already vendors stylelint rules into `tools/stylelint-rules`, wires them in `preset.ts`, and tests them. A `tools/eslint-rules` sibling would follow the same shape, and the vendored 50-line files are readable.
- But vendoring all five is more than a workshop needs. Recommend vendoring two as the teaching pair: **rule 1** (a plain "attribute missing" rule) and **rule 4** (a "child needs ancestor" rule, data-driven, and it ties into the `ATL_*` injection tokens participants already see in the components). Rules 2 and 3 would live only in this repo's own consumer lint (docs app, stories, kitchen-sink).

## Recommendation

**Build rules 1-4; skip 5 for now.** Ship them first in this repo's own consumer templates (`docs/`, stories, `kitchen-sink`), where there is a ground truth to measure false positives against. Then vendor rules 1 and 4 into the scaffold behind a `tools/eslint-rules` folder. Do not publish an `@atelier-ui/eslint-plugin` package: that adds a release surface for a one-framework workshop.

Open design decisions before building (not made here): whether rule 2 and 3 accept an external label as sufficient; how the parent table is kept in sync with the components; and an ADR for the vendoring decision (it changes the scaffold, so it qualifies).

## Strongest argument against

Atl has almost no external consumers: any workshop uses one framework, in an app generated by agents that already run under strict gates and axe in stories. DB UX ships this plugin because it has many external teams; Atl would be maintaining ~250 lines of rules plus a hand-synced parent table (with no drift gate) to protect consumers who mostly do not exist. Two of the five survivors (sub-component parents) already fail loudly at first render, so lint only moves a visible error earlier. The real silent gaps are the a11y ones (rules 1-3), and those could instead be closed at the component level: make `AtlDialog`/`AtlDrawer`/`AtlInput` dev-mode-warn like `AtlButton` does, which is a few lines per component, needs no second copy of the knowledge, and works in all consumers, not only those that enable the lint.

## Verified vs inferred

**Verified (run in this session):**

- `ngc` with strict templates on 13 candidates and 7 controls; every output quoted above is real. All 13 candidates compile clean; all 6 type-errors controls errored with the quoted text.
- `templateAccessibility` preset: exit 0 on all candidates; fires on a native `<img>` and `<div (click)>` in the same pipeline.
- The prototype rule: flags 4 positives, silent on 10 negatives, on the dist-compiled consumer.
- Only `AtlButton` has `console.warn`/dev-mode check in `libs/angular` (grep).
- DB rule list and sources read from GitHub; tooltip, select, form-label, sub-component and button rules read in full.

**Inferred (not run):**

- The runtime NG0201 throw for orphans (read non-optional `inject(...)` in source; I did not mount the components).
- c12 (menu item) runtime behaviour.
- False-positive risks and line estimates for rules 2-5: only rule 1 was prototyped.
- That a same-template ancestor check matches the injector's view for rule 4 (reasoned from Angular's element-injector semantics, not tested against `ng-template` + `ngTemplateOutlet`).
- The scaffold's lint set was taken from `preset.ts` comments and `libs/angular/eslint.config.mjs`; I did not generate a scaffold.
- Curriculum value is opinion.

**Weakest point of this spike:** the prototype ran against the dist build, not the scaffold's real lint config, and the rule was only tested on inline templates (via `processInlineTemplates`), not `.html` files.
