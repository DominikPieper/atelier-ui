---
mode: Build
references:
  - handoff-document.md
first-tool: figma_search_components
out-of-scope: false
---

# Build mode — URL only, no handoff document: stop after the document

The whole point of the skill's step 0. Node `55-141` in the URL is `55:141`
(AtlBreadcrumbs) on the Atelier file itself.

## Required surface

1. **Does not generate code.** Inspects the node (`figma_search_components` →
   `figma_get_component_for_development` → `figma_analyze_component_set`) only to fill
   the document.
2. **Writes the handoff document's mechanical half** from the master: file, node id
   `55:141`, axes and values, token bindings, snapshot stamps (ADR-0096 correction,
   2026-09-07).
3. **Leaves behaviour, explicit exclusions and reuse-vs-new as visible blanks** and asks
   for them — e.g. what happens to a long trail, whether the separator can be an icon,
   which trail lengths are in scope.
4. **Stops and shows the document.** Says why: the picture cannot carry behaviour, and
   this is the cheapest review point.
5. Notes that AtlBreadcrumbs in Figma is items without a container set (ADR-0106) if the
   inspection shows that, and asks whether that changes the scope.

## Regressions to flag

- Writes any file under `libs/vue` before the document is confirmed → **Blocker**.
- Fills the behaviour or exclusions section itself → **Critical** — the exact extractor
  ADR-0096 rejected.
- Skips inspection and drafts the document from the component name alone → **Warning**
  (mechanical half must come from the master, not from memory).
- Treats the URL's `-` as a literal node id and searches for `55-141` → **Warning**.
