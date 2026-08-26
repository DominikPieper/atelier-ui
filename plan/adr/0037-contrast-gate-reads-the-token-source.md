---
status: accepted
date: 2026-08-26
sources:
  - tasks/atelier-design-system-plan.md (Phase 1, port item 2 — "contrast annotated in the token source")
  - tasks/design-rebrief-contrast-2026-04-26.md (the one-off report this replaces as a mechanism)
  - "libs/create-workspace/src/generators/preset/files/styles/tokens.css header: \"All foreground/background pairs verified WCAG 2.2 AA … (52/52 pairs passing 2026-04-26)\""
---

# ADR-0037: The contrast gate reads the token source

## Status

Accepted. Adds `check:contrast` to `check:all`; no token values changed.

## Context

`tools/scripts/wcag-contrast.mjs` existed since April and was wired to nothing.
It had been run once, by hand, and its output committed as
`tasks/design-rebrief-contrast-2026-04-26.md`. The token file's own header still
claims *"All foreground/background pairs verified WCAG 2.2 AA … (52/52 pairs
passing 2026-04-26)"* — a claim four months old that nothing re-checked.

The reason it could only ever be a one-off is structural: **the script kept its
own hardcoded copy of every hex value.** Two duplicated palettes, one in
`tokens.css` and one in the checker, with nothing keeping them equal. Running it
after a palette change would have verified the old palette and reported success.

So the gap was not "nobody ran the script". It was that running the script
proved nothing about the shipped tokens.

## Decision

**The gate reads the palette from the token source. There is no second copy.**

`tools/scripts/wcag-contrast.mjs` now parses
`libs/create-workspace/src/generators/preset/files/styles/tokens.css` — the
generator preset that `sync:tokens` propagates into the three framework libs —
extracting every `--ui-color-*` declaration per block and resolving `var()`
aliases within each mode.

Four modes are checked, not two: `:root` (light), the
`@media (prefers-color-scheme: dark)` baseline, and both `[data-theme]` escape
hatches. The April run covered light and dark media only, so the two explicit
theme overrides — the ones a user actually toggles — had never been verified.
104 pairs now, up from 52, on an unchanged palette.

The pairs table stays hand-written. Which foreground appears on which background
is design knowledge, not something to infer: a generated cross-product would
check hundreds of combinations that never occur and miss the intent behind the
ones that do.

Gate behaviour follows the house style: `--check` is quiet on success (one
verdict line), names every failing pair with its measured ratio and target on
failure, and exits non-zero. Report writing moved behind an explicit
`--report <path>` — a gate that rewrites a file as a side effect is how the
dated April record got clobbered on the first run of this work, which is exactly
the argument for the flag.

A malformed token source — a `var()` alias pointing at a token the mode does not
define, unbalanced braces, a pair naming a colour that does not exist — is a
gate failure with a readable message, not a stack trace.

Alternatives considered:

- **Keep the hardcoded palette, just wire it up.** Rejected: it would gate on a
  copy. The failure mode is the worst kind — green while wrong.
- **Generate the pairs as a cross-product of every colour token.** Rejected:
  volume without meaning. `--ui-color-danger-text` on `--ui-color-success-bg` is
  not a pair anyone renders, and a gate full of hypotheticals trains people to
  skim it.
- **Derive the target ratios from annotations in the token file** (the Conciso
  pattern of writing "T — text AA 5.5:1" beside a ramp step). Deferred, not
  rejected: it is the right shape once ramps exist, because a ramp step's
  intended text use is a property of the step. Today the roles live in the pairs
  table instead, which is honest for a palette without ramps.

## Consequences

- **The header claim is now true and stays true.** `check:all` fails if any pair
  drops below its target, so the sentence in `tokens.css` is enforced rather
  than asserted.
- **Coverage doubled without changing a colour**, purely by checking the two
  `data-theme` blocks. That is the kind of gap a hardcoded copy hides: the
  script's palette had no notion of theme overrides at all.
- **Adjusting a colour is now the only fix.** The gate reads the source, so
  there is no second place to update — and no way to make it pass by editing the
  checker.
- **Verified by negative test**, not by reading: lightening `--ui-color-text-muted`
  to `#b0b8c4` produced three named failures and exit 1; pointing an alias at a
  non-existent token produced the parse error and exit 1; the restored palette
  gives one line and exit 0.
- **The dated April report is left alone.** It stays as the historical record of
  the R1 rebrief; this gate no longer writes to it.
- **Ramps are the next step and will extend this.** When colours grow tonal
  ramps with a marked text-safe shade, the per-step annotation becomes the
  natural source for the expected ratio, and the pairs table shrinks to the
  combinations a ramp cannot express.
