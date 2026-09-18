# southleft/ds-contracts-poc — prior art against ADR-0121

Method: read 2026-09-18 via `gh api repos/southleft/ds-contracts-poc/contents/<path>` (base64
→ raw), never WebFetch's summarisation path, so every quote below is byte-exact at HEAD
`c6ad571`. A delegated agent produced the first digest; the four findings this note's
conclusion rests on were re-fetched and re-read directly before being used. Findings are
[verified] unless marked otherwise.

Reached via a SmashingConf Freiburg 2026 conference note on TJ Pitre's "Context-Based Design
Systems in Practice" (`https://www.pavingways.com/en/blog/design-systems-ai-context-tj-pitre-smashingconf`),
which names the repo as "a candidate for a vendor-neutral specification, not a completed
standard". Same author as `figma-console-mcp`, the MCP server this repo uses.

## 1. What their contract is

[verified] 55 canonical component contracts under `contracts/*.contract.json`, 51 of them in
the generated catalog. `contracts/button.contract.json` top-level keys, read directly:
`$schema, id, name, version, status, description, archetype, semantics, props, states,
anatomy, a11y, bindings` — `version: "1.5.0"`, `status: "draft"`, no `provenance` key.

`props` carries name, type, default and per-surface bindings; `anatomy.root` carries tokens,
states, layout and a part tree; `a11y` carries `focusVisible` / `minHitArea: 44` /
`contrast: "AA"`; `bindings` carries the Figma anchors (fileKey, componentSetKey, nodeId) and
the code anchors (importPath, export). `checkbox.contract.json` additionally carries events as
data: `{"name":"toggle","trigger":"input","bindings":{"code":{"prop":"onToggle"}},"toggles":
{"prop":"value","between":["unchecked","checked"]}}`.

[verified] The schema is Zod — `packages/schema/src/contract-schema.ts`, 3187 lines,
`z.strictObject`, 20 top-level properties of which 8 are required, plus a generated 44KB JSON
Schema at `contracts/contract.schema.json`. Three fields are typed `z.never()`: legacy
spellings refused by name rather than ignored.

[verified] The 126 files under `conformance/seeds/*.contract.json` are **not** component
contracts — they are deliberately prop-less CSS-construct probes for the conformance suite
("SEED contract for the CSS/DOM conformance fixture"). Counting them as contracts overstates
the library by more than 2×.

## 2. The actual fork: generation vs. derivation

This is the disagreement, and it is not about how much a contract should hold. It is about
which artefact is authored.

Their contract is **hand-authored and generates both surfaces**: `core/emit-react.ts` emits
complete `forwardRef` components with typed props and CSS Modules (not scaffolding —
`src/components/Button/Button.tsx` is a finished component), and `core/emit-figma-script.ts`
(9468 lines) emits Figma Plugin-API _script text_ that must be executed inside Figma to create
the nodes. One authored file, two generated surfaces, duplication removed by generation. That
is why the schema needs 3187 lines: the contract must express everything both surfaces need.

ADR-0121 bets the other way. The surfaces are authored natively — the master by a designer in
Figma, the adapters by hand in each framework's idiom (ADR-0005, explicitly no codegen) — and
the contract holds only the deliberate _difference_ between them, with props, defaults, unions
and descriptions **forbidden** in it because they are derived from the docgen manifest, the
Figma snapshot and the stories' `args`. Duplication removed by derivation plus gates.

Neither shape refutes the other; they pay different costs. Theirs pays for a vocabulary large
enough to generate from, and inherits every limit of the smaller surface. Ours pays three
hand-written adapters and gets a contract that can generate nothing.

## 3. Four places they arrive independently at Atelier's rules

1. **Never sync side-to-side.** `parity/diff.ts`: "Diffs each live surface against the
   CONTRACT (never side-to-side): code⟷contract, figma⟷contract, figma-canvas⟷canvas+contract,
   figma-variables⟷tokens." Same shape as `check:contracts`, which joins the contract, the
   manifest and the stories against the Figma snapshot rather than comparing adapters.
2. **Interaction states are CSS, not Figma.** `core/emit-figma-script.ts` header, line 34:
   "Interaction states are CSS concerns; not represented in Figma." That is ADR-0114 and the
   `state`-axis exclusion in `ComponentContract`'s field docs, reached by a second team that
   had not read either.
3. **Both directions of divergence are first-class.** Their `bindings.figma.statePreviews:
true` draws a canvas-only State axis that the code does not implement, described in
   `docs/02-contract-spec.md` as the mirror of code-only events — i.e. `figmaOnly` and
   `codeOnly`, under other names (ADR-0145).
4. **A Figma snapshot goes stale and only a desktop session can refresh it.** Their
   `AGENTS.md:53`: "`npm run parity` is deliberately excluded from the gates and will exit 1 on
   a healthy tree with `snapshot-stale` findings — the committed Figma snapshots expire by
   design and can only be refreshed from Figma desktop." The same constraint that blocks the
   `AtlAvatar.status` axis here (`tasks/todo.md:1508`).

## 4. Where they went further — and it is the thing ADR-0145 declined to build

`docs/16-sync-boundary.md` draws their boundary and then mechanises the overflow:

> **The contract will never carry:** hooks, event handlers, business logic, data fetching, side
> effects, or any behavior that exists only at runtime. Not "not yet" — _never, by design_. […]
> the **sync surface** is capped at what a Figma component set can express, because that is the
> largest surface on which a _deterministic_ round trip is possible.

And then:

> Every extraction writes a **`*.extension.json` sidecar** next to the contract: the named
> overflow — every captured fact the vocabulary refuses to carry, each entry stating _why_ it
> does not fit. […] **Refusal is named, never silent.** A fact outside the vocabulary appears in
> the sidecar with its reason — it is findable, diffable, and **countable** (the eval suite
> gates 17 distinct refusal classes). […] **The sidecar is not contract vocabulary.** Emitters
> never read it; nothing downstream can quietly depend on unspecified facts.

That is, precisely, the mechanism ADR-0145 Decision 4 declined to build today: a named kind per
refused fact, classified, counted, and gated. Their 17 refusal classes are the `kind`
discriminator; their eval suite is the ratchet. The difference in kind is real — their sidecar
records what an _automated extraction_ could not express, while Atelier's divergence entries
record what a _human decided_ the two sides should disagree about — but "refusal is named,
never silent, and countable" transfers without modification.

Note also that their boundary is drawn differently from ADR-0145's: theirs is
**canvas-expressible**, ours is **drawn**. A Figma component set could express `headingLevel`
as a five-value axis; it would draw nothing. Their cap admits it, our test rejects it. Ours is
the narrower boundary, and deliberately so, because we are not generating the master from it.

## 5. Where the claim is thinner than the pitch

[verified] `CONTRIBUTING.md`: "This repo is a proof of concept with spec ambitions." The repo
name says `-poc`. `package.json` is `1.0.0-rc.1`; `docs/CURRENT.md` (2026-09-17): "v1 is not
complete." `README.md`: "V1 focuses on React ↔ contracts ↔ Figma. Lit and Web Components
integration is paused for a planned V1.1 follow-up." No Vue, Angular or Svelte adapter exists
anywhere in the tree — so "vendor-neutral" is a claim about the _format_, not about shipped
bindings, and the one axis Atelier most needs tested (three frameworks from one contract) is
the untested one.

[verified] Adoption: one human contributor (`tpitre`, 2435 commits) plus dependabot and an
agent bot; 0 forks; all 114 issues filed by the same author as internal tracking. 57 stars. No
external adoption signal found. `docs/00-choose-your-path.md`: "Of the three paths below,
exactly ONE is supported end-to-end for the beta… path B on the Flowbite lane."

## 6. What this changes here

Nothing in ADR-0121 is refuted. The two projects made opposite, coherent bets about which
artefact is authored, and this one's premises (§3) are independently confirmed by the other —
which is the more useful result than agreement on shape would have been.

One thing sharpens: ADR-0145 Decision 4 deferred the `kind` field and the ratchet, and named
the absence of enforcement as its own weakest point. §4 shows a second team treated exactly
that as load-bearing and built it. That does not overturn the deferral — the nine owed entries
here remain blocked on a Desktop Bridge and on unanswered design questions, and their own
parity gate is red on a healthy tree for the same snapshot reason — but the reopen condition in
ADR-0145's Consequences now has a worked model to copy from rather than only
`check-paint.mjs`'s baseline.

Not adopted, and not proposed: their schema, their generators, their `version`/`status` per
contract. Open, for the owner: whether ADR-0145 gets a dated correction paragraph pointing at
§4, or whether this note is the right place for it to live.
