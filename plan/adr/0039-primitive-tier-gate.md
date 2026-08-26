---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0018-figma-token-tiering-and-css-projection.md (the tiering this enforces)
  - plan/adr/0036-type-roles-not-axes.md (left the --ui-font-display hole open)
  - plan/adr/0038-tonal-ramps-with-checked-annotations.md (left the ramp-step hole open)
---

# ADR-0039: A gate for the primitive tier

## Status

Accepted. Adds `check:primitives` to `check:all`. No component CSS changed —
there was nothing to fix.

## Context

ADR-0018 tiers the tokens primitive → semantic → component, and the semantic
tier is the one component CSS is meant to address. Two records left the same
hole open in the same shape, both noted at the time and neither closed:

- ADR-0036 introduced `--ui-type-display` precisely so that "serif, italic,
  never bolded" is one token rather than three declarations to get right — and
  nothing stopped a component from naming `--ui-font-display` directly and
  pairing it with a weight the face does not have.
- ADR-0038 made the teal ramp the primitive tier, with each theme aliasing a
  different step — and nothing stopped a component from naming
  `--ui-color-teal-700` directly, pinning it to the light theme's shade of the
  brand colour in every mode.

The manifest says not to in both cases. A constraint in an annotation is
guidance; the two ADRs both said so about themselves and both deferred the fix.

What makes this failure mode worth a gate rather than a review habit: reaching
past the semantic tier **looks right in the component that does it**. The colour
is the correct colour, in the theme the author had open. It is wrong only in the
other theme, or only after the ramp moves — which is to say, wrong somewhere
nobody is looking.

## Decision

`check:primitives` scans component CSS for `var(--ui-…)` references and fails on
any that names a primitive.

The primitive patterns and their exemptions live in
`tools/scripts/lib/allowlists.js`, next to the other gates' exceptions, each
carrying what to use instead and why:

| Primitive | Use instead |
|---|---|
| `--ui-color-teal-{50…900}` | the semantic that aliases it, so the mode picks the step |
| `--ui-font-display` | `--ui-type-display` |
| `--ui-font-mono` | `--ui-type-code` |

Exemptions use the two-kind convention the other gates already use: `design` is
a closed question and stays silent, `gap` is an unfinished migration and warns on
every run. One exemption exists — `code-block:--ui-font-mono`, which predates the
role and is the reason `--ui-font-mono` had to be declared at all.

Scope is component CSS only. The token source declares primitives, which is its
job; the docs app is a consumer like any other product surface and is governed by
its own theme layer.

**`--ui-font-family` is deliberately not in the list.** Its manifest constraint
says "apply on :root or the app shell — do not respecify per component", and 25
of 29 component stylesheets currently do respecify it. Adding it here would make
the gate red on arrival and force either 25 rushed edits or a 25-entry
allowlist. That migration is tracked separately; the gate can adopt the token
when the migration lands, and the gate's own staleness check will then say so.

Alternatives considered:

- **An eslint/stylelint rule.** Rejected: the repo's gates are node scripts
  reading the sources, and this one needs the same primitive definitions the
  other gates read. A second mechanism for the same allowlist would fork it.
- **Warn instead of fail.** Rejected: the whole point is that the violation looks
  correct locally. A warning is what the manifest annotation already was.
- **Derive the primitive list from the manifest constraints** by parsing the
  prose. Rejected: guessing intent from sentences, to enforce a rule, is exactly
  the kind of clever-but-wrong the repo has rejected before (ADR-0031).

## Consequences

- **Both open holes are closed with zero violations to fix**, which is the
  cheapest possible moment to install a gate: it starts green and stays honest
  from the first commit that would have broken it.
- **Verified by negative test.** Adding `var(--ui-color-teal-600)` to a card
  stylesheet fails naming the file, line, token and the semantic to use instead;
  the same for `--ui-font-display`; and removing code-block's `--ui-font-mono`
  usage makes its exemption fail as `[STALE]`, so a finished migration cannot
  leave its exemption behind.
- **Coverage is stated, not implied**: 2654 token references across 88 component
  stylesheets, three primitive patterns, one exemption. A gate that reports what
  it scanned is a gate you can argue with.
- **The warning scales with migrations, not occurrences.** code-block's six
  violating lines produce one warning, because the thing to fix is one migration.
- **`check:all` is at 20 gates.**
