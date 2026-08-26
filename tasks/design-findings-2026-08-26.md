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

---

## Decision E — the choice-control family, found by drawing it (2026-08-26, batch B)

Four sheets (AtlCheckbox, AtlRadio, AtlRadioGroup, AtlToggle) turned up four
questions that only appear when the family is drawn together. None is a bug in one
component; each is an inconsistency between components that every gate passes.

**E1 — three sibling rows, three heights.** Measured: checkbox row **29px**, radio
row **32px**, toggle row **27px**. Every one is content-driven — the label's 24px
prose line box plus whatever the control overhangs, and the radio adds 4px of block
padding nothing else has. So the numbers are accidents of three compositions, not
three decisions, and a form mixing them has vertical rhythm no stylesheet states.
A single `--ui-control-row-height` would make them agree *and* make the value
checkable by `check:geometry`. Drawn side by side, with the boxes outlined, on
AtlCheckbox's sheet.

**E2 — the checkbox is nearly a circle.** `--ui-radius-sm` is 8px and the box is
20px, so at a glance it reads as the radio's circle. These are the two controls
whose *shapes* carry the semantics — one-of-many versus any-of-many — and a reader
scanning a form has only the shape to go on. Either the checkbox gets a tighter
radius or the difference stops being load-bearing.

**E3 — the label uses prose leading.** `--ui-line-height-normal` (1.5) on a
one-line label is exactly what made AtlInput 6px too tall in ADR-0041. These rows
never got the tight line-height because their height is nobody's stated target —
which is E1 from the other end.

**E4 — three different Figma↔spec mismatches in one family.** AtlRadio's master
declares an `invalid` Boolean whose stated mapping (`AtlFormFieldSpec.invalid`) does
not exist, because `AtlRadioSpec` is `{ radioValue, disabled }` and extends nothing.
AtlToggle and AtlRadioGroup have the opposite: `invalid` (and `required`, and now
`readonly`) in the spec with no Boolean on the master. And AtlRadioGroup's variant
axes describe a gallery — group-level `selection` and `state` — where the code puts
both on a child. The snapshot cannot see any of this: it records `variantAxes` but
not Boolean properties, which survive only as prose in the master description
(the same gap that produced two false claims earlier today).

---

## Decision F — the status family (2026-08-26, batch C)

**F1 — four components, four variant sets.** AtlAlert is `info | success | warning
| danger`. AtlBadge and AtlToast add `default`. AtlProgress has `default` and drops
`info`. The same four semantic colours, offered in four combinations, so the set
cannot be learned once. Either it is uniform or each omission gets a reason.

**F2 — the status colours are literals.** Every variant's background, text and
border alpha is written into its component's stylesheet. ADR-0038 built the teal
ramp and stopped; danger, success, warning, info and the neutrals never got one. So
a rebuilt master cannot bind a Variable to any of the status colours on three
sheets, and the same hue is spelled out three times.

**F3 — AtlBadge md is 29.5px tall.** Five pixels of padding each side, a 17.5px
line box (14px at 1.25) and two 1px borders. A badge in a table row cannot align on
a whole pixel, and the two sizes cannot share a baseline grid. Nothing states the
height, which is the same root cause as Decision E1.

**F4 — AtlProgress's size scale is undeclared.** 6 / 10 / 14px is plainly a
progression and exists only as three literals. Unlike the ~116 one-off dimensions
ADR-0047 deliberately left alone, a scale is exactly what a token set is for.

**F5 — AtlToast's master crosses a container axis with a component axis.**
`position` anchors `AtlToastContainerPosition`; `variant` describes the toast.
Crossing them yields 8 variants for 5 appearances and 4 anchors, and implies a
per-toast position the API does not offer.

**F6 — `label` on AtlProgress is documented as required and typed optional.** The
spec's own comment says ARIA needs it; the type lets it be omitted. A comment is
not enforcement.

Resolved in this batch: the Unicode glyph maps in AtlAlert and AtlBadge (ADR-0050),
which every gate had passed all day.

---

## Decision G — the overlay family (2026-08-26, batch D)

**G1 — three dropdown rows, three heights.** A menu item is 36px, an AtlSelect
option 36px, an AtlCombobox option 40px. All three are list rows a user reads the
same way; two of the three numbers are literals, and only AtlMenu's compact row sits
on a token. One height for all list rows, or a stated reason per component.

**G2 — the dialog and drawer headers sit between two type roles.** Both are 20px at
600. `--ui-type-title` is 18/600, `--ui-type-headline` is 24/700. Two occurrences of
the same off-role treatment; a third would settle whether the role set needs a step
or the headers need to move onto one. Related: the roles still have no consumers
(ADR-0049).

**G3 — `closeOnBackdrop` is a Figma Boolean on AtlDrawer and code-only on
AtlDialog.** Same prop, same behaviour, two sibling overlays built on the same native
`<dialog>`, and only one of them lets a designer see the option.

**G4 — AtlDrawer's `size` axis has two meanings.** A width for left/right, a height
for top/bottom. The master crosses `position` × `size`, so the axis name alone never
says which dimension moves. And it draws 7 of the 16 combinations without stating
that the slice is deliberate — AtlButton's master does state it.

**G5 — AtlTooltip's API carries one framework's idiom.** The props are `atlTooltip`,
`atlTooltipPosition`, `atlTooltipDisabled`, `atlTooltipShowDelay` — because Angular
implements it as an attribute directive, where the selector *is* the prop. React and
Vue inherit a prefix they have no reason for, in a spec whose whole point is being
framework-agnostic. Angular also positions the bubble with CDK overlay transforms
rather than `.position-*` classes, which is why it holds all four entries in the
variant-axis exception allowlist.

**G6 — AtlMenu's master models the panel and not the items.** Its only axis is
`variant` = default | compact, while every state that matters — active, disabled, a
shortcut, the separator — lives on `AtlMenuItem`, which has no master. A designer
opening it sees two panels and none of the behaviour.

---

## Decision H — the navigation family (2026-08-26, batch E)

**H1 — 36px is a size the control scale does not have.** `2.25rem` is written out
four times, in four stylesheets: the AtlStepper circle, an AtlMenu item, an
AtlSelect option and an AtlPagination button. It sits between
`--ui-control-height-sm` (32) and `-md` (40). Four independent uses is not an
accident; it is the missing step.

**H2 — four masters carry axes that are illustrations, not props.**
AtlBreadcrumbs' `items` = 3|4|5, AtlPagination's `position` = first|middle|last,
AtlTabGroup's `selected` = 0|1 and `state` = default (one value), AtlRadioGroup's
group-level `selection`. None of them is a prop; each pictures an outcome of content
or of a code-only value. A designer reading the variant list sees API where there is
none. One decision for all four: drop them, or mark them gallery-only on the master.

**H3 — container masters keep claiming their children's states.** AtlStepper's
`state` axis maps to `AtlStepSpec`'s flags, AtlMenu's master has no item states at
all, AtlTabGroup's description lists a `disabled` that lives on `AtlTabSpec`, and
AtlRadioGroup's axes put selection on the group. Four components, one shape of
problem: the master varies the container to show a child.

**H4 — AtlBreadcrumbs' separator is typed `string`.** So the default `/` is a text
glyph and an icon is impossible — the same glyph-as-icon shape ADR-0046 removed from
the CSS and ADR-0050 from the TypeScript, surviving here because it is a *public
prop* rather than an internal detail.

**H5 — AtlStepper's ARIA is still unresolved**, and it is the one open item that
warns on every gate run: metadata says `progressbar`, all three adapters render
`tablist`/`tab`/`tabpanel`, the master claims `<ol>` + `aria-current="step"`. Its
sheet deliberately draws the visuals without asserting a role.

Resolved in this batch: `all: unset` silently resetting the box model, which had
AtlPagination's button rendering 38px against its own `height: 2.25rem` (ADR-0051).

---

## Decision I — containers and data (2026-08-26, batch F)

**I1 — CORRECTED 2026-08-26.** I claimed AtlAccordionGroup's trigger is 52px because
16px text at 1.5 gives a 24px line box, and that the tight line-height would give 44.
**Both halves were wrong**, and I arrived at them by arithmetic on an assumption
rather than by measuring. Measured, four ways:

| accordion trigger | height | line-height | min-height |
|---|---|---|---|
| as shipped | **52px** | `normal` (≈18.4px) | 52px |
| tight forced | 52px | 20px | 52px |
| min-height removed | **50px** | `normal` | 0 |
| tight, min-height removed | **52px** | 20px | 0 |

So the trigger never used prose leading — its line-height resolves to `normal` — and
the 52px comes from a `min-height: 3.25rem` literal. Stating the tight line-height
would make the content 52px, i.e. *taller* than the 50px it is now, not shorter. The
direction of my claim was inverted.

What survives: the pattern is real for AtlCheckbox, AtlRadio, AtlToggle and AtlTable
(E1/E3), where a stated prose line-height does drive the box. The accordion is not an
instance of it. And the census found the wider defect that matters more: **32 of 70
text-bearing boxes move under a perturbed inherited line-height**, so their heights
depend on which typeface is installed. That is Option C in
`tasks/rhythm-options-2026-08-26.md`.

**I2 — three type sizes reach off the scale.** AtlTable's `sm` uses 13px,
AtlAvatar's `xs` initials 10px, AtlCodeBlock's label 0.72rem (≈11.5px). The scale
has 12 and 14 and nothing below 12. Three independent components is a pattern:
either the scale gains steps or these round onto it.

**I3 — one header treatment is expressible and one is not.** AtlCard's header is
18/600 — exactly `--ui-type-title`. AtlDialog's and AtlDrawer's are 20/600, which is
no role. So the library has two header sizes, and the role layer covers one of them.

**I4 — AtlTable's row heights are all content-driven.** 32 / 42 / 51px for sm / md /
lg. A table row is the most repeated box in an application, and a 42px row cannot
align with the 40px control beside it.

**I5 — AtlAvatar's square axis keeps one radius across a 24→64px range**, so the two
ends do not read as the same shape. And `status` — four visible states — is code-only
with `''` as a union member standing in for "none", where every other optional prop
simply omits.

**I6 — two masters keep a one-value `state` axis** (AtlTable, AtlTabGroup) whose own
descriptions say the mash-up was removed. The variant list therefore claims one axis
more than the API has.

Resolved in this batch: AtlCard and AtlAvatarGroup rendering in the consuming app's
font (ADR-0049), the accordion heading's box model reset away (ADR-0051), and the
avatar's person silhouette plus the table's sort arrows becoming AtlIcon instances
(ADR-0046).

---

## Decision J — content components, and what the transfer needs first (2026-08-26, batch G)

**J1 — there is no Figma master for AtlIcon.** Twenty-nine masters exist and none of
them is an icon. That was survivable while every component drew its own symbols; it
is not now that all of them instance this one (ADR-0046, ADR-0050). Until the master
exists, no rebuilt master can place an icon instance — which was the original reason
AtlInput's `✕` was a finding at all. **This is the first thing Phase 3 has to
create**, before any other master is rebuilt.

**J2 — AtlCodeBlock has a master and no spec interface.** The only component in that
state. `check:parity` reports it unmappable and `check:metadata` needs it
allowlisted; whatever props the three adapters accept, nothing states them in one
place.

**J3 — AtlSkeleton decides its geometry in JavaScript.** `computeHeight(variant,
width, height)` returns `1em`, the width, or `100px`. The sizes therefore cannot be
read from the stylesheet, bound to a Figma Variable, or seen by any gate that reads
CSS. All three cases are expressible in CSS (`aspect-ratio: 1` for the circle).

**J4 — the masters model containers, not the parts people adjust.** AtlChat has
seven exported components and one master, covering the outer surface; the header,
message list, message, typing indicator, chips and input exist only in code.
AtlSkeleton's master shows three shapes where the design work is the assembly. Same
shape as Decisions G6 and H3.

**J5 — `role="log"` on AtlChat is declared and never rendered** — the second
unresolved ARIA question beside AtlStepper's, and the other one that warns on every
gate run. The metadata says the message list is a `log`; the adapters expose
`dialog`, `listitem` and `status`, with the listitems in no list.

**J6 — two more off-scale values**, joining Decision I2: AtlCodeBlock's label at
`0.72rem` (≈11.5px) and its code at line-height `1.65`, where the scale has 1.25 and
1.5. The second is a real requirement — code needs looser leading than prose — and
belongs in the scale rather than in one stylesheet.

---

## Where the redesign stands

All 29 components have an artboard, each stating what the code measurably does
rather than what its stylesheet appears to say. Ten decision groups (A–J) are
recorded above. The ones that recur across the most components, and so are worth
settling before the Figma transfer:

1. **Nothing states a row height.** Checkbox 29 / radio 32 / toggle 27, table rows
   32/42/51, accordion trigger 52, badge 29.5. All content-driven, none a token, and
   several only correct by luck (E1, F3, I1, I4).
2. **Prose leading on single lines** is the mechanism behind most of those (E3, I1).
   ADR-0041 fixed it for every control; the boxes whose height nobody states never
   got it.
3. **36px is a missing step** in the control scale, written out four times (H1).
4. **The status colours have no ramps** — ADR-0038 built teal and stopped, so three
   sheets' worth of variant colours cannot bind (F2).
5. **Off-scale type**: 10px, 11.5px, 13px, and line-height 1.65 (I2, J6).
6. **AtlIcon has no master**, and everything now depends on it (J1).
7. **The masters keep claiming their children's states**, and carrying axes that are
   illustrations rather than props (E4, G6, H2, H3, J4).

---

## Measured, 2026-08-26 late: the rhythm census

A five-agent census measured the row heights, the line-height inheritance, the
2.25rem uses and the content floor of every row. Full options in
`tasks/rhythm-options-2026-08-26.md`. Three results change what the seven questions
above are worth:

**32 of 70 text-bearing boxes move under `* { line-height: 3 }`** — their heights are
decided by inherited text metrics, so they depend on which typeface is installed.
This is the measurable core of items 1 and 2, and it is fixable without any height
token (Option C).

**A root-level line-height does not hold.** `.atl-table { line-height: tight }` still
leaves `tbody tr` at 67px under the probe; stating it on `td` holds at 42.5px. So the
declaration has to sit on the measured element, ~118 times across three frameworks.

**ADR-0041's derived-padding formula is wrong for a row.** A size-md table cell with
derived padding renders 62.5px when it holds an md button; with the block padding
zeroed and the height stated it renders 41.0px. A row centres its content; a control
pads it. Two recipes, not one — which the ADR does not currently distinguish.

And one correction to the census itself, which it flagged: its **Angular numbers are
fixture artifacts** (`:host` matches nothing in a plain document) and must be
re-measured with the `hostify` technique from `tools/scripts/check-geometry.mjs`.

