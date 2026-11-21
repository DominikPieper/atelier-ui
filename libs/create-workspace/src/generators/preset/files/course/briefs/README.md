# Component briefs — Day 2

Four briefs, one per component you can choose on Day 2 of the course: [`toast.md`](toast.md), [`avatar.md`](avatar.md), [`tagchip.md`](tagchip.md), [`statcard.md`](statcard.md). Each one states **what a finished component owes** — its anatomy, its axes, its states and its accessibility obligations. None of them says how to draw it: that is the exercise. Toast and Avatar are canonical components; TagChip and StatCard are compositions of canonical ones, and say so on their first line.

## Shared rules — true for all four

**Scope: two variants, and the states your brief names.** The Figma block is 90 minutes
with participants who are new to Figma. Each brief names which two variants and which
states are in scope and which are explicitly out: Toast, Avatar and StatCard cross their two
variants with two states; TagChip has two variants with the remove button and no second
state. Building the full matrix is not the goal; building a
_correct_ slice of it is. The rest of the matrix is documented in the brief so the
participant knows what they deferred rather than what they forgot.

**Start from a starter frame, not a blank canvas.** Each brief names the frame on the
`🛠️ Workshop-Templates` page that comes across when you duplicate the Atelier file into
your own drafts. Fills, paddings and radii there are already bound to `Library Tokens`
variables. Copy it, rename it, build on it.

**Never mutate the original file.** `File → Duplicate to your drafts` first. The Atelier
file's variables are file-scoped; edits there collide globally.

**Bind tokens, do not type values.** Every fill, radius, padding and gap resolves through
a Figma Variable in the `Library Tokens` collection — the semantic tier that mirrors the
`--ui-*` custom properties. A hardcoded value is a Critical finding in the
Figma review.

**Elevation is a CSS-only token.** `Library Tokens` carries colour, spacing, sizing
(`control-height/*` + `row-height/*`), radius, typography, border-width and opacity
variables — and **no shadow**. `--ui-shadow-*` exists only in `tokens.css`. A component
whose design depends on a drop shadow (Toast, an elevated StatCard) has to state the
shadow in the brief and in code, because Figma cannot bind it. Notice this rather than
inventing a shadow variable.

**Two briefs share a name with the library.** `@atelier-ui/{{FRAMEWORK_LC}}` already has a toast of its own (in Angular it is exported as
`AtlToast`) and an `AtlAvatar`, and what the Toast and Avatar briefs ask for differs from them (the
Avatar brief's axis is `variant` where the library's says `shape`). That is known and
wanted: you build your own component in the workshop app and do not import the library's.
An agent that points out the collision is right; tell it which one you mean.

**States get a Figma axis; the code's `variant` union never does.** Figma has exactly one
primitive for a mutually-exclusive option — a Component Property of type Variant — so a
master that needs to _draw_ hover, focus, active or disabled has no other way to do it
than a dedicated `state` axis, and Atelier's own library uses one routinely: `AtlButton`,
`AtlInput`, `AtlSelect`, `AtlCheckbox`, `AtlToggle` and ten more all carry a `state` axis
today (values such as `default`, `hover`, `focus`, `active`, plus data-flavoured ones like
`open`, `filled`, `invalid`). **What must never happen is that axis reaching the code
contract.** The boundary is the _component's own_ `variant` union — you declare it directly on your own
component, with no separate spec file. It holds only structural
values — `AtlButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'` — never a
state; in code, hover/focus/active/disabled stay CSS pseudo-classes and `disabled`/`aria-*`
attributes. `AtlButton`'s own master marks the boundary explicitly in its description:
every other property line reads "→ maps to AtlButtonSpec.X"; the `state` line reads only
"interaction state", with no arrow — nothing on the code side consumes it.

The canonical `card` component names the failure mode this protects against
(`variant-explosion-from-states`, severity minor): crossing a `state` axis against every
other axis multiplies frames — 3 variants × 4 states × 2 orientations is 24+ — **not**
that a `state` axis is forbidden. Keep it to one axis, and keep it curated rather than
fully crossed: Atelier draws 24 of `AtlButton`'s 48 possible `variant`×`size`×`state`
combinations, not all of them. Some masters skip the axis entirely and describe
interaction states in prose instead — `AtlCard`, `AtlBadge`, `AtlToast` and `AtlAvatar`
(the four components behind this workshop's own briefs) have no `state` axis, because
their own interactive affordance, where they have one at all, sits on a nested control
that already carries its own. Either choice is legitimate; what decides it is whether the
component itself is the interactive element. Structural differences (severity, shape,
elevation) are always the code's `variant`; everything else — a Figma `state` axis when
you draw one, prose when you don't — is a property, a state, or CSS.

**Colour is never the only signal.** Every severity, status or state that a sighted user
can see must also be available without colour — an icon, a word, or an accessible name.

## Done when

The same bar for all four. It is reached in two steps, because the brief itself is only
the Figma half of the work: items 1–4 and 7 are checkable at the end of **Day 2 Block 01**
(Figma design and handoff document); items 5, 6 and 8 are checked against the
component and its stories, which do not exist until **Block 02** (component, stories) and
**Block 04** (verify). The numbering is kept across both lists because the briefs cite it.

### Done after the Figma block (Day 2 Block 01)

1. The Figma component set carries ≥ 2 variants on a `variant` axis named exactly as the
   code union will be (`variant`, not `Variant`; `success`, not `Success`), **and** the
   second axis your brief's scope line names — a lifecycle pair (`open` / `closing`), a
   data pair (`image-loaded` / `initials-fallback`), or a curated interaction pair — drawn
   as a `state` axis. If your component is not itself the interactive element, it does not
   get an interaction axis at all: write those states into the master's description
   instead, per the states rule above, and the closing check reads the description.
2. Every fill, radius, padding and gap is bound to a `Library Tokens` variable.
3. Every frame with children uses Auto Layout.
4. A dark-mode variant renders correctly through the collection's `Dark` mode — no
   second component, no hardcoded value.

<!-- numbering follows the full 1–8 list, which the briefs cite -->

7. The a11y obligations tagged **(this block)** in the brief's own section are met, and
   any blocker-severity mistakes among them are not present. Obligations tagged **(full
   component)** describe the shipped component for later — each one depends on a state,
   a scenario or a property this exercise's scope section puts out of scope to build, so
   the closing check does not evaluate it; write it into the master's description instead
   of building it.

### Done after the code blocks (Day 2 Blocks 02 and 04)

5. The component's prop names and values match the Figma property names one-for-one,
   and there is one story per variant value and per Boolean state, so the Storybook shows
   every axis you drew.
6. The generated story file declares `tags: ['autodocs']`. Autodocs is not on globally in
   any of the three Storybooks (`.storybook/main.ts` sets `docs: {}` and no preview file
   sets a global tag) — every existing story opts in per file. A generated story usually
   inherits the tag from the file it was modelled on; usually is not always, and without it
   the component renders a Canvas and no Docs tab, failing the closing check for a reason
   that has nothing to do with the participant's component.

<!-- numbering follows the full 1–8 list, which the briefs cite -->

8. `figma_check_design_parity` on your own Figma node against the generated component
   (needs the connected Desktop Bridge) comes back without unexplained deviations, and
   the discrepancies it does report are understood, not merely absent. Use the parity prompt in `../parity-prompt.md`
   (node id from your handoff document); Claude assembles what the call needs. A section
   that is not compared is not reported, so a quiet report is not a clean component. Without the Desktop Bridge there is no parity call: sort the
   differences by hand instead.

The shared checklist for the end of the day is the Definition of Done in `CLAUDE.md`
(format, stylelint, lint, build, unit tests and `npm run check:stories`, which `/verify`
runs) plus the dark-mode switch in the Storybook toolbar. This bar is the brief-specific
subset of it, not a second copy.

## Before you prompt

Write a short handoff document for your component first (what is in scope, the token
bindings, the behaviour lines, what is out, the acceptance checks). A filled example,
built from the Toast brief, is in `../handoff-example.md`.
