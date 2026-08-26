---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0035-typography-instrument-pair.md (the font decision this encodes)
  - tasks/atelier-design-system-plan.md (Phase 1, port item 3)
  - "Conciso Design System – Test (reference only): a 15-token role scale in `colors_and_type.css`"
---

# ADR-0036: Type roles, not a size ladder

## Status

Accepted. Additive — the existing typography axes stay, and no component CSS
changes in this record.

## Context

Atelier's typography API was `--ui-font-size-{xs…2xl}` plus separate weight,
line-height and letter-spacing tokens. That is a **size ladder**: it tells a
component author how big something can be, and nothing about what it is. Every
decision about which size pairs with which weight and which line-height was
re-made per component, from prose, 29 times.

ADR-0035 made that worse in one specific way. Its central rule —
*weight comes from the sans; the display face ships one weight and must never be
bolded* — existed only as prose in the ADR. Nothing stopped a component from
writing `font-family: var(--ui-font-display); font-weight: 700`, which
synthesises a fake bold and looks wrong. A rule that lives in a document is a
rule that gets broken by the next person who does not read it.

The reference for the shape is the Conciso design system's 15-token role scale
(display / headline / title / body / label × sizes) — the structure, not its
values, per `tasks/atelier-design-system-plan.md`.

## Decision

Add a **role tier**: eight `--ui-type-*` tokens as `font:` shorthands, each
composed entirely from the existing axes.

| Role | Resolves to |
|---|---|
| `--ui-type-display` | italic 400 2.25rem/1.25 Instrument Serif |
| `--ui-type-headline` | 700 1.5rem/1.25 Instrument Sans |
| `--ui-type-title` | 600 1.125rem/1.25 Instrument Sans |
| `--ui-type-body-lg` | 400 1.125rem/1.5 Instrument Sans |
| `--ui-type-body-md` | 400 1rem/1.5 Instrument Sans |
| `--ui-type-body-sm` | 400 0.875rem/1.5 Instrument Sans |
| `--ui-type-label` | 500 0.75rem/1.25 Instrument Sans |
| `--ui-type-code` | 400 0.875rem/1.5 JetBrains Mono |

Component CSS should reference a **role**, not an axis. The axes remain for the
cases a role genuinely does not fit, and as the single source the roles compose
from — so sizes are still declared exactly once.

Three supporting tokens were needed and added: `--ui-font-size-3xl` (2.25rem, so
the display role has a size to name), `--ui-font-weight-bold` (700, the weight
the headline role carries), and `--ui-letter-spacing-uppercase` (0.08em — see
Consequences). Manifest is at 114/114 annotated.

**Why `font:` shorthands rather than re-derived axes.** The alternative — keep
the separate axes and simply set them to the role values — was the
recommendation in the plan before the font decision existed. It stops working
once the rule to encode is a *relationship* between family, style and weight.
`--ui-type-display` makes "serif, italic, never bolded" a single thing you
either use or do not; three separate axes make it three things you have to get
right together.

That the shorthand composes from `var()` was verified in a browser before
committing to it, and then re-verified against the shipped `tokens.css` rather
than a synthetic fixture — all eight roles resolve to the intended computed
style, weight, size, line-height and family.

Alternatives considered:

- **Re-derive the axes, add no new tokens.** Rejected, see above: it cannot
  express a relationship, only values.
- **Fifteen roles, mirroring Conciso exactly** (display/headline/title/body/label
  × lg/md/sm). Rejected: Atelier has one display line per surface and no use for
  three display sizes. Eight roles cover every text Atelier actually renders;
  the ladder can grow when a real case appears.
- **Migrate the components in the same change.** Rejected: it would put a
  29-component CSS migration in the same diff as a new API, and make 25 parity
  records stale at once. Additive first.

## Consequences

- **The rule is now mechanical.** A component that uses `--ui-type-display` gets
  ADR-0035's no-bold-serif rule for free. A component that hand-assembles the
  axes can still break it — which is why the migration matters, and why a
  follow-up gate could reasonably forbid naming `--ui-font-display` outside the
  role definition.
- **`font:` is a shorthand, with the footgun that implies.** It resets
  `font-style`, `font-variant`, `font-stretch` and `line-height`, so it must be
  declared *before* any `font-*` override in the same rule. Documented in the
  token file and in every role's manifest constraints.
- **It does not carry `letter-spacing`** — that stays a separate declaration.
  Testing the roles against the real token file surfaced that
  `--ui-letter-spacing-wide` is 0.01em, which is nearly invisible on uppercase
  text and would have made the label role unusable as annotated. Added
  `--ui-letter-spacing-uppercase: 0.08em` and pointed the label role at it. This
  is the second time in two records that rendering the thing found a defect that
  reading it did not.
- **Nothing consumes the roles yet.** They are verified but unused; the
  migration lands per component group, in its own commits, and each group makes
  its components' parity records stale. Tracked in `tasks/todo.md`.
- **Two more phantom tokens confirmed.** The synced design-system manifest
  listed `--ui-font-weight-bold`, `-extrabold`, `-black` and
  `--ui-letter-spacing-uppercase` while the repo declared none of them. `bold`
  and `uppercase` are real as of this record; `extrabold` and `black` remain
  fictions of `/design-sync`.
