---
status: accepted
date: 2026-10-09
sources:
  - plan/research/ai-ds-course-gap-2026-10-08/wave2-a3-parity-run.md (the AtlBadge parity run that reported fontWeight 500 vs 600)
  - plan/adr/0074-two-roles-the-eight-did-not-span.md (the rule this record applies: a role needs the rule of three on both sides)
  - libs/styles/src/tokens.css (`--ui-type-emphasis`)
  - tools/figma/text-nodes.json (Figma counts, 2026-10-09)
---

# ADR-0162: An `emphasis` role for short SemiBold text at `sm`; none at `xs`

## Status

Accepted. Recorded at decision time.

## Context

A `figma_check_design_parity` run on AtlBadge (2026-10-08) found the master's text at Medium
(500) and the code at `--ui-font-weight-semibold` (600). The owner decided the code is right.

The fix could not be made in Figma alone. The badge text is bound to `ty/control` (Medium 14)
and `ty/label` (Medium 12), which other components share, and `check:figma` `[TEXT-STYLE]`
blocks any `ty/*` style without a `--ui-type-*` role in `tokens.css`. Overriding the weight on
the node detaches the style and raises the `TEXT-UNSTYLED` ratchet. A SemiBold style therefore
needs a role, and ADR-0074 allows a role only when the rule of three holds in CSS and in Figma.

Measured on 2026-10-09 (CSS by reading the cascade, not in a browser):

| Combination           | CSS rules with that computed text                              | Figma own nodes, unstyled                                                  |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| SemiBold `sm` / tight | 3: `.atl-badge.size-md`, `.step-circle`, `.breadcrumb-current` | 15: AtlAvatar 2, AtlAvatarGroup 5, AtlBreadcrumbItem 1, AtlStep 4, AtlTh 3 |
| SemiBold `xs` / tight | 2: `.atl-table thead th`, `.atl-badge.size-sm`                 | 6: AtlAvatar 2, AtlAvatarGroup 4                                           |

Rejected as matches: `.code-block-label` (mono family), avatar initials (leading 1) and
`.overflow-badge` (inherits page leading).

## Decision

1. **`--ui-type-emphasis`**: SemiBold, `--ui-font-size-sm`, tight leading, the sans family.
   Named after the `row` / `row-sm` pattern: short text set apart by weight, not a control label
   (`control` is Medium) and not text that acts (`action` is `md`).
2. **Figma style `ty/emphasis`** mirrors it. Bound on 2026-10-09 to the AtlBadge `size=md` text,
   the four AtlStep `step-number` nodes and the AtlBreadcrumbItem current label, the nodes whose
   CSS computes to the role.
3. **`.atl-badge.size-md` uses `font: var(--ui-type-emphasis)`.** Other CSS rules that compute to
   it stay longhands for now; moving them is mechanical and recorded as follow-up.
4. **No role for SemiBold `xs`.** Two clean CSS rules miss the rule of three. AtlBadge `size=sm`
   stays on `ty/label` (Medium) in Figma, a known 500/600 split, recorded rather than forced.

Rejected:

- **A `badge` role.** One component's rule is not a scale step (ADR-0074).
- **Weight override on the node.** Detaches the style; the gate counts it as unstyled.
- **Code to 500.** Against the owner's decision.

## Consequences

- AtlBadge `md` matches across Figma and code; `sm` does not, by decision.
- AtlAvatar and AtlTh Figma nodes are SemiBold 14 but were not bound: their CSS differs (avatar
  initials set leading 1; the table header is `xs` in CSS but 14px in Figma, a separate drift).
- A third clean SemiBold `xs` rule would justify `--ui-type-emphasis-sm` and close the badge
  `sm` split.
- Weakest point: the CSS counts come from reading the cascade, not from computed styles in a
  browser; `check:paint` and `check:geometry` cover the badge, not the other candidates.
