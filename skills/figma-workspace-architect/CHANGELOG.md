## 0.2.13 (2026-04-26)

### 🩹 Fixes

- **release:** no-op nx-release-publish for figma-workspace-architect skill ([32b23af](https://github.com/DominikPieper/atelier-ui/commit/32b23af))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.2.12 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.11 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.10 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.9 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.8 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.7 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.6 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.5 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.4 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.3 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.2 (2026-04-26)

This was a version bump only for figma-workspace-architect to align it with other projects, there were no code changes.

## 0.2.1 (2026-04-25)

### 🚀 Features

- **skills:** figma-workspace-architect — auto-release + discovery mirror ([b1725d6](https://github.com/DominikPieper/atelier-ui/commit/b1725d6))
- **skills:** figma-workspace-architect — trigger on bare "Figma" keyword ([d95a4ed](https://github.com/DominikPieper/atelier-ui/commit/d95a4ed))
- **skills:** figma-workspace-architect — audit freshness + code verify ([e2fb1db](https://github.com/DominikPieper/atelier-ui/commit/e2fb1db))
- **skills:** scaffold-payload reference + Build Scaffold sub-mode ([d47011c](https://github.com/DominikPieper/atelier-ui/commit/d47011c))
- **skills:** add iconography reference ([074a75a](https://github.com/DominikPieper/atelier-ui/commit/074a75a))
- **skills:** add behavior-spec test fixtures + nx test target ([cfa1e90](https://github.com/DominikPieper/atelier-ui/commit/cfa1e90))
- **skills:** add Migrate mode + migration-playbook reference ([cd68b28](https://github.com/DominikPieper/atelier-ui/commit/cd68b28))
- **skills:** code-sync reference + payload examples + CI package gate ([#4](https://github.com/DominikPieper/atelier-ui/issues/4))
- **skills:** add figma-workspace-architect Claude Code skill ([db2035c](https://github.com/DominikPieper/atelier-ui/commit/db2035c))

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.2.0 (2026-04-25)

Two new sub-modes plus pre-flight tightening, surfaced while running the skill end-to-end on a real audit + fix cycle.

### 🚀 Features

- **audit:** snapshot-pin pre-flight (git SHA + Figma lastModified) and cross-source grep step in `references/audit-checklist.md`
- **audit:** Re-verify sub-mode with per-category verify queries in new `references/audit-verify-queries.md`; emits `still-open / auto-resolved / state-shifted` per finding
- **migrate:** code-side visual verification recipe in new `references/code-verify.md` for Storybook + browser-automation parity check after token/variant changes
- **report:** `assets/audit-report-template.md` gains `Generated against` header, per-finding `Verified at` field, and optional Re-verify table
- **trigger:** bare keyword "Figma" now triggers the skill when paired with an architectural / audit verb
- **tests:** two new test scenarios — `re-verify-stale-audit` and `code-verify-token-rename`

### 🩹 Fixes

- **audit:** TA4 (Variable Scopes) explicitly excludes `BOOLEAN` feature-flag variables from the `ALL_SCOPES` count — they are never bound into design properties and were noise in prior audits
- **migrate:** `references/migration-playbook.md` step 5 now documents the variable-removal verification gotcha — after `Variable.remove()`, `getVariableByIdAsync` may still return the variable for a tick; check the parent collection's `variableIds` instead

### ❤️ Thank You

- Claude Opus 4.7 (1M context)
- Dominik Pieper

## 0.1.0 (2026-04-25)

Initial release.

### 🚀 Features

- Four-mode skill (Build, Audit, Decide, Migrate) with Scaffold sub-mode under Build
- 10 references: `token-architecture`, `component-design`, `naming-and-file-structure`, `build-workflow`, `audit-checklist`, `tool-map`, `decision-heuristics`, `code-sync`, `migration-playbook`, `iconography`, `scaffold-payload`
- 6 baseline test scenarios covering the four modes plus an out-of-scope case
