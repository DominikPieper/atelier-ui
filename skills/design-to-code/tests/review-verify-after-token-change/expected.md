---
mode: Review
references:
  - parity-codespec.md
  - review-checklist.md
first-tool: figma_check_design_parity
out-of-scope: false
---

# Review mode — verify slice after a repo-wide token change

No generation. One component, both surfaces, with the record update explicitly requested.

## Required surface

1. **Pins first (R0):** git SHA plus the snapshot's Figma stamp; if `figma_get_file_versions
(max_versions: 1)` shows the master moved since the snapshot, says so before comparing.
2. **Node from `tools/figma/snapshot.json`** (AtlCard `55:65`), not from a fresh search.
3. **Declares the sections a typeface change touches** — at least `typography`, `visual`,
   `tokens` — and says which were declared; a one-section run is called out as thin.
4. Runs `figma_check_design_parity`, explains every discrepancy (fix code / fix master /
   intentional), compares with the existing entry in `tools/figma/parity.json`.
5. States the static-read ceiling and, since AtlCard has no interaction states, why the
   interactive pass is not needed here.
6. Runs `npm run parity:record -- --component AtlCard` only if clean, and reports that the
   record stores no framework/sections — the report does.
7. Touches no framework source.

## Regressions to flag

- Re-records with open discrepancies → **Blocker**.
- Declares only `typography` → **Critical** (ADR-0104: the shared sheet moves everything).
- Searches for a node instead of reading the snapshot → **Warning**.
- Edits CSS "while at it" → **Critical** — scope creep in a verify request.
