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
§0a). The two fixtures differ only where the branch says they should: where the contract
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
4. **Both artefacts the repo case still needs (until ADR-0121 S6):** adds the spec block
   to `libs/spec/src/index.ts` and writes the micro-contract at
   `libs/spec/src/contracts/tag-chip.contract.ts` — first, then the Angular generator
   (`npx nx g @atelier-ui/generators:atl-component tag-chip --framework=angular`), then
   `storybook-angular:docs-list` / `docs-show` for `AtlBadge`.
5. **One framework only.** No edits under `libs/react` or `libs/vue`.
6. Component + CSS via `--ui-*` only + Testing Library spec (Angular Testing Library) +
   one story per variant value and Boolean state, `args`-based, a `play` per behaviour
   line from the handoff document, `tags: ['autodocs']`.
7. `nx test angular`, `nx lint angular` and `nx storybook-test angular` with exit
   codes read from redirected output.
8. `npm run check:contracts` (default run, all three frameworks) exits 0, then
   `figma_check_design_parity` with a `codeSpec` assembled from `check:contracts --emit`
   plus `figma_scan_code_accessibility`, and the document's remaining sections (at least
   visual, spacing, typography); each discrepancy decided; then **`npm run parity:record
   -- --component AtlTagChip --node 812:4`** — the node is real and reachable from
   `tools/figma/snapshot.json` once the master exists, so the record is meaningful here in
   a way it is not for the workshop fixture's duplicate.
9. Report separates verified from assumed and names framework, states, sections.

## Regressions to flag

- Puts the contract in its own file beside the component instead of also keeping the spec
  block in `libs/spec/src/index.ts` → **Critical** — this is the repo case (Source names
  the Atelier file); until ADR-0121 S6, both the legacy spec block and the micro-contract
  are required, or `check:sync`'s cross-framework mirror has nothing to copy.
- Skips `npm run parity:record` because "that's what the workshop does" → **Critical** —
  the workshop's stop-after-the-ad-hoc-check rule (SKILL.md §7) applies only when Source
  names a duplicate; this node is real.
- Touches a second framework → **Blocker** (ADR-0014).
- Story without `tags: ['autodocs']`, missing a variant value or state, or a `play`
  without an assertion → **Critical**.
- Skips `check:contracts` or `storybook-test` before the parity call → **Critical**.
- Parity run with one or two sections only → **Critical** (thin spec compares clean).
- Pipes gate output into `tail`/`grep` and reports the pipe's status → **Critical**.
- Invents a prop not documented on the component or in the Storybook docs → **Critical**.
