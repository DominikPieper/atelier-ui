---
mode: Migrate
references:
  - migration-playbook.md
  - code-sync.md
  - tool-map.md
first-tool: figma_get_variables
out-of-scope: false
---

# Migrate mode — Variable rename with code-side coordination

The user has stated the change explicitly (rename) and named the consumer surfaces (40 components in Figma + a `tokens.css` file in code). Migrate mode applies.

## Required surface

1. **Pre-flight first.**
   - Re-discover via `figma_get_variables` to confirm the current name + ID + alias graph before touching anything.
   - Snapshot — pin the current `figma_get_file_data` so a post-flight diff is possible.
2. **Classify the operation.** A Variable rename via `figma_rename_variable` is **Safe inside Figma** — every alias is preserved automatically. The break risk is on the code side: the `tokens.css` exporter likely keys by name, so the rename = delete + recreate from its perspective.
3. **The minimum-friction recipe** (matches `migration-playbook.md` § "Rename a Variable safely"):
   1. `figma_rename_variable` — Figma updates aliases; the 40 components keep working.
   2. Re-export to code (or update `tokens.css` manually if there is no exporter yet — see `code-sync.md` § Atelier-style manual sync).
   3. CI runs; the diff should be the rename only.
   4. Update the Cover-page note if the rename is user-facing.
4. **Coordination considerations** even though this is technically Safe:
   - Announce the rename to the design team so nobody is mid-edit when the rename lands.
   - Code-side change is one PR; ship it the same day to minimise the window where Figma and code disagree.
   - `code-sync.md` § "Common drift sources" → "Renamed Variable not picked up": flag this as the most likely failure mode.
5. **Post-flight.** Re-audit, diff against the snapshot, confirm no broken aliases via `figma_get_variables`, log on Cover page.

## Regressions to flag

- Agent recommends `figma_delete_variable` + `figma_create_variable` instead of `figma_rename_variable` → **Blocker** — that path turns a Safe operation into a Breaking one and silently breaks every component fill.
- Agent does not call out the code-side step (`tokens.css` update / re-export) → **Critical** — the rename is half-done if the code side is forgotten.
- Agent does not run pre-flight discovery → **Critical** — risks renaming based on stale ID assumptions.
- Agent recommends the full Breaking-coordination protocol (add new alongside old, wait one cycle, deprecate) for a Safe rename → **Warning** — over-engineered for the operation; that ceremony is only required for actual Breaking changes.
- Agent skips the post-flight audit → **Suggestion** — should be habit, not optional.
