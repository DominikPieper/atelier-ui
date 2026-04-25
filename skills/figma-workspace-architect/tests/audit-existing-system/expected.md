---
mode: Audit
references:
  - audit-checklist.md
  - tool-map.md
first-tool: figma_get_file_data
out-of-scope: false
---

# Audit mode — assess an existing system, prioritised output

Two layers, in order. Output uses `assets/audit-report-template.md`.

## Required surface

1. **Try the Design System Dashboard MCP App first** if `ENABLE_MCP_APPS=true`. Treat it as the breadth layer (Naming, Tokens, Components, A11y, Consistency, Coverage). Do not duplicate its findings in the deep audit.
2. **Architectural deep-audit** via `references/audit-checklist.md`. Five categories:
   - Token Architecture
   - Component Design
   - Naming
   - File Structure
   - Engineering-Sync Readiness
   Each finding tagged Blocker / Critical / Warning / Suggestion with a one-line fix.
3. **Lead with the priority list** — Blockers and Criticals at the top with effort estimates ("~30 min", "~1 day", "multi-week"). The user explicitly asked for "what to fix first, not a 40-page report" — bury the category-by-category walk-through behind the priority list.
4. **Discovery via `figma_get_file_data`** to load the structure into the audit context. For very large files prefer `figma_get_variables` + `figma_get_styles` separately.
5. **Output template** = `assets/audit-report-template.md`. Frontmatter (file name, ISO date, mode availability) + Priority list + Findings by category.

## Regressions to flag

- Agent produces a category-by-category report without a priority list → **Critical** (user explicitly asked for prioritisation).
- Agent re-implements A11y or Coverage scoring that the Dashboard already covers → **Warning** (duplicated effort and likely contradictory numbers).
- Findings without severity tags → **Critical** — the user can't prioritise without them.
- Findings without a one-line fix → **Warning** — "this is wrong" without the fix forces a follow-up turn.
- Agent skips discovery and hallucinates findings about the file → **Blocker**.
