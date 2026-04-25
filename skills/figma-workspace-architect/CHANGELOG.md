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
