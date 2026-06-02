---
status: accepted
date: 2026-06-02
sources:
  - "docs/src/styles/docs-theme.css (Direction A: Conciso anchor only — the palette this extends)"
  - "pieper.io (the author site whose Instrument Serif keyword accent + motion vocabulary this mirrors)"
  - "personal-signature spec pasted into this session"
  - "this session"
---

# ADR-0020: Personal authorial signature (serif-italic heading accent + shared motion grammar)

## Status

Accepted. Recorded at decision time. **Extends — does not supersede — the
`Direction A: Conciso anchor only` theme** (`docs/src/styles/docs-theme.css`) and
**complements ADR-0004** (CSS custom-property design tokens) and **ADR-0015** (docs:
Astro + Diátaxis). The teal/slate palette and its WCAG-AA pairings are unchanged; this
adds a signature on top, it does not reverse the rebrief.

## Context

The Atelier docs needed to read as "the same author as pieper.io" without importing
pieper.io's warm/organic palette — that contrast is intentional and must stay. The
question was *which* layer carries cross-site identity. pieper.io emphasises one keyword
per headline in `Instrument Serif` italic, and (going forward) will adopt Atelier's
existing motion-token names and values. So the shared brand DNA is **typography + motion**,
not color.

At the same time the docs chrome had ~25 hardcoded `transition: … <ms>` declarations
scattered across `global.css` and a handful of inline styles — durations like `0.12s`,
`0.2s`, `120ms`, `0.25s cubic-bezier(…)` — none of which referenced the shared
`--ui-duration-*` / `--ui-ease-*` tokens that already exist (and that already zero
themselves under `prefers-reduced-motion`). A "shared motion vocabulary across both sites"
claim is hollow while the docs don't actually use the vocabulary.

## Decision

**Separate brand DNA (typography + motion) from palette (purpose-specific).** Concretely:

1. **Serif-italic heading accent.** Load `Instrument Serif` (400 italic) and expose it as
   `--docs-font-accent`. A new `.docs-accent` class renders one emphasised keyword per
   heading in serif italic, colored `--ui-color-primary` (teal) — *not* pieper.io's
   terracotta. `PageHero` and `SectionHead` gain an optional `titleAccent?: string` prop
   that wraps the first exact substring match of `title` in `<em class="docs-accent">`;
   absent or unmatched, the heading renders as a plain string (backward-compatible — all
   existing callers pass plain strings). The accent inherits the heading's size and
   line-height: a style accent, not a second type scale, so it cannot shift the baseline.

2. **Shared motion grammar = use the existing tokens, invent none.** Every hardcoded
   transition in `docs/src/**` is rewritten to `var(--ui-transition-fast|normal|slow)`
   (`0.1–0.15s` / `120–140ms` → fast; `0.18–0.25s` → normal; `0.3s` → slow). The
   deliberate 520ms View-Transitions theme-reveal `@keyframes` is left alone — it is a
   one-off animation, not part of the hover/press grammar, and has no matching token.

**Font is loaded via the Astro Fonts API** (`fontProviders.google()` in `astro.config`),
matching the existing Inter / JetBrains Mono setup — *not* `@fontsource` as the source
spec literally suggested. Rationale: one font-loading mechanism, free subsetting +
`display: swap`, and a metric-near `Georgia` fallback, which directly satisfies the
no-layout-shift requirement.

**Rejected alternative — share color too.** Giving Atelier pieper.io's warm palette (or
vice versa) would collapse the deliberate contrast between Atelier-teal (Conciso-anchored)
and pieper.io-warm. Identity travels through typeface and timing; color stays
purpose-specific. **Also rejected — new motion tokens / a bespoke accent type scale:**
both would fork the vocabulary instead of sharing it, which is the whole point.

## Consequences

- Atelier stays Conciso-anchored (palette untouched, AA pairings intact) while reading as
  Dominik's work — the signature is portable to pieper.io because it lives in tokens and a
  typeface, not in a palette.
- The docs chrome now has a single timing vocabulary; `prefers-reduced-motion` zeroing
  (already wired into `--ui-duration-*`) now applies uniformly, including to transitions
  that previously hardcoded their own durations.
- Converting durations that omitted an easing function folds in `--ui-ease-out`; a few
  transitions that used bespoke curves (e.g. the sidebar `cubic-bezier`) are normalised to
  the shared easing — a small, intended motion change.
- `titleAccent` is opt-in per heading; usage convention is one keyword per heading. A third
  web font is loaded (italic 400 only, subset), a minor extra request offset by `swap`.
- pieper.io is now expected to adopt the same `--ui-duration-*` / `--ui-ease-*` names and
  the `Instrument Serif` accent for the signature to actually be shared.
