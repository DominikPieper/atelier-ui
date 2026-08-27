---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0047-bind-the-literals-that-duplicate-a-token.md (the gate this completes)
  - plan/adr/0054-the-last-values-a-variable-could-not-bind.md (the ramps whose colours the artboards never received)
  - plan/adr/0064-what-the-parity-stamp-rests-on.md (the gate that blocked on its first real test)
---

# ADR-0071: The literals the scale already named

## Status

Accepted. Adds `font-weight` to `check:token-bypass`'s family map, binds 18 literals,
resolves a spacing census of nine, and records a measured drift in the Claude Design
artboards.

## Context

This session gated the Figma masters exhaustively — and every one of those gates compares
Figma **to the CSS**. They treat the CSS as ground truth. Several notes taken along the
way said the CSS is not always on its own scale, which means the gates would faithfully
enforce a wrong value.

`check:token-bypass` (ADR-0047) already catches the one objectively wrong case: a literal
whose value a token in the same family already holds. It deliberately does *not* demand
that every value be a token — most of the ~190 literals in the stylesheets are one-off
component dimensions, and tokenising them would be the rule of three violated in token
form.

Its family map covered nine property groups. **`font-weight` was not one of them.**

## Decision

**1. `font-weight → --ui-font-weight-*` joins the family map.** It found six literals,
each duplicating a named weight exactly: `600` in AtlDrawer, AtlCodeBlock and AtlDialog,
`500` in AtlCodeBlock, `700` in AtlAlert and AtlBadge — eighteen findings across the three
frameworks, all bound. A weight is the clearest case this gate exists for: there are four
of them, every one is named, and a bare `600` carries none of the naming.

**2. The spacing census: nine off-scale values, and reading each one settled what it
was.** The census is the point — the answers were not uniform, and assuming they were
would have produced nine wrong edits:

| Value | What it turned out to be |
|---|---|
| `margin: -1px` in AtlChat, AtlToggle | the canonical `sr-only` recipe, where the `1px`/`-1px` are a pair. Not spacing. Left. |
| `gap: 0.3rem`, `padding: 0.2rem 0.55rem` in AtlCodeBlock | genuinely off-scale on a control. **Bound** to `--ui-spacing-1` / `-2`. |
| `margin-left: 17px` in AtlStepper | **(36 − 2) / 2** — the connector centred under the circle, written as a magic number. |
| `2.25rem` ×3 in AtlInput, AtlTextarea, AtlPagination | a composed dimension, for two different reasons. Recorded. |
| `margin-top: 2px` ×2 in AtlStepper | off-scale micro-spacing, half of `--ui-spacing-1`. Recorded. |

**3. The magic number was a derivation, so the derivation is now visible.** `17px` became
`calc((var(--step-circle) - var(--step-connector-width)) / 2)`, with both values declared
once on `.atl-stepper` and used by the circle and the connector themselves. Neither is a
token — one component, two uses each — but **a relationship between two dimensions should
be readable**, which a literal `17px` made impossible: the next person to change the
circle size would not have known to change it.

**4. Two of the values were off-scale in the CODE while the Figma master held the
scale.** AtlCodeBlock's copy button draws `padding: 4/8`, `gap: 4`, `radius/sm` in Figma —
exactly what the CSS now computes, and not what it computed before. The drift was in the
code and the designer had drawn the scale. The layer was also named `copy-btn` while its
class is `.code-block-copy`, so under ADR-0063's convention it was never checked; renamed,
it is, and it passes.

## Consequences

- `check:token-bypass`, `check:geometry` (73 measurements), `check:css-tokens` and
  `check:all` all green; `nx run-many test lint` over angular, react, vue and spec: exit 0.
- **The parity gate blocked on its first real test, and was right.** Closing the redesign
  phase this morning (ADR-0064) made an `inputsHash` drift a BLOCKER. Changing six
  components' CSS produced six blockers demanding re-verification — which is the
  discipline working, not a nuisance: the stamp says "verified after the files last
  changed", and the files had changed. Re-recorded on the basis `check:figma` was green,
  as ADR-0064 defines.
- **The third surface is ungated, and it has already drifted.** Answering "do we have
  anything that includes Claude Design?" produced: no. `tools/design/artboards.json` is a
  hand-maintained registry, and `gen-design-status.mjs`'s own header says the artboard
  column "is hand-maintained because Claude Design lives outside the repo. It is also the
  column that matters most right now." Reading `_sheet.css` — which all 31 artboards link —
  and comparing its palette to `tokens.css` found **7 of 40 values drifted**, including the
  three status colours ADR-0054's ramps changed, so every artboard still paints the
  pre-ramp palette.
- **And the recorded remedy for that is the wrong one.** The reopened ADR-0032
  alternative 4 proposes gating raw hex in artboards. But an artboard renders standalone
  in Claude Design, where `tokens.css` is not loaded — it *must* carry literals, and the
  file says so in its own header. The right rule is `check:tokens`' rule for the three
  framework copies: the copy is **generated**, not checked. `gen-foundations-sheet.mjs`
  already does exactly that for one artboard. Recorded with the measurement so the next
  pass supersedes ADR-0032 with evidence rather than with a second opinion.
