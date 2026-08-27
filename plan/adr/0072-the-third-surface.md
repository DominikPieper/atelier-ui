---
status: accepted
supersedes: plan/adr/0032-claude-design-as-parallel-track.md
date: 2026-08-27
sources:
  - plan/adr/0032-claude-design-as-parallel-track.md (alternative 4, answered here by measurement)
  - plan/adr/0030-library-tokens-collection.md (the "generate the copy" remedy this reuses)
  - plan/adr/0071-the-literals-the-scale-already-named.md (the block that surfaced it)
---

# ADR-0072: The third surface

## Status

Accepted. Adds `gen:artboard-palette` and `check:artboard-palette`, and answers
ADR-0032's alternative 4 with what the measurement showed. Supersedes ADR-0032 on that
one point only; the rest of it stands.

## Context

The question was: *we have gates comparing Figma to the CSS — do we have anything that
includes Claude Design?*

The answer was no, and the shape of the "no" mattered. What existed:

- `tools/design/artboards.json`, a **hand-maintained** registry of 31 artboards.
- `check:design-status`, whose generator says of itself: *"The artboard column is
  hand-maintained because Claude Design lives outside the repo. **It is also the column
  that matters most right now.**"*
- `check-parity.js`, which reads that file only for `meta.redesignPhase`.

So every claim about Claude Design in this repo was typed by hand — the exact failure mode
this session had already fixed three times over: the Typography page's captions
(ADR-0059), the plan documents (ADR-0064), the Inventory catalogue (ADR-0070).

Reading `_sheet.css` — the shared stylesheet all 31 artboards link — and comparing its
palette to `tokens.css` found **7 of 40 values drifted**:

| | artboard | tokens.css |
|---|---|---|
| `--success` | `#0a5c38` | `#15803d` |
| `--warning` | `#a1660a` | `#b45309` |
| `--info` | `#1d4ed8` | `#0369a1` |
| `--border-hover` | `#475569` | `#cbd5e1` |
| `--primary-light` | alpha `0.1` | `0.08` |
| `--shadow-md` | 2nd layer `0.06` | `0.05` |
| `--shadow-lg` | 2nd layer `0.05` | `0.04` |

The first three are the status colours ADR-0054's ramps changed **the same morning**, so
every artboard was still painting the pre-ramp palette. `--border-hover` is a dark slate
against a light grey — not a rounding difference, and older than today.

## Decision

**1. ADR-0032 alternative 4 was upside down, and the measurement says so.** It proposed
gating raw hex in participant `.dc.html`. But an artboard renders **standalone** in Claude
Design, where `tokens.css` is not loaded — it *must* carry literals, and `_sheet.css`'s own
header said so before anyone gated anything. The defect was never that literals exist; it
was that the copy was **maintained** rather than generated.

**2. So the remedy is `check:tokens`' remedy.** That gate keeps the three framework copies
of `tokens.css` identical by generating them. `gen-artboard-palette.mjs` does the same for
the artboard palette: an explicit short-name map (`--primary` → `--ui-color-primary`, 44
entries), one level of alias resolution so the artboard receives a literal, and the row
ladder left **derived** so the relationship survives the copy instead of flattening into
three numbers. `check:artboard-palette` fails if the committed copy drifts from tokens.css.

What ADR-0032 alternative 4 actually asked for as its fallback — *"a `--ui-*` `:root`
starter block generated from `styles/tokens.css`"* — is now precisely what exists. The
alternative is satisfied, not rejected.

**3. The chain has one gated hop and one manual hop, and the split is stated rather than
hidden.** The Claude Design MCP is interactively authenticated, so a spawned script cannot
reach it:

```
tokens.css  --(generator, gated by check:artboard-palette)-->  tools/design/artboard-palette.css
artboard-palette.css  --(an agent with MCP access)-->  _sheet.css in the Atelier project
```

The second hop stays by hand, but it now copies one generated block instead of retyping
forty values, and a difference is a diff rather than an archaeology problem. The corrected
block was pushed as part of this decision, under a `finalize_plan` token with the etag as
`if_match`, and verified by re-reading the file end to end.

## Consequences

- The 31 artboards now paint the current palette. `check:all` exits 0 and includes
  `check:artboard-palette`, verified by nudging `--ui-radius-sm` and watching it fail.
- **Three surfaces, three answers.** Figma is gated against the CSS by ten codes built
  this session. The CSS is gated against its own scale (ADR-0071). Claude Design's *shared*
  palette is now generated. What remains ungated is each participant artboard's own file —
  and that is a **reach** problem, not a rules problem: the three adherence regexes already
  exist, but nothing in the repo can read 31 files that live outside it. Recorded with that
  distinction, because "we should gate it" and "we cannot see it" need different work.
- **A hand-written fact about a generated thing rots — fourth confirmation in one day.**
  Captions, plan documents, catalogue cards, and now a palette. The pattern is reliable
  enough to invert into a rule: if a value exists in two places because one of them cannot
  import the other, generate the second one on the day you create it.
- ADR-0032's larger decision — Claude Design as a parallel track whose canvas dead-ends —
  is untouched. Only its alternative 4 is settled here, and settled by measuring the file
  rather than by re-arguing the tradeoff.
