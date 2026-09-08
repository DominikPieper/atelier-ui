---
mode: Publish
references:
  - dc-html-shape.md
  - palette-mapping.md
  - governance.md
first-tool: (none)
out-of-scope: false
---

# Publish — a gate-verified component becomes a sheet

## Required surface

1. **P0 before any MCP call:** `npm run check:parity` read for the AtlBadge row; a `DRIFT`
   row stops the run with "Review first". Story confirmed to exist.
2. Project `7a6a2f19-…` confirmed by id; `get_claude_design_prompt(project_id)` loaded
   before writing.
3. `_sheet.css` `:root` block read from the project and diffed against
   `tools/design/artboard-palette.css`; updated under the plan if they differ.
4. Sheet composed in the neighbours' shape (reads an existing sheet first), values
   measured from the rendered story Light and Dark, palette names only, node id
   (`55:22`), `AtlBadgeSpec`, parity date cited.
5. `finalize_plan(scope: "paths", writes: [...])` → `write_files` with `if_match` etags →
   `create_support_js` only if the directory lacks `support.js`.
6. `render_preview` → `serve_url` used by tooling only; console/404/blank gate passed.
7. `tools/design/artboards.json` entry (`covers: ["AtlBadge"]`, honest note) →
   `npm run gen:design-status` → `npm run check:design-status` exit code read.
8. Report shows `open_url`, the registry diff, the gate exit code. `serve_url` appears
   nowhere in the report.

## Regressions to flag

- Publishes with a `DRIFT` parity row → **Blocker**.
- `serve_url` in the user-facing report → **Blocker** (leaked credential).
- Literal hex/px in the sheet without a stated reason → **Critical** (ADR-0106).
- Writes without `finalize_plan` / without `if_match` → **Critical**.
- Skips the registry entry or `gen:design-status` → **Critical** — `plan/design-status.md`
  goes stale in the one column it cannot derive.
- Creates a new project without `design_system_id` → **Critical**.
