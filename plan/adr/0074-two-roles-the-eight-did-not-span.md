---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0036-type-roles-not-axes.md (the role set this extends)
  - plan/adr/0073-a-role-is-for-prose-not-for-a-derived-box.md (the block that found the gap)
  - plan/adr/0059-the-file-was-in-the-wrong-typeface.md (the AUTO leadings this finishes)
  - plan/adr/0070-the-catalogue-is-generated.md (whose idempotency claim this corrects)
---

# ADR-0074: Two roles the eight did not span

## Status

Accepted. Adds `--ui-type-control` and `--ui-type-action` with their `ty/*` styles, binds
231 of 509 Figma text nodes, and fixes a real idempotency bug in `figma:sync-inventory`.

## Context

ADR-0073's verification pass measured something nobody had: the eight `ty/*` text styles
are gated against `tokens.css` to three decimals, and **509 text nodes in 37 of 43 masters
used none of them**. The gate checked that the styles were *correct*; it never checked that
anything *used* them.

Classifying all 509 against the eight styles found **204 in combinations no role
expresses** — and the largest single group was **75 nodes at Medium 14px**. That is not
sloppiness. The library's own CSS writes the same combination by hand in six rules: the tab
button, the page button, the step label, the chip label, the select label and the chat
action. **Both sides had independently worked around the same gap**, which is the CSS-side
finding of ADR-0073 arriving from the Figma direction.

## Decision

**1. Two roles, each measured on both sides before being added.**

| role | value | CSS rules | Figma nodes |
|---|---|---|---|
| `--ui-type-control` | medium `sm` / tight | 6 | 75 |
| `--ui-type-action` | semibold `md` / tight | 3 | 15 |

`control` is the label **on** a control; `action` is the text of a control that **acts** — a
button, an accordion trigger. Named for the `--ui-control-height-*` ladder they sit on. The
tight leading was not chosen: of the 30 nodes in these two combinations that state a
leading at all, **all 30 state 125%**, and `.atl-button` and `.accordion-trigger` state
`--ui-line-height-tight`. Rule of three is met twice over on both sides; the combinations
that missed it (`SemiBold 20` in the dialog and drawer headers, `Regular 12` in the
tooltip) got no role and are recorded instead.

**2. 231 nodes bound; 201 deliberately not.** The split is whether binding can change the
rendered leading:

- **safe (231)** — the leading already matches the role, or the role's leading is *tight*,
  where `AUTO` (≈1.21 for Instrument Sans) → 125% is a ~3% change that makes a stated value
  out of an unstated one, which is ADR-0059's point.
- **left alone (201)** — every one wants `body-sm`/`body-md` at 150%, and in the CSS those
  same elements take `tight` **by inheritance from the control root**. Figma has no
  inheritance for `line-height`: every text node states its own. So binding them to a body
  role would *create* a divergence, not remove one. Whether each is prose (Toast's message,
  which the CSS really does set to `body-sm`/normal) or control text (a table cell, a menu
  row) is answered per node by the CSS, not by how the node currently looks.
- **no role (77)** — 14 distinct combinations, recorded with counts.

**3. Binding by appearance is "absent is not compatible" in a new costume.** AtlTextarea's
five nodes were 14px/150% — an *exact* match for `ty/body-sm`, so the binder chose it and
cemented the very divergence ADR-0073 had recorded: the CSS says
`font: var(--ui-type-body-md)` = 16px. Rebound to `ty/body-md`, which fixes the divergence
as well as the binding. **The current appearance is not evidence of the intent.**

**4. The gate caught my own bad binding within one run.** AtlTooltip's nodes are Medium
12px, so they matched `ty/label` — and `[ROOT-PAINT]` immediately blocked:
*"root text leading is 125%, but the CSS says 150%"*. `.atl-tooltip` is `xs` + `normal`
with no weight, and `--ui-type-label`'s own manifest constraint says it is *"not a
substitute for body-sm in running text — labels are named, not read"*. A tooltip is read.
Exactly one CSS rule wants `xs` + normal, so the rule of three fails and there is no role:
the four nodes are detached and raw at Regular 12/150%, which `[ROOT-PAINT]` guards.

**5. `figma:sync-inventory` was not idempotent, and ADR-0070's claim was weaker than it
read.** A preview wider than its card frame is set to `layoutSizingHorizontal = 'FILL'`,
which changes its width permanently — so the staleness test comparing that width to the
master's was *always* true and every run "updated" the same 15 cards. ADR-0070 verified
idempotency by re-deriving the expected card contents, because the second run had stalled
on Desktop Bridge contention. Re-derivation checked the *data*; it could not see a bug in
the *test*. Fixed by skipping the size comparison for a FILL-sized preview — `main.id`
already catches the case the size check existed for. Two consecutive runs now report
**0 updated**.

## Consequences

- 240 text nodes touched (231 bound, 5 rebound, 4 detached). `check:figma` exits 0,
  `check:all` exits 0, `nx run-many test lint` over angular/react/vue/spec exits 0.
- **Layout impact measured against a real "before".** The Inventory cards carry each
  master's dimensions from this morning's sync, so comparing them to the live default
  variants gives a genuine before/after: **40 of 43 unchanged, 3 grew by 1–2px** (AtlCard
  +2, AtlStepper +1, AtlDialog +2). The first version of that comparison was wrong — it
  read the COMPONENT_SET's bounding box against a card that states the default *variant*'s
  size, and would have reported "37 masters grew" with deltas up to 2416px.
- **A risk that was real and empirically absent.** A Figma text style also carries
  `letterSpacing`, and `tokens.css` says explicitly that the roles do not touch it — so
  binding could have zeroed a node's own tracking. Measured first: **0 of the 432
  candidates had non-zero letter-spacing.** (Which is itself a small divergence: the CSS
  gives `.atl-badge` and `.code-block-label` letter-spacing that Figma does not.)
- **Three findings recorded rather than half-fixed:** the dialog and drawer headers are
  SemiBold **20px** in the CSS, off the type scale and 2px from `ty/title`; AtlCard and
  AtlDialog draw their buttons by hand at Medium 14 instead of instantiating AtlButton
  (ADR-0068's composition problem again); and `.atl-accordion-group` states a family and a
  leading but **no font-size**, which `check:typeface` does not require.
- The transfer's typography now has a floor: 231 nodes cannot drift from the scale, and the
  two roles mean the next 90 have somewhere to land.
