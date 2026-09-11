# Review checklist — one component, both surfaces

Severity vocabulary is the architect's: **Blocker** (must not merge), **Critical**
(fix before the next release), **Warning**, **Suggestion**. Each row names what checks it
so the report quotes a tool or gate, not an opinion. Items marked _gate_ are already
reported by `npm run check:figma` / `npm run check:parity`; run them and quote them.

| #    | Check                                                                                                                          | Severity | Checked by                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-01 | Variant axis names and values equal the spec's `variantMatrix` verbatim; no axis outside the spec except documented exceptions | Blocker  | `figma_analyze_component_set` vs `libs/spec/src/metadata/<c>.metadata.ts`; _gate_ `check:figma` name alignment; exceptions in `FIGMA_CONFORMANCE_EXCEPTIONS` |
| R-02 | Full variant matrix present on the master                                                                                      | Blocker  | _gate_ `check:figma`                                                                                                                                         |
| R-03 | Fills, strokes, radii, padding bound to `Library Tokens` (or `Component Tokens`), no raw values, no `Docs Brand Tokens`        | Critical | _gate_ `check:figma` token-linked styles; `figma_get_component_for_development` `boundVariables`                                                             |
| R-04 | Every frame with children uses Auto Layout                                                                                     | Critical | _gate_ `check:figma`                                                                                                                                         |
| R-05 | Root frame dimensions and named-layer sizes match the code (ADR-0108 `[ROOT-SIZE]`, `[LAYER-SIZE]`)                            | Blocker  | _gate_ `check:figma`                                                                                                                                         |
| R-06 | Interaction states (hover, focus, active) are not variant-matrix entries; `disabled`/`loading` are Booleans                    | Critical | `figma_analyze_component_set` `stateMachine` vs axes                                                                                                         |
| R-07 | Colour is never the only signal for a status variant (WCAG 1.4.1)                                                              | Critical | `figma_audit_component_accessibility` colorDifferentiation; visual read of the glyph layer                                                                   |
| R-08 | Contrast ≥ 4.5:1 text / ≥ 3:1 large text and focus ring, Light and Dark                                                        | Critical | `figma_lint_design` WCAG rules; code side `figma_scan_code_accessibility`                                                                                    |
| R-09 | Description present and names the `Atl*Spec` interface; variant descriptions where they carry a decision                       | Warning  | _gate_ `check:figma` (presence + reference); read for the rest                                                                                               |
| R-10 | Root text states its leading (ADR-0048) and its size matches the code                                                          | Warning  | manual — `[ROOT-PAINT]` has no typography rule yet (`plan/figma.md` open item)                                                                               |
| R-11 | Inventory tile is an `INSTANCE` of the master; TOC count and date bumped                                                       | Warning  | `figma_get_file_data` on the Inventory page                                                                                                                  |
| R-12 | Parity: declared `codeSpec` sections compared; discrepancies decided; record fresh                                             | Critical | `figma_check_design_parity`; _gate_ `check:parity`                                                                                                           |
| R-13 | Interactive states verified Light and Dark for stateful components                                                             | Warning  | architect `references/code-verify.md`; report says which states were driven                                                                                  |
| R-14 | Behaviour named in the brief is pinned by a test                                                                               | Critical | the component's `*.spec.*`                                                                                                                                   |
| R-15 | Story declares `tags: ['autodocs']`                                                                                            | Warning  | story file                                                                                                                                                   |

## Human prompts (no tool answers these)

- **Detach test.** Would a designer new to the library need to detach this to build a
  screen with it? If yes, the property architecture failed (Boolean/Slot missing).
- **Three-minute test.** Can a newcomer find, place and configure it in three minutes?
- **Rationale.** Does the description say when _not_ to use it?
- **Behaviour.** Does the brief name behaviour (timers, keyboard, live regions) the master
  cannot show, and is it in the handoff document?

## Known false positives — name them, do not re-fix them

- Page-level `figma_lint_design` rule `wcag-color-only` flags AtlBadge, AtlAlert and
  AtlToast variants: it compares raw variant fills and does not walk child nodes, so it
  misses the glyph text layers that already differentiate. The per-component
  `figma_audit_component_accessibility` scored 93–100 on colorDifferentiation for all
  three (`plan/figma.md`).
- Thirteen empty `card-section-2` frames on AtlCard variants are a rename/remove item in
  `plan/figma.md`, not a review finding per component.
- `check:figma` ROOT-BOX block-padding warnings on controls whose padding is _derived_
  from height in code (ADR-0107): the master states 0 by policy.
- Text below 12 px on the Inventory and Colors pages is documentation scaffolding, not
  component text (`plan/figma.md`).
- A parity score that differs between two runs on one commit is not drift; the score is a
  property of the declaration and the sampled node (ADR-0024).
