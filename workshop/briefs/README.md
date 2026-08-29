# Component briefs — Day 2

Four briefs, one per component a participant can choose on day two of the two-day
training. Each one states **what a finished component owes** — its anatomy, its axes,
its states, and its accessibility obligations. None of them says how to draw it: that
is the exercise.

| Brief | Component | Derived from |
|---|---|---|
| [`toast.md`](toast.md) | Toast | uianatomy `toast` (canonical record) |
| [`avatar.md`](avatar.md) | Avatar | uianatomy `avatar` (canonical record) |
| [`tagchip.md`](tagchip.md) | TagChip | **composed** — uianatomy `tag-input`'s `tag` / `tag-remove` slots + `badge` |
| [`statcard.md`](statcard.md) | StatCard | **composed** — uianatomy `card` + `badge` |

The provenance column matters and is not bookkeeping. `toast` and `avatar` are canonical
components in the uianatomy roster, so their briefs are transcriptions of an existing
record — anatomy slots, axes, state machine, Figma↔code mismatches and named mistakes all
come from `get_component_view(id, view: "designer")`. **There is no `tag-chip` and no
`stat-card` in that roster** — `list_components` returns 41 ids, none of them a chip or a
stat card, and `search_components("chip")` returns nothing. Those two are compositions of
components that *are* canonical, and each brief says so on its first line. That is itself the lesson of the
block: a canonical vocabulary tells you when you are building a known thing and when you
are assembling one, and the second case is where a component library earns or loses its
consistency.

## Shared rules — true for all four

**Scope: 2 variants × 2 states.** The Figma block is 90 minutes with participants who
are new to Figma. Each brief names which two variants and which two states are in scope
and which are explicitly out. Building the full matrix is not the goal; building a
*correct* slice of it is. The rest of the matrix is documented in the brief so the
participant knows what they deferred rather than what they forgot.

**Start from a starter frame, not a blank canvas.** Each brief names the frame on the
`🛠️ Workshop-Templates` page that comes across when you duplicate the Atelier file into
your own drafts. Fills, paddings and radii there are already bound to `Library Tokens`
variables. Copy it, rename it, build on it.

**Never mutate the original file.** `File → Duplicate to your drafts` first. The Atelier
file's variables are file-scoped; edits there collide globally.

**Bind tokens, do not type values.** Every fill, radius, padding and gap resolves through
a Figma Variable in the `Library Tokens` collection — the semantic tier that mirrors the
`--ui-*` custom properties. This is what `check:figma` calls "token-linked styles", and
it is a Critical finding when it fails (`plan/figma-component-checklist.md`).

**Elevation is a CSS-only token.** `Library Tokens` carries 78 variables — 50 colour, 10
spacing, 5 radius, 12 typography, 1 opacity — and **no shadow**. `--ui-shadow-*` exists
only in `tokens.css`. A component whose design depends on a drop shadow (Toast, an
elevated StatCard) has to state the shadow in the brief and in code, because Figma cannot
bind it. Notice this rather than inventing a shadow variable.

**Interaction states are not variants.** hover / focus / active / disabled are CSS
pseudo-classes and attributes, not entries in the variant matrix. The canonical `card`
record names this explicitly (`variant-explosion-from-states`): 3 variants × 4 states ×
2 orientations is 24+ frames, none of which maps to a pseudo-class without a hand
translation. Structural differences (severity, shape, elevation) are variants;
everything else is a property or a state.

**Colour is never the only signal.** Every severity, status or state that a sighted user
can see must also be available without colour — an icon, a word, or an accessible name.

## Done when

The same bar for all four, and the one the trainer verifies in the closing block:

1. The Figma component set carries ≥ 2 variants × 2 states, with the variant axis named
   exactly as the code union will be (`variant`, not `Variant`; `success`, not `Success`).
2. Every fill, radius, padding and gap is bound to a `Library Tokens` variable.
3. Every frame with children uses Auto Layout.
4. A dark-mode variant renders correctly through the collection's `Dark` mode — no
   second component, no hardcoded value.
5. The generated spec's prop names match the Figma property names one-for-one.
6. The generated story file declares `tags: ['autodocs']`. Autodocs is not on globally in
   any of the three Storybooks (`.storybook/main.ts` sets `docs: {}` and no preview file
   sets a global tag) — every existing story opts in per file. A generated story usually
   inherits the tag from the file it was modelled on; usually is not always, and without it
   the component renders a Canvas and no Docs tab, failing the closing check for a reason
   that has nothing to do with the participant's component.
7. The a11y obligations in the brief's own section are met, and the blocker-severity
   mistakes it names are not present.
8. `figma_check_design_parity` runs in report mode against the component and the
   discrepancies it reports are understood, not merely absent.

## Sources

- uianatomy MCP (`https://uianatomy.dev/mcp`) — `list_components`, `search_components`,
  `get_component_view`. Read 2026-08-29. **Caveat worth stating in the block:** the four
  records were last reviewed 2026-05-04/05, which puts them 116–117 days stale against
  the server’s own 90-day threshold. Nothing in these briefs contradicts what the Atelier
  library ships, but treat the canonical claims as a strong prior, not as scripture — and
  say so when you show the tool, because "check the staleness before you trust it" is part
  of what the block is teaching.
- `plan/figma-component-checklist.md` — the pre-release checklist and what `check:figma`
  automates.
- `plan/design-principles.md` — surface hierarchy, timing tiers, disabled contract.
- `tools/figma/snapshot.json` — the `Library Tokens` census and the Workshop-Templates
  starter-frame node ids.
