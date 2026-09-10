---
mode: Build
references:
  - handoff-document.md
  - parity-codespec.md
  - framework-notes.md
first-tool: figma_search_components
out-of-scope: false
---

# Build mode — new composed component from an existing handoff document (workshop case)

The document exists, so step 0 is a read, not a write. The framework is named (React). The
node id belongs to the user's duplicate, not the Atelier file — the handoff document's
Source line puts this in the **workshop case** (SKILL.md §0a): own spec file, no
`parity:record`.

## Required surface

1. **Reads `tasks/handoff-tagchip.md` first** and treats its scope (variants/states in,
   exclusions out, behaviour, reuse decision) as binding. Does not re-derive scope from
   the picture.
2. **Resolves node `612:88` in the user's draft** (`figma_search_components`, then
   `figma_get_component_for_development`, `figma_analyze_component_set`) — and keeps
   `612:88` as provenance in the report.
3. **Confirms the composition claim** via uianatomy (`tag-input` slots + `badge`) and
   records it; reuses `AtlBadge` where the document says so.
4. **Own spec file beside the component** —
   `libs/react/src/lib/tagchip/atl-tagchip.contract.ts`, never a block added to
   `libs/spec/src/index.ts` — because Source names a duplicate draft, not the Atelier
   file. Then the React generator (`atl-component --framework=react`) — it scaffolds
   boilerplate and never reads `libs/spec`, so this step is unaffected by the branch —
   then `storybook-react:docs-list` / `docs-show` for `AtlBadge`.
5. **One framework only.** No edits under `libs/angular` or `libs/vue`.
6. Component + CSS via `--ui-*` only + Testing Library spec + story with
   `tags: ['autodocs']`.
7. `nx test react` and `nx lint react` with exit codes read from redirected output.
8. `figma_check_design_parity` with the sections the document names (at least visual,
   spacing, typography, tokens, componentAPI, accessibility); each discrepancy decided;
   **no `npm run parity:record`** — node `612:88` lives only in the participant's
   duplicate and will never be in `tools/figma/snapshot.json`. The parity check above,
   run and reported, is the closing step.
9. Report separates verified from assumed and names framework, states, sections.

## Regressions to flag

- Generates code before reading the handoff document → **Blocker**.
- Adds the spec block to `libs/spec/src/index.ts` → **Critical** — this is the workshop
  case; that mistake is exactly what turns three expected red gates (`check:sync`,
  `check:a11y-parity`, `check:design-status`) into six by adding `check:spec`,
  `check:variants` (`[UNMAPPED]`) and `check:metadata` (`[MISSING-REGISTRY]`).
- Runs `npm run parity:record` anyway → **Critical** — the node is not, and will never
  be, in `tools/figma/snapshot.json`.
- Touches a second framework → **Blocker** (ADR-0014).
- Story without `tags: ['autodocs']` → **Critical**.
- Parity run with one or two sections only → **Critical** (thin spec compares clean).
- Pipes gate output into `tail`/`grep` and reports the pipe's status → **Critical**.
- Invents a prop not in the spec or the Storybook docs → **Critical**.
- Hardcodes a hex or px that has a `--ui-*` token → **Warning** (gates catch it later; catching it here is the point).
