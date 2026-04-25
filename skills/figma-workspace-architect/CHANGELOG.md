# Changelog

All notable changes to the `figma-workspace-architect` skill.

## 0.2.0 — 2026-04-25

Two new sub-modes plus pre-flight tightening, surfaced while running the
skill end-to-end on a real audit + fix cycle.

### Added

- **Re-verify sub-mode** under Audit. Triggered when an older audit `.md`
  exists and the user asks whether findings are still open before acting.
  Runs only the per-category verify queries from the new
  `references/audit-verify-queries.md`; emits
  `still-open / auto-resolved / state-shifted` per finding and writes the
  result back to the audit's optional Re-verify table.
- **Code-side visual verification** as a Migrate post-flight step. New
  `references/code-verify.md` documents a Storybook + browser-automation
  recipe to confirm Figma↔code parity in Light + Dark after token or
  variant changes. Covers theme-toggle wiring, computed-style readback,
  and common traps (stale Storybook decorators, web-component selectors,
  HMR caching).
- Audit pre-flight now includes **snapshot pinning** (git SHA + Figma
  `lastModified`) and a **cross-source grep** step for each Variable or
  Variant value about to be flagged. Both are documented in the *Inputs*
  section of `references/audit-checklist.md`.
- `assets/audit-report-template.md` gains a `Generated against` header
  line, a per-finding `Verified at` field, and an optional Re-verify
  result table.
- The bare keyword "Figma" is now a trigger for the skill when paired
  with an architectural / audit verb ("fix in Figma", "audit Figma",
  "update Figma to match X").
- Two new test scenarios: `re-verify-stale-audit` and
  `code-verify-token-rename`.

### Changed

- TA4 (Variable Scopes) now explicitly excludes `BOOLEAN` variables
  (feature flags) from the `ALL_SCOPES` count. They are never bound into
  design properties and were noise in prior audit runs.

### Fixed

- `migration-playbook.md` step 5 (Remove) now documents the
  variable-removal verification gotcha: after `Variable.remove()` the
  variable can still appear in `figma.variables.getVariableByIdAsync(id)`
  for a tick. The reliable check is reading the parent collection's
  `variableIds` array — the removed ID will be absent there.

## 0.1.0 — Initial release

- Four-mode skill (Build, Audit, Decide, Migrate) with Scaffold sub-mode
  under Build.
- 10 references: token-architecture, component-design,
  naming-and-file-structure, build-workflow, audit-checklist, tool-map,
  decision-heuristics, code-sync, migration-playbook, iconography,
  scaffold-payload.
- 6 baseline test scenarios covering the four modes plus an out-of-scope
  case.
