---
status: accepted
date: 2026-08-26
sources:
  - "Claude Design project *Atelier* — `Typography Directions.dc.html`, turns 1 and 2 (three directions, then three readings of \"bolder\")"
  - "plan/adr/0020-personal-authorial-signature.md (§Decision revised: the palette/motion split stands, the Inter choice does not)"
  - tasks/atelier-design-system-plan.md (Phase 1)
---

# ADR-0035: Typography — Instrument Sans + Instrument Serif + JetBrains Mono (revises ADR-0020's Inter choice)

## Status

Accepted. Revises **ADR-0020** on typeface selection only. ADR-0020's central
decision — *"Separate brand DNA (typography + motion) from palette
(purpose-specific)"* — is not just preserved but is the reason for this change.
The palette, the motion vocabulary, and the serif-italic heading accent are
untouched.

## Context

ADR-0020 designated typography as the layer that carries cross-surface
identity, and then left two things unresolved that only became visible when the
type layer was examined directly:

1. **The UI face was Inter.** For a repo whose stated identity layer *is*
   typography, the most widely deployed interface font in the ecosystem is a
   weak carrier — it is the default that reads as no decision. Claude Design's
   own system prompt lists Inter among the "AI slop tropes … overused fonts".
2. **Docs and library ran two type systems.** Instrument Serif existed only as
   `--docs-font-accent` in the docs chrome; the component library had no display
   face at all. The "shared brand DNA" was shared between the author's site and
   the docs, but not between the docs and the components they document.

Three directions were drawn as artboards in Claude Design and reviewed on the
render, not on description: Inter with roles added (the control), the Instrument
pair, and IBM Plex Sans with mono promoted to a label role. The Instrument pair
was chosen, with a follow-up ask for "a little more bold".

That ask produced the constraint that shaped this decision: **Instrument Serif
ships exactly one weight (400)** — verified against the Google Fonts CSS, a
single `@font-face`, no bold cut. Three readings were drawn:

- bigger and upright at 42px — kept as the **null result**. A high-contrast
  serif with thin stems buys presence, not weight. It does not answer the ask.
- the headline moves to Instrument Sans 700 while the serif keeps the display
  line — **chosen**.
- swap to Source Serif 4 for a real 400–700 axis — rejected below.

## Decision

Three stacks, declared in the token layer:

| Token | Face | Role |
|---|---|---|
| `--ui-font-family` | Instrument Sans | everything interactive and everything read at body length |
| `--ui-font-display` *(new)* | Instrument Serif | the single largest line on a surface — wordmark, hero, section opener |
| `--ui-font-mono` *(new)* | JetBrains Mono | code, tokens, prop names, keyboard chips, terminal output |

**Weight comes from the sans, never from the serif.** Instrument Serif has no
bold cut, so emphasis in the display role is expressed through size and case.
Where a surface needs to feel heavier, that weight belongs in the headline row
on Instrument Sans at 700 — which is also where a UI's perceived weight
actually lives, rather than in the wordmark.

The library continues to **declare stacks and load nothing**; loading the faces
stays the consumer's job. The docs app loads all three through Astro's `fonts`
config, and Instrument Sans took over the existing `--font-sans` CSS variable,
so no docs stylesheet changed.

The canonical edit is
`libs/create-workspace/src/generators/preset/files/styles/tokens.css` — the
generator preset is the token source of truth; `npm run sync:tokens` propagates
it into the three framework libs.

Alternatives considered:

- **Keep Inter, add only the role scale.** Rejected: it leaves the identity
  layer carrying the ecosystem default. Kept as the artboard's control so the
  comparison had a baseline, which is what made the other two judgeable.
- **Source Serif 4 for a real bold axis.** Rejected: it is the most literal
  answer to "bolder", but it trades Instrument Serif's distinctive
  high-contrast character for a conventional bookish one and severs the visual
  tie to ADR-0020's docs accent. The identity cost outweighed the convenience of
  a weight axis we then found we did not need.
- **Fake the weight with size** (the 42px upright display). Rejected on the
  render — recorded on the artboard as the null result rather than deleted,
  because it is the useful illustration of what a single-weight face can and
  cannot do.
- **IBM Plex Sans with mono promoted to the label role.** Rejected here, but the
  idea behind it survives: mono is now a first-class declared token instead of
  an undeclared one.

## Consequences

- **A latent bug is fixed as a side effect.** `--ui-font-mono` was *consumed* by
  the code-block CSS in all three frameworks
  (`var(--ui-font-mono, 'Menlo', …)`) but **never declared anywhere**, so every
  code block silently fell back to Menlo. Declaring it is what makes the
  fallback a fallback. `check:css-tokens` did not catch this: it verifies that
  declared tokens are annotated, not that consumed tokens are declared. Worth a
  follow-up gate.
- **Two API additions**, both annotated: the manifest is at 103/103.
- **The design-parity gate is blind to this change.** `tokens.css` is not part
  of any component's `inputsHash` — the parity inputs are
  `libs/{angular,react,vue}/src/lib/<module>/` only. So a change that alters the
  rendered appearance of all 29 components triggers no DRIFT blocker and costs
  no re-verification. Convenient here, wrong in general: the gate cannot see the
  shared token layer that every component depends on. Recorded as a gap in
  `tasks/todo.md`.
- **The role-based type scale is deliberately NOT in this change.** Components
  still reference `--ui-font-size-*`, a size ladder rather than roles. Making
  them reference roles (`body-md`) is an API addition with a migration cost
  across every component's CSS, and it gets its own ADR. Mixing it in here would
  have made the visual diff of a font swap unreadable.
- **Storybook now loads the faces, and never did before.** The libraries load
  nothing by design, and Storybook is a consumer like any other — so for as long
  as the stack said Inter, every preview silently rendered the system fallback.
  The faces named in the tokens were never the faces on screen. A
  `preview-head.html` per framework fixes that; without it this decision would
  be invisible in the one place components are actually looked at.
- **Instrument Serif is loaded italic-only** in the docs (ADR-0020's accent used
  it that way, and the chosen direction keeps the display line italic). An
  upright display use would need `styles: ['normal', 'italic']` added to the
  Astro config — otherwise the browser synthesises a roman and it looks wrong.
- **The synced Claude Design artifacts still say Inter and Fira Code.** The
  `_ds_manifest.json` and design-system guide in the *Atelier Design System*
  project are `/design-sync` output and were already known to be unreliable
  (three phantom `--ui-font-size-*` tokens, `--ui-transition-*` typed as colour,
  `--docs-*` tokens mixed into the public API — and now a fourth phantom,
  `--ui-font-mono`, which it listed while the repo never declared it). They
  need a re-sync, and they remain reference-only, never input.
