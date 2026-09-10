---
status: accepted
date: 2026-09-09
sources:
  - "tasks/schulung-content-review-2026-09-08.md (Gegenprobe — Codex, 2026-09-09, finding G2: 'interaction states are not variants' contradicted by Atelier's own masters, by the briefs' own acceptance bar, and by the architect skill)"
  - "tools/figma/snapshot.json (the live `state=` variant-axis census on 15 masters, and `Action/AtlButton`'s curated 24-of-48 drawn combinations)"
  - "libs/spec/src/index.ts (every `Atl*Variant` union — none carries a state value)"
  - "uianatomy MCP `get_component_view('card', 'designer')` (the canonical `variant-explosion-from-states` mistake record, severity minor)"
  - "skills/figma-workspace-architect/references/decision-heuristics.md, component-design.md (the Figma-side rule this ADR's decision agrees with, now cross-referenced back to this ADR)"
  - "workshop/briefs/README.md, tagchip.md, statcard.md (the paragraph and acceptance item this ADR's decision rewrites)"
  - "this session"
---

# ADR-0114: The state axis Figma draws is not the union the code exposes

## Status

Accepted.

## Context

`workshop/briefs/README.md` told participants, flatly: *"Interaction states are not
variants. hover / focus / active / disabled are CSS pseudo-classes and attributes, not
entries in the variant matrix."* Measured against the repo, this is false on its own
terms, three times over:

- **Atelier's own masters contradict it.** `tools/figma/snapshot.json` shows a dedicated
  `state` Component Property (Figma's own name for a Variant axis) on fifteen masters —
  `AtlButton`, `AtlInput`, `AtlSelect`, `AtlCheckbox`, `AtlToggle`, `AtlTextarea`,
  `AtlRadioGroup`, `AtlRadio`, `AtlTable`, `AtlCombobox`, `AtlStepper`, `AtlMenuItem`,
  `AtlTab`, `AtlStep`, `AtlOption` — 45× `state=default`, 29× `hover`, 23× `focus`, 12×
  `active`, plus data-flavoured values (`open`, `filled`, `invalid`, `completed`,
  `optional`). This is not legacy debt to clean up: `AtlButton`'s master description
  records a deliberate 2026-04-27 restructure that *slimmed* the `state` enum to
  `default`/`hover`/`focus`/`active` and moved `loading`/`disabled` out to Booleans — the
  axis was tightened, not phased out.
- **The briefs' own acceptance bar contradicts it.** `README.md`'s "Done when" item 1
  requires *"≥ 2 variants × 2 states"* on the Figma component set — an axis the same
  document had just forbidden.
- **The architect skill accompanying the same block contradicts it.**
  `decision-heuristics.md` ("Don't use a Mode for: States like hover/disabled — those are
  Variant Properties.") and `component-design.md` ("Don't use Boolean Properties to
  encode mutually exclusive states … That's a Variant.") both say the opposite, and both
  are correct: Figma has exactly one primitive for a mutually-exclusive option — a
  Component Property of type Variant — so a master that needs to *draw* a state has no
  other way to do it.

A participant holding the brief and the architect skill in the same 90-minute block
receives two documents disagreeing about the same fact, and the brief's fix-worthy
argument — the `variant-explosion-from-states` warning it correctly cites from the
canonical `card` record — survives independently of the false absolute wrapped around it.
That record's actual claim (verified via `get_component_view('card', 'designer')`) is
narrower than what the paragraph said: *"Adding hover / focus / active / disabled as
variants in Figma causes the variant matrix to explode … Document interaction states once
in a separate 'states' sheet … Reserve Figma variants for structurally different
versions."* Severity **minor**, and about **crossing** an axis against every other axis
(3 variants × 4 states × 2 orientations = 24+), not about the axis's existence.

The second half of the confusion is that the paragraph never distinguished two different
surfaces answering to one word. Checking `libs/spec/src/index.ts` settles which rule
belongs where: every `Atl*Variant` union — `AtlButtonVariant`, `AtlBadgeVariant`,
`AtlToastVariant`, nine more, twelve unions total — holds only structural values (severity, style, shape).
None holds a state. `AtlButton`'s own master marks the boundary explicitly in its
description: every other property line reads *"→ maps to AtlButtonSpec.X"*; the `state`
line reads only *"interaction state"*, with no arrow. Nothing on the code side consumes
it — hover/focus/active/disabled stay CSS pseudo-classes and `disabled`/`aria-*`
attributes there, as they always have.

A third fact narrows the fix further: not every component needs the axis at all.
`AtlCard`, `AtlBadge`, `AtlToast` and `AtlAvatar` — the four canonical components this
workshop's own briefs are built from — carry **no** `state` axis in the live library.
Each either has no interactive affordance of its own (Card, Badge, Toast's viewport) or
places it on a nested control that already owns one (Toast's action/close buttons are
`Button` instances with `Button`'s own `state` axis). This matches the canonical `card`
mismatch's prescribed alternative exactly: document interaction states in prose when the
component itself never draws them.

## Decision

**Figma and the code contract get different rules about state, stated separately:**

1. **In Figma**, a master that must *draw* an interaction state has no primitive for it
   other than a Variant axis. Put it on its own `state` axis — never cross it against
   every other axis (that is the actual anti-pattern the canonical `card` record names:
   3 variants × 4 states × 2 orientations = 24+ frames). Draw a curated subset, not the
   full cross product — `AtlButton` ships 24 of its 48 possible
   `variant`×`size`×`state` combinations. A component with no interactive affordance of
   its own, or whose interactivity lives entirely on a nested instance, skips the axis
   and documents states in prose instead — both are legitimate, and the canonical
   anatomy record decides which by whether the component itself is the activator.
2. **In the code contract**, the state axis never appears. Every `Atl*Variant` union in
   `libs/spec/src/index.ts` holds only structural values; hover/focus/active/disabled
   stay CSS pseudo-classes and DOM attributes, exactly as `AtlButton`'s own master
   description already signals by leaving the `state` line without a "→ maps to" arrow.

`workshop/briefs/README.md`'s "Interaction states are not variants" paragraph is rewritten
under the heading "States get a Figma axis; the code's `variant` union never does",
carrying both halves and the supporting evidence (grep counts, the `AtlButton` 24-of-48
figure, the four state-axis-free canonical components). `decision-heuristics.md` and
`component-design.md` each gain one clarifying sentence pointing at this ADR and the
rewritten rule — their existing Figma-side guidance was already correct and is
untouched.

**Rejected: delete the paragraph.** The multiplication warning is real, is the correct
reading of the canonical `card` mismatch, and is exactly the content a participant needs
before drawing a fourth or fifth axis onto a component set. Deleting it to resolve the
contradiction would remove the one piece of the paragraph that was right.

**Rejected: invert it to "states are variants."** That is just as absolute as the
original, and wrong the same way in the other direction — it would license crossing a
`state` axis against every structural axis without limit, and it would license a state
value leaking into `Atl*Variant`, which nothing in the code contract permits.

**Rejected: leave it to per-brief judgement, no shared rule.** Every one of the four
in-progress briefs (Toast, Avatar, TagChip, StatCard) needs to decide the same question
independently, and all four of their underlying canonical components (`AtlToast`,
`AtlAvatar`, `AtlBadge`, `AtlCard`) genuinely have no `state` axis to draw — a participant
working from instinct alone, without the shared rule stating which of the two paths is
legitimate and why, has no way to tell "this component skips the axis by design" from
"this component is missing a required axis."

## Consequences

- The paragraph's warning against variant-explosion-from-states survives, correctly
  scoped to what it actually warns against (crossing every axis), not misapplied as a
  ban on the axis's existence.
- Acceptance item 1 (*"≥ 2 variants × 2 states"*) no longer contradicts the paragraph
  immediately above it in the same document.
- The architect skill's existing, correct Figma-side guidance is now explicitly linked to
  the code-side rule it was always implicitly compatible with, closing the gap a
  participant holding both documents at once would otherwise have to bridge unassisted.
- **This does not resolve the workshop's own state-scoping wrinkle for StatCard.**
  `statcard.md`'s "Scope for the 90-minute block" puts `idle` and `hover` in scope while
  its own §3 states a static StatCard "has none of" the interactive states and puts
  `interactive` out of scope — a genuine internal inconsistency, found while verifying
  this ADR's evidence, that is a scoping decision for the brief's owner rather than a
  state-vs-variant conflation this ADR's decision fixes. Left open, flagged separately.

**Corrected 2026-09-09.** The open item above is closed, and the same wrinkle turned out
to affect `tagchip.md` too — both briefs named `idle`/`hover` as their in-scope states,
and neither may draw an interaction axis under this ADR's Decision §1 once §3 of each
brief is read straight: a static StatCard "has none of" the interactive states, and
TagChip's only focusable element is its remove button, not the chip. The two briefs'
scope lines are rewritten, and the two decisions differ because the underlying fact
differs:
- `statcard.md` keeps a `state` axis, but not `idle`/`hover` — it now reads `delta-up` /
  `delta-down`, a composition-specific **data** pair for the `delta` slot's direction
  (`card` itself still has none). It earns the axis for the same reason Decision §1 gives
  a state axis to any master that must *draw* a state it genuinely has: the direction is
  real, visibly distinguishable, and is what makes the brief's own colour-alone blocker
  (§4 item 3, "the delta is never colour alone") checkable directly on a frame — a claim
  that is only fully checkable once both directions exist to compare, not asserted of a
  single frame. `interactive` and the `hover`/`focus`/`active`/`disabled` states that
  depend on it stay out of scope exactly as `statcard.md` §3 already argued; nothing about
  this correction reopens them.
- `tagchip.md` gets no `state` axis at all. TagChip is not itself the interactive element
  — its remove button is — so it falls under Decision §1's other branch: "a component
  whose interactivity lives entirely on a nested instance skips the axis and documents
  states in prose instead." The remove button's `hover`/`focus-visible` and the chip's
  out-of-scope selected/keyboard-navigated model move into the master's description, not
  onto a chip-level variant matrix.

Both outcomes were already reachable from Decision §1 as written — a master that must
*draw* a state it genuinely has gets an axis; a master whose interactivity sits entirely
on a nested control does not — the wrinkle was that both briefs' scope lines had picked
states (`idle`/`hover`) belonging to neither category before this correction. No further
edit to `workshop/briefs/README.md` was needed: its "Done when" item 1, rewritten by this
ADR's Decision, already carries the branch ("if your component is not itself the
interactive element, it does not get an interaction axis at all") that resolves both
cases.
