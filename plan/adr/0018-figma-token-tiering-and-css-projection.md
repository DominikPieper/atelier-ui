---
status: accepted
date: 2026-06-01
sources:
  - "Figma file QMnDD8uZQPldPrlCwZZ58T (live figma-console-mcp inspection)"
  - "docs/public/.well-known/agent-skills/figma-workspace-architect/references/token-architecture.md"
  - "this session"
---

# ADR-0018: Figma token tiering (Primitive → UI → Component) + UI-only CSS projection

## Status

Accepted. Recorded at decision time. **Complements ADR-0004** (CSS custom-property design
tokens) — ADR-0004 decides *that* all visuals flow through `--ui-*` tokens; this ADR decides
*how the token tiers are structured in Figma* and *which tiers cross over into code*.

## Context

The question that prompted this record: someone reading the Figma file could not tell how
**UI tokens** relate to **Component tokens** — the structure did not read clearly at a glance.
That confusion is a signal the tiering decision was never written down.

The live Figma file (`QMnDD8uZQPldPrlCwZZ58T`) holds **5 Variable Collections / 137 variables**:

| Tier | Collection | Count | Modes | Holds |
|------|-----------|-------|-------|-------|
| Primitive | Primitive Tokens | 39 | single | Raw palette/scale: `teal/500`, `slate/100`, `neutral/0`, `red/500` |
| Semantic | UI Tokens | 77 | **Light + Dark** | Purpose tokens: `color/primary`, `color/surface`, `spacing/4`, `radius/md` — the `--ui-*` CSS vars |
| Component | Component Tokens | 15 | single | Per-component roles: `button/bg-primary`, `card/bg`, `input/border`, `badge/bg-success` |
| — | Motion Tokens | 4 | single | `duration/fast`, `duration/normal` … |
| — | Effects Tokens | 2 | single | `shadow/sm`, `shadow/md` |

The Component tokens are **thin aliases** into the UI tier (verified live): `button/bg-primary` →
`color/primary`, `card/bg` → a surface UI token, `badge/bg-danger` → `color/danger`. All 15 resolve
into the UI Tokens collection; none point at a Primitive. Exactly one alias hop per tier.

The generic three-tier model is documented in the figma-workspace-architect reference
(`token-architecture.md`). That reference explicitly calls the Component tier **optional** —
"Most teams don't need this layer in Figma at all and keep it on the code side. If unsure, skip it."
We deliberately did not skip it. This ADR records why, so the choice is not re-litigated each time
someone new reads the file.

The forces:
- An LLM doing design-to-code needs a **bounded styling vocabulary** — known tokens to pick from,
  not free `#hex` values (the driver behind ADR-0004).
- Light/Dark theming must be **a single switch**, not scattered per-component overrides.
- Atelier **teaches** token architecture in a workshop — the structure is itself didactic material.

## Decision

Four sub-decisions, each with its rejected alternatives:

1. **Three Figma tiers: Primitive → UI (semantic) → Component, one alias hop per tier.**
   Why: separates *value* (Primitive) from *meaning* (UI) from *component-local role* (Component),
   so a rebrand (swap a Primitive) and a re-point of one component (change one alias) are independent
   operations that never touch the shared layers.
   Rejected: a single mega-collection mixing all three (the reference's critical anti-pattern —
   no theming seam); components aliasing Primitives directly (kills dark mode without rebuilding
   every component).

2. **Modes (Light/Dark) live only on the UI tier.**
   Why: the theme switch happens once, at the semantic layer; mode-duplication cost stays minimal
   (every mode duplicates every value in its collection, and Figma caps modes per plan tier);
   Component tokens inherit theming for free through their UI alias, so they need no modes; Primitives
   stay single-mode because a Primitive with per-theme values *is* a misused semantic.
   Rejected: modes on Primitives (semantics-in-disguise); modes on the Component tier (redundant —
   the alias already carries the theme).

3. **The Component tier exists in Figma but is NOT projected into CSS.**
   In code (`libs/*/src/styles/tokens.css`) only the UI tier is materialized as `--ui-*`; components
   reference `--ui-*` directly. There is no `--button-bg-primary` CSS layer. Result: **Figma has 3
   tiers, the CSS has 2.**
   Why keep it in Figma: it aids designer handoff and picker discoverability (a designer sees
   `button/bg-primary`, not the abstract `color/primary`), and it makes the third tier *visible* for
   teaching rather than a footnote.
   Why not in CSS: a `--button-bg-primary: var(--ui-color-primary)` layer would be pure indirection
   with no payoff — the component already knows its UI token, so the extra hop only adds a thing to
   maintain.
   Rejected: mirror the Component tier into CSS (needless indirection, more to keep in sync);
   drop it from Figma entirely (loses the handoff and teaching value, and matches the reference's
   default — but we have specific reasons to keep it).

4. **Accepted consequence, recorded so it is not a surprise:** the 15 Component tokens have **no CSS
   counterpart and therefore no drift-gate coverage** (the gate system, ADR-0009, projects from a
   single source and `--check`s it; there is nothing on the code side to check these against). They
   are as reliable as their UI alias and are maintained by hand.

## Consequences

- A bounded, named vocabulary for both AI and humans; theming concentrated in one layer; every value
  defined exactly once (in Primitives) and referenced upward.
- The **3-vs-2 asymmetry is the known cost** — it is exactly what reads as confusing on first contact.
  Mitigated by an explanation section on the `/tokens` docs page that names the asymmetry directly and
  links here.
- The Component tier is **ungated**: no automated drift protection, manual upkeep. Acceptable because
  it is design-side only and each token is a single alias.
- One alias hop per tier keeps debugging shallow; long alias chains (the reference's warning) are
  avoided by construction.
