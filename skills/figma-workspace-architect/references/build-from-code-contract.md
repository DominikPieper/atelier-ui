# Build from a code contract — spec block → conformant master

A Build-mode recipe for the case where the **code side already states the component**:
a typed prop contract (a TypeScript interface with string-literal unions, a Vue
`defineProps`, a web-component attribute table) exists, and Figma needs a master that
the codebase's own gates will accept as _the same thing_. The direction is the reverse
of design-to-code; the discipline is the same — names, values and bindings match
verbatim, and the run ends in whatever gate the repo has, not in a screenshot.

Use it when the user says "put X into Figma", "create the master for X", "Figma is
behind the code", "the spec changed, update the master". Structural changes to an
existing master (rename, split) are Migrate, not this.

## Inputs — collect before the first write

| Input                                                   | Where it comes from                                                                                                                                 | Why it is needed                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Prop contract                                           | the spec/interface file the repo treats as ground truth                                                                                             | axis names and values are copied from it, never paraphrased         |
| Which props are variant axes vs. Booleans vs. code-only | the repo's own metadata (a `variantMatrix`, a props table) or the rule "visibly distinct → Variant; on/off → Boolean; interaction states → neither" | decides the matrix size before a frame exists                       |
| Semantic variable collection                            | `figma_get_variables`, filtered to the collection code binds to                                                                                     | fills, strokes, radii, spacing bind here; primitives never directly |
| Naming rule                                             | the repo's gate (e.g. "leaf of a section-prefixed name equals the selector; axis values equal the union literals")                                  | the gate compares strings                                           |
| Category / page placement                               | the repo's story taxonomy or the library's page layout                                                                                              | the section a master lives in is part of its name                   |
| Description convention                                  | what the gate or the docs expect the description to name (a spec interface, a Storybook link)                                                       | descriptions are the discoverability layer                          |
| The closing gate                                        | `npm run …`, a snapshot refresh, a parity check — whatever proves the master to the repo                                                            | a build without it is a drawing                                     |

## Recipe

1. **Discovery.** `figma_search_components` for the name — a master may already exist
   under an older name or as a single `COMPONENT`. Read the semantic collection's
   variables you will bind (`figma_get_variables`). Read the category section's position
   on the Components page (`figma_get_file_data`) so the new master lands in it, not on
   bare canvas.
2. **Decide the matrix.** From the contract: variant axes × values (visibly distinct
   only), Booleans (on/off layers, `disabled`/`loading` and the like), Text and Instance
   Swap properties, and what stays code-only (interaction states, callbacks). Write the
   list down before drawing; a 4 × 3 × 4 matrix drawn "to be safe" is the anti-pattern
   `component-design.md` CD1 exists for.
3. **Build the variants** — `figma_create_component_set` when the matrix is ≤ 40
   frames (hard cap 100), otherwise `figma_execute` in chunks. Every frame Auto Layout;
   every fill, stroke, radius, padding and gap bound to the semantic collection
   (`figma_set_fills` / `figma_set_strokes` validate the paint shape); text on the
   library's text styles. Read `plugin-api-gotchas.md` first — `resize()` flips sizing
   to FIXED, `layoutMode` after `resize()` reverts to AUTO, `SPACE_BETWEEN` centres a
   lone child.
4. **Name to the gate.** Set name and axis names/values exactly as the contract spells
   them (`variant=primary`, not `Type=Primary`). `figma_arrange_component_set` for the
   grid; `figma_add_component_property` for Booleans/Text/Instance Swap.
5. **Describe.** `figma_set_description` naming the contract (interface name), the
   use-when / don't-use-when, and the Storybook or docs link. CD6.
6. **Annotate** behaviour the picture cannot carry (focus ring delivery, timers,
   keyboard) with `figma_set_annotations`; mark the section `READY_FOR_DEV` via
   `figma_execute` (`devStatus`).
7. **Catalogue.** If the library keeps an inventory page, place one `INSTANCE` of the
   master there (never a copy) and bump the page's count/date block.
8. **Validate live.** `figma_capture_screenshot` (not the REST screenshot right after a
   write). Look for clipped labels, wrong scopes, a frame that shrink-wrapped.
9. **Close with the repo's gate.** Refresh the repo's Figma snapshot if it keeps one, run
   the conformance gate, read its exit code from a redirected file. Only then report.

Return every node id you created — the repo's records (parity, snapshot, stories'
design links) will want them.

## Worked example — the Atelier monorepo

Contract: `libs/spec/src/index.ts` (`Atl<Name>Spec`, string-literal unions) and
`libs/spec/src/metadata/<name>.metadata.ts` (`variantMatrix`). Semantic collection:
**`Library Tokens`** (generated from `tokens.css` by `gen-figma-library-tokens.mjs`; no
shadow variables — elevation is CSS-only, state it in the description). Naming gate:
`check:figma` compares the leaf of `Category/AtlName` with the selector and axis values
with the union literals as strings (Blocker), checks token-linked styles and Auto Layout
(Critical), and requires the description to reference the `Atl*Spec` name (Warning).
Category = the Storybook `title:` prefix (`Inputs`, `Display`, `Navigation`, `Overlay`,
`Feedback`), stacked on the Components page in `storySort.order`. Inventory: one
`INSTANCE` per master on the Inventory page plus the TOC count and date. Close:
`npm run figma:snapshot` (needs the Desktop Bridge) then
`npm run check:figma > /tmp/f.out 2>&1; echo $?` — zero, or the run is not done.
The `design-to-code` skill picks up from here (its Build mode needs a node id).

## What this recipe does not decide

Whether a prop _should_ be a variant axis is a Decide-mode question
(`decision-heuristics.md`); whether an existing master should be renamed or split is
Migrate (`migration-playbook.md`); whether the values themselves are right is the code
side's business — this recipe copies the contract, it does not review it.
