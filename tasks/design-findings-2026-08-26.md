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

## Decision B — RESOLVED 2026-08-26 (ADR-0043)

Every component now declares its own geometry contract; `check:box-sizing` writes
and verifies it, `check:geometry` measures the result in all three frameworks with
no reset supplied. Chosen over a global reset, an opt-in `base.css`, and
documenting the requirement, because those three can all be forgotten and the
component's own stylesheet cannot.

Two things surfaced while measuring, both worse than the original finding:

- **Angular's button was broken, not merely exposed.** `<atl-button>` is a custom
  element, so it gets `content-box`: 60px at `size=md` against a 40px token, 46.5
  against 32, 73.5 against 48. React and Vue were accidentally immune because
  `<button>` is border-box in the UA stylesheet. ADR-0041's "computes exactly
  32 / 40 / 48" was true in two frameworks out of three.
- **`check:geometry` claimed coverage it did not have.** It measured React and
  justified it with "check:sync guarantees the CSS is mirrored". `check:sync`
  compares directory and story presence and never CSS. My comment, one day old,
  simply invented the guarantee.

Also corrected here: I wrote that AtlButton "does not set box-sizing, so its
geometry depends on whatever reset the consuming app provides". For React and Vue
that was wrong — form controls are border-box by UA default, measured delta 0.

<details><summary>The original finding</summary>

Only **10 of 29** component stylesheets set `box-sizing`. AtlInput pins
`border-box`; AtlButton does not, so its geometry depends on whatever reset the
consuming app provides. For a library that deliberately ships its CSS
(ADR-0026), that is an undeclared dependency.

Storybook and the Claude Design runtime both happen to provide a reset, which is
exactly why measurements there look tidy and a consumer's might not.

</details>

**One claim in that finding was also wrong:** Storybook has no reset. The docs app
does (`docs/src/styles/global.css:5`); the three `.storybook` configs do not. So
Storybook was rendering the drifted geometry — 52px menu items — the whole time.

## Decision C — PARTLY RESOLVED 2026-08-26 (ADR-0045)

**`readonly` — resolved, and much bigger than the finding.** It rendered
identically to `default`, which was true but the least of it: the prop was
declared once on `AtlFormFieldSpec`, inherited by seven specs, and did something
different in each framework. Measured in chromium: `readonly` on a checkbox or
radio is ignored by HTML, and `HTMLSelectElement` has no `readOnly` property —
so React's checkbox and toggle passed the attribute *and* still fired
`onCheckedChange`. Angular never implemented the prop anywhere except input and
textarea. It now lives in an `AtlReadonlySpec` mixin on the four components that
enforce it, with a visual treatment (border transparent, filled surface stays,
height unchanged at 40px) and tests on the guards.

The structural cause is still open: **no gate checks that a spec-declared prop
exists in all three adapters.** `check:spec` copies the spec file; `check:defaults`
only compares default values for axis props. That is the next candidate gate.

**The `✕` glyph — resolved, and it was the tip of something bigger (ADR-0046).**
AtlIcon turned out to be a Unicode glyph map with **zero internal consumers**,
while eleven components drew 14 inline `<svg>`s of their own. Counted by shape:
`close` existed four ways (one shared X, a differently drawn X in AtlStepper,
`'×'` in AtlIcon, `'✕'` in CSS), `check` three ways, `chevron-down` two. The
geometry now lives once in `libs/spec/src/icons.ts`, AtlIcon renders it in all
three frameworks, every component uses it, and `check:iconography` forbids inline
svgs, literal `content:` glyphs, and any name/geometry mismatch.

<details><summary>The original finding</summary>

- **`readonly` renders identically to `default`.** `--ui-color-input-bg` already
  *is* `var(--ui-color-surface-sunken)`, and `.is-readonly input` sets the same
  value. Only the cursor differs, in light and dark alike. A state a user cannot
  see is not a state — so either it gets a visual treatment or it stops
  pretending to be one.
- **AtlInput's invalid indicator is a literal `✕` pseudo-element**, not an icon,
  while the icon union already contains `close` and `danger`.
- ~~The invalid focus ring restates the ring formula by hand~~ — **fixed**:
  `--ui-focus-ring-danger`, declared once beside `--ui-focus-ring`.

</details>

## Decision D — PARTLY RESOLVED 2026-08-26 (ADR-0047)

Measuring first changed the question. **190 of 887 values are literals — 78% were
already token-bound.** Of the 190: 116 are component dimensions with one user each,
17 are viewport units no token can hold, and only **13 duplicated a token that
already exists**. Tokenising all 116 would mean ~100 single-use tokens.

Two of the 13 were live defects: **AtlTab and AtlCodeBlock's header hardcoded
`2.5rem`, exactly `--ui-control-height-md`** — and `check:geometry` builds its
roster from token *references*, so a control that hardcodes the value is invisible
to it. Measured: 41px and 43px against a 40px token. ADR-0041's defect, still live,
in the blind spot of the gate written to catch it.

Resolved: `--ui-border-width` / `-thick` introduced and 154 sites bound (the nine
`1.5px` outlines folded into `thick` — a half pixel is blurry at 1x); 12 bypasses
bound; `check:token-bypass` gates the rule per property family; `check:geometry`
grew from 12 to 36 measurements as eight components joined its roster.

**Still open, now as a recorded decision rather than an accident:** the 116
component dimensions stay literal, so a rebuilt Figma master cannot bind a Variable
to an avatar size or a toggle track. Revisit if the transfer proves it matters.

<details><summary>The original finding</summary>

Six of nine anatomy values on AtlButton and six of eleven on AtlInput are
literals with no token behind them: `min-height` per size, padding per size, the
border width, the invalid indicator's reserved space. Of AtlButton's padding
values only `24px` lands on the spacing scale.

This one survives the reframe: it is not about what Figma currently holds but
about what the transfer *can* bind.

</details>

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

**Both artboards were corrected on 2026-08-26** and re-verified headless: no
"code-only prop" labels remain, the Boolean surface is named, and the anatomy
tables now show the post-ADR-0041 geometry (32/40/48 exact with derived padding;
the input at exactly 40, matching AtlButton md).

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
