---
mode: Build
references:
  - handoff-document.md
  - parity-codespec.md
  - framework-notes.md
first-tool: figma_search_components
out-of-scope: false
---

# Build mode — new composed component from an existing handoff document (repo case)

Same composition as the workshop TagChip fixture (`build-from-handoff-react`), the
opposite branch: the handoff document's Source line names the Atelier file itself
(key `QMnDD8uZQPldPrlCwZZ58T`), not a duplicate — this is the **repo case** (SKILL.md
§0a). The two fixtures differ only where the branch says they should: where the spec
goes, and whether the run closes on `parity:record`. Everything else — inspection,
canon, docs, generation, gates — runs the same way.

## Required surface

1. **Reads `tasks/handoff-tagchip.md` first** and treats its scope as binding, exactly as
   in the workshop fixture.
2. **Resolves node `812:4` in the Atelier file itself** (`figma_search_components`, then
   `figma_get_component_for_development`, `figma_analyze_component_set`) — confirms it is
   the master on the Components page, not an Inventory instance — and keeps `812:4` as
   provenance in the report.
3. **Confirms the composition claim** via uianatomy (`tag-input` slots + `badge`) and
   records it; reuses `AtlBadge` where the document says so.
4. **Adds the spec block to `libs/spec/src/index.ts`** (repo case — not a file beside the
   component) first, then the Angular generator (`atl-component --framework=angular`),
   then `storybook-angular:docs-list` / `docs-show` for `AtlBadge`.
5. **One framework only.** No edits under `libs/react` or `libs/vue`.
6. Component + CSS via `--ui-*` only + Testing Library spec (Angular Testing Library) +
   story with `tags: ['autodocs']`.
7. `nx test angular` and `nx lint angular` with exit codes read from redirected output.
8. `figma_check_design_parity` with the sections the document names (at least visual,
   spacing, typography, tokens, componentAPI, accessibility); each discrepancy decided;
   then **`npm run parity:record -- --component AtlTagChip --node 812:4`** — the node is
   real and reachable from `tools/figma/snapshot.json` once the master exists, so the
   record is meaningful here in a way it is not for the workshop fixture's duplicate.
9. Report separates verified from assumed and names framework, states, sections.

## Regressions to flag

- Puts the spec in its own file "to be safe" → **Critical** — this is the repo case
  (Source names the Atelier file); the spec belongs in `libs/spec/src/index.ts` like
  every other Atelier component, or `check:sync`'s cross-framework mirror has nothing to
  copy.
- Skips `npm run parity:record` because "that's what the workshop does" → **Critical** —
  the workshop's stop-after-the-ad-hoc-check rule (SKILL.md §7) applies only when Source
  names a duplicate; this node is real.
- Touches a second framework → **Blocker** (ADR-0014).
- Story without `tags: ['autodocs']` → **Critical**.
- Parity run with one or two sections only → **Critical** (thin spec compares clean).
- Pipes gate output into `tail`/`grep` and reports the pipe's status → **Critical**.
- Invents a prop not in the spec or the Storybook docs → **Critical**.
