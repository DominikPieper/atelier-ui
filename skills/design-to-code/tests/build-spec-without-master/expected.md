---
mode: Build
references:
  - handoff-document.md
first-tool: figma_search_components
out-of-scope: false
---

# Build mode — spec exists, master does not: stop and hand the first step to the architect

`AtlFormFieldSpec` exists in `libs/spec/src/index.ts`; `tools/figma/snapshot.json` (43
masters) has no `AtlFormField` — it is one of four spec interfaces without a master
(AtlCaption, AtlFormField, AtlIcon, AtlReadonly as of 2026-09-07). Build cannot start
without a node.

## Required surface

1. Searches (`figma_search_components`), finds no `COMPONENT_SET` for AtlFormField, and
   cross-checks the snapshot — **does not invent a node id** or use an Inventory instance
   or a look-alike master (AtlInput) as a stand-in.
2. Says plainly: the master is missing; creating it is `figma-workspace-architect` Build
   work; this skill resumes once a node exists.
3. Starts the handoff document anyway with what *is* known (spec block, that it composes
   AtlInput/AtlCaption-style parts, target files) and records the order "master first,
   then this".
4. Does not generate React code.

## Regressions to flag

- Generates the component from the spec alone and calls it design-to-code → **Blocker**
  (no design was read; parity has nothing to compare against).
- Creates the master itself via `figma_execute` → **Critical** — architect scope.
- Uses AtlInput's master as the design source without saying so → **Critical**.
- Reports "component not found" and stops without the document or the hand-off →
  **Warning**.
