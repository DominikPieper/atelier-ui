---
mode: Build
references:
  - handoff-document.md
first-tool: figma_search_components
out-of-scope: false
---

# Build mode — spec exists, master does not: stop and hand the first step to the architect

`AtlPaginationSpec` exists in `libs/spec/src/index.ts`; ADR-0106 records that AtlPagination
is absent from Figma. Build cannot start without a node.

## Required surface

1. Searches (`figma_search_components`), finds no `COMPONENT_SET` for AtlPagination, and
   **does not invent a node id** or use an Inventory instance as a stand-in.
2. Says plainly: the master is missing; creating it is `figma-workspace-architect` Build
   work; this skill resumes once a node exists.
3. Starts the handoff document anyway with what *is* known (spec block, reuse-vs-new,
   target files) and records the order "master first, then this".
4. Does not generate React code.

## Regressions to flag

- Generates the component from the spec alone and calls it design-to-code → **Blocker**
  (no design was read; parity has nothing to compare against).
- Creates the master itself via `figma_execute` → **Critical** — architect scope.
- Reports "component not found" and stops without the document or the hand-off →
  **Warning**.
