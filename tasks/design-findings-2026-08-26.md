# Design findings — 2026-08-26

Everything the first two component artboards and their parity re-verification
turned up. Grouped by what it takes to resolve, because most of these are one
decision each rather than a list of edits.

Sources: `AtlButton.dc.html` and `AtlInput.dc.html` in the Claude Design project
*Atelier*, plus `figma_check_design_parity` on `129:2` (AtlButton, sm/default)
and `129:23` (AtlInput, default).

## Read this first: which direction is canonical

This is a **redesign**, and Figma is the *target* of the transfer, not the
reference for it. The design system is being reshaped deliberately; the Figma
library is then rebuilt from the result (`tasks/atelier-design-system-plan.md`,
Phase 3). So during this phase:

- **Code + artboards are canonical. The Figma masters are stale by definition**,
  and will stay stale until the transfer.
- The parity runs below were taken with `canonicalSource: "design"`, which is the
  wrong framing for a redesign and makes Figma's values read as authority. They
  are not. Where Figma and the code disagree on a *value*, that is the transfer's
  backlog, not a defect.
- What still counts as a defect is anything **wrong on its own terms** —
  internally inconsistent, invisible to users, or unbindable regardless of what
  Figma currently holds.

The two lists below are split on exactly that line. Everything filed under
"stale in Figma" resolves itself when Phase 3 rebuilds the masters; everything
under "wrong on its own terms" has to be decided.

---

## Stale in Figma — the transfer's backlog, not defects

- **All 29 masters still use Inter.** ADR-0035 changed the library typeface;
  Figma has not followed. Both parity runs report it `major`, which is the
  framing artifact described above. Expected during a redesign — but worth
  knowing that **`check:figma` would never have told us**: it compares names,
  variant axes, token bindings and auto-layout, never typography. Only the
  manual, bridge-dependent `figma_check_design_parity` compares fonts. So after
  the transfer, a later type change could invalidate the library again with every
  gate green. Worth closing then, not now: record the font per master in the
  snapshot so an offline gate can compare it.
- **AtlInput's master is 14px text at 44px tall with 12px padding**; the code is
  16px at 46px with 10/16. Values to reconcile *during* the transfer, in whichever
  direction the redesign decides.
- **AtlButton's master has no focus variant** for three of four variants, and
  neither master carries a11y annotations in its description. Transfer work.

---

## Decision A — RESOLVED 2026-08-26 (ADR-0041)

The height is now the token and the block padding is derived from it
(`--ui-control-height-sm/md/lg`), and controls use the control line-height rather
than the prose one. Verified against the shipped CSS: buttons compute exactly
32 / 40 / 48 and the input exactly 40, so **an input and a button of the same size
step are finally the same height**. The remaining controls still state their
padding and follow the same recipe.

Also worth stating: nothing gates this. A gate that renders each control and
asserts its height equals its token would catch the whole class, and its absence
is why the defect survived for months.

<details><summary>The original finding</summary>

### the size system states heights it does not deliver

Three findings, one root cause.

- **AtlInput renders 46px against its stated 40px `min-height`.** 10+10 padding,
  a 24px line box (1.5 × 16px), 2px border = 46; `box-sizing: border-box` is
  explicit, so `min-height` cannot shrink it.
- **AtlButton `size=md` computes exactly 40px** (9+9+20+2), so **an input and a
  button in the same form row sit 6px apart** — in all three frameworks.
- **AtlButton `size=lg` computes 48.5px** against its stated 48px, for the same
  reason at a smaller scale.

The decision is not per component. It is whether the size steps are **target
heights that the box must honour** (then padding must be derived from
line-height, or `height` replaces `min-height`) or **minimums that content may
exceed** (then the stated 32/40/48 are aspirational and should be renamed).
Either answer is defensible; the current state is that the code says one thing
and renders another, which is a defect no matter what Figma holds.

</details>

## Decision B — the library ships no `box-sizing` reset

Only **10 of 29** component stylesheets set `box-sizing`. AtlInput pins
`border-box`; AtlButton does not, so its geometry depends on whatever reset the
consuming app provides. For a library that deliberately ships its CSS
(ADR-0026), that is an undeclared dependency.

Storybook and the Claude Design runtime both happen to provide a reset, which is
exactly why measurements there look tidy and a consumer's might not.

Options: ship a reset in `styles/tokens.css` (which makes that stylesheet
opinionated beyond tokens — a real cost), or set `box-sizing` on every component
root and gate it. Not a free choice; pick deliberately.

## Decision C — states that exist in one place only

- **`readonly` renders identically to `default`.** `--ui-color-input-bg` already
  *is* `var(--ui-color-surface-sunken)`, and `.is-readonly input` sets the same
  value. Only the cursor differs, in light and dark alike. A state a user cannot
  see is not a state — so either it gets a visual treatment or it stops
  pretending to be one.
- **AtlInput's invalid indicator is a literal `✕` pseudo-element**, not an icon,
  while the icon union already contains `close` and `danger`. The Figma master
  cannot use an icon instance there, and the glyph will not follow the icon set.

## Decision D — literals that cannot be bound in Figma

Six of nine anatomy values on AtlButton and six of eleven on AtlInput are
literals with no token behind them: `min-height` per size, padding per size, the
border width, the invalid indicator's reserved space. Of AtlButton's padding
values only `24px` lands on the spacing scale.

This one survives the reframe: it is not about what Figma currently holds but
about what the transfer *can* bind. A rebuilt master cannot bind a Variable to a
value no token holds, so `check:figma`'s token-link coverage will be incomplete
for these components however carefully the masters are rebuilt. Either the size
steps get tokens, or the gap is recorded as intended. Right now it is neither,
which is the worst of the three.

---

## Fixed in this pass

- **AtlButton hardcoded `-0.01em`** where `--ui-letter-spacing-tight` holds the
  same value → now references the token. Resolved value unchanged.
- **AtlInput restated the focus-ring formula by hand** for its invalid state →
  new token `--ui-focus-ring-danger`, declared once beside `--ui-focus-ring` so
  it follows the mode for free. Manifest at 125/125.
- Parity re-verified and re-recorded for both components against the component
  **set** nodes (`129:20`, `129:33`) rather than a variant node.

## Corrected — things I asserted about Figma without checking

Both artboards currently contain these errors and need a correction pass:

- **`disabled` and `loading` are not "code-only props".** They are Figma
  **Booleans** on the AtlButton set, as are `disabled`, `readonly` and `required`
  on AtlInput. There is also a `hasIcon` Boolean on AtlButton that the code has
  no prop for — the icon is a slot.
- **AtlButton's 24 variants are not "half a 4×3×4 matrix".** They are a
  deliberate two-slice cross: all 4 variants × 3 sizes at `state=default` (12),
  plus all 4 variants at `size=md` × 3 interaction states (12). You do not need
  `outline/sm/hover`, because state styling does not vary by size. The master
  description says as much.

**Why I got it wrong, mechanically:** `tools/figma/snapshot.json` records
`variantAxes` but **not** Boolean component properties. Anything reading only the
snapshot concludes the Booleans do not exist. They appear in the master
`description` as prose — which the snapshot does capture, but as text no gate
parses. So a Boolean could be dropped in Figma and nothing would notice, and
`check:figma`'s variant-matrix completeness would still pass.

That is a snapshot gap worth closing regardless of these two components.
