---
status: accepted
date: 2026-10-06
sources:
  - tasks/p3-3-angular-usage-rules-spike-2026-10-06.md (13 candidates against `strictTemplates`)
  - tasks/todo.md ("Structure lessons from the DB UX Design System", P3)
  - tools/eslint-rules/atl-button-icon-only-needs-name.js, atl-sub-component-needs-parent.js (+ tests)
  - libs/angular/src/lib/a11y-dev-warn.ts, libs/vue/src/lib/a11y-dev-warn.ts
  - db-ux-design-system/core-web `packages/eslint-plugin` (a published usage plugin)
---

# ADR-0152: Usage errors close at runtime for everyone; a teaching pair closes them at lint time

## Status

Accepted 2026-10-06 by the owner, who chose the split option.

## Context

DB UX publishes `@db-ux/core-eslint-plugin`, which checks how a consumer uses its components in templates. The P3.3 spike asked whether Atelier needs the same. It wrote 13 candidate misuses into a scratch Angular consumer and compiled it with `strictTemplates` and the scaffold's other strict flags:

- **The type-check caught none of them.** Six control misuses did error, so the harness worked.
- **The scaffold's angular-eslint `templateAccessibility` preset reported none of them.**
- **Five survived as worth a check:**
  1. an icon-only `atl-button` with no accessible name;
  2. `atl-dialog`/`atl-drawer` with no title;
  3. `atl-input`/`atl-textarea`/`atl-select` with no accessible name;
  4. a sub-component outside its required parent;
  5. `atlTooltip` on a non-interactive host. This was dropped as the highest false-positive risk.
- **Two kinds of gap:**
  - Gap 4 already fails loudly at runtime: a non-optional `inject()` throws NG0201 (inferred from the source, not mounted).
  - Gaps 1–3 are silent. Only `AtlButton` had a dev-mode warning, which covered gap 1 at runtime.

The spike's own counter-argument settled the shape. Atelier has few external consumers. A lint rule protects only a project that has the lint setup. A warning in the component protects every consumer in every build tool.

## Decision

1. **The silent a11y gaps become dev-mode warnings in the components.**
   - Coverage: `AtlDialog`, `AtlDrawer`, `AtlInput`, `AtlTextarea` and `AtlSelect`, in Angular and Vue. This copies the existing `AtlButton` pattern:
     - Angular: `ngDevMode` with `afterNextRender`.
     - Vue: `import.meta.env.DEV` with `onMounted`.
     - The message reads `[Component] <problem> — <fix>`.
     - The check runs once per instance, after inputs settle.
   - React has no such pattern. There, the button name is enforced by types, so no React warning was invented.
   - `AtlCombobox` is left out. It has no `label`/`aria-label` input at all, so a warning would have no fix to name. That is an API gap, tracked separately.
2. **Two template rules ship as a teaching pair, vendored into the scaffold.** They are not published as a package.
   - `atl-button-icon-only-needs-name`: the lint-time twin of the button's runtime check.
   - `atl-sub-component-needs-parent`: the composition rule.
   - The scaffold gets them under `tools/eslint-rules/` and wires them onto Angular `**/*.html`. They are kept byte-identical by `check:preflight-clone-sync`, the same way ADR-0130 handles the stylelint rules.
   - Their tests stay in this repo, because they read repo paths, and `check:eslint-rules` runs them.
3. **The parent table in the composition rule is kept true by a test that reads the source, not by hand.**
   - The scaffold has no component sources, so the rule cannot derive its table at lint time.
   - Instead, a test parses `libs/angular` with the TypeScript API. It finds every non-optional `inject(Token | Class)`, resolves the token to the component that provides it, and requires the table's `inject` rows to equal that set.
   - `slot` rows are compositions without an `inject()`: dialog/drawer content and footer, and `atl-menu-item`, whose CDK inject is optional. The test checks these are documented in the JSDoc and really have no `inject()`.
4. **Story templates are linted too.**
   - A story's `render: () => ({ template })` is not an `@Component`, so the stock Angular processor never read it, and no template rule had ever seen this repo's own consumer-style templates.
   - A repo-only processor now extracts them into `.atl-tpl` virtual files, so they get the usage rules without the stricter `**/*.html` set.

## Why

- **Runtime first, because it reaches every consumer.** For the a11y gaps the question is "does every consumer find out", not "can a linter spot it". A dev-mode warning answers yes without any setup. A lint rule only reaches the consumers who have it configured.
- **Lint rules still earn a place, as curriculum.** Writing a template rule is a skill a participant will need for their own design system. A rule shipped as readable files in their repo teaches it, which is the same reasoning that kept the stylelint rules vendored (P3.2, 2026-10-06). One a11y rule and one composition rule cover the two kinds of rule worth knowing.
- **Rejected: an npm package.** It would add release surface for few consumers, and it hides the rules the workshop wants to show.
- **Rejected: all four lint rules.** Rules for the dialog and form-control gaps would duplicate the runtime warnings and add no teaching value beyond the button rule.
- **Rejected: a hand-kept parent table without a check.** The spike named it as the plan's weakest point: a second copy of knowledge the components already state in their `inject()` calls.
- **Rejected: `title` as an accessible name.** This follows `AtlButton`'s runtime check.

## Consequences

- **The warnings surfaced 53 unnamed form fields in this repo's own Angular stories** (31 `AtlInput`, 11 `AtlSelect`, 11 `AtlTextarea`). About 79 sites across 15 Angular and Vue story files got an `aria-label`, added only where no visible `label` arg is set. The story run now logs 0 such warnings.
- **The composition rule found no misuse in this repo's templates.** Both rules were proven live with a temporary bad story and a temporary bad inline component.
- **Known limits of the composition rule:**
  - it is template-local, so a sub-component projected through a non-`atl-*` wrapper is not flagged;
  - a component whose whole template is a lone `<atl-option>` is a false positive;
  - `[attr.aria-label]="null"` is a false negative for the button rule.
- **Open follow-ups**, tracked in `tasks/todo.md`:
  - `AtlCombobox` needs a name API;
  - the input/textarea `label-title-only` axe waivers may now be removable;
  - the generated scaffold's own `nx lint` has not been run with the new rules;
  - the scaffold's lint cache does not yet list `tools/eslint-rules` as an input.
