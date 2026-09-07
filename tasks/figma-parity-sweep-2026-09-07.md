# Figma parity sweep — 16 components, 2026-09-07

**Method.** Four Sonnet agents, disjoint component sets, each running
`figma_check_design_parity` with `canonicalSource: 'code'` and then drilling into
the node tree by hand, because the tool compares only the COMPONENT_SET's own
root box. Every agent was told the tool's verdict is an input, not the answer,
and asked to classify each discrepancy as real-or-artifact, which side is wrong,
and whether the value is *derived* (a `calc()`, per ADR-0041) or *stated*.
Read-only: no agent wrote to Figma, `parity.json` or the repo.

Claims marked **[verified]** below I re-measured myself. The rest is the agents'
work, and where they were wrong I say so.

---

## Two root causes worth more than the twenty findings they explain

### 1. AtlDialog was built at 1rem = 10px  **[verified]**

Every Figma width is the code's px ÷ 1.6 — i.e. the master was authored against
a 10px root font size, not the 16px `tokens.css` documents:

| size | code | Figma | px per rem |
|---|---|---|---|
| sm | `min(24rem, 90vw)` = 384 | 240 | **10.0** |
| md | `min(36rem, 90vw)` = 576 | 360 | **10.0** |
| lg | `min(48rem, 90vw)` = 768 | 480 | **10.0** |
| xl | `min(64rem, 90vw)` = 1024 | 640 | **10.0** |

Exact in all four, and no width is variable-bound. This is a single
construction error, not four drifts. `size=full` is `100vw` in code against a
literal 800 in Figma and is not comparable.

### 2. The active-state weight question is answered by the role table, and answers differently per component  **[verified]**

Three components appeared to show "code bolds the current state beyond the
design". `tokens.css`'s own role documentation settles it, and splits it:

```
control  Medium 14 — 6 CSS rules (tab button, page button, step label,
         chip label, select label, chat action)
action   SemiBold 16 — 3 CSS rules (button, accordion trigger, chat header title)
```

| element | governing role | Figma | code | wrong side |
|---|---|---|---|---|
| AtlButton label | `action` → SemiBold | Medium 500 | semibold | **Figma** |
| Pagination page button | `control` → Medium | Medium | semibold on `.is-active` | **code** |
| Stepper step label | `control` → Medium | Medium | semibold on `.is-active` | **code** |
| Badge label | in neither list | Medium | semibold | **undecided** |

Two agents independently read this as one systemic pattern with code at fault.
It is one systemic *question* whose answer flips depending on which role governs
the element — and for AtlButton, Figma is the stale side. Worth noting because
"apply the obvious pattern" would have been wrong in a quarter of the cases.

---

## Findings by component

Scores are the tool's, and are a poor severity signal — AtlStepper scored 27/100
almost entirely on paradigm noise, AtlSkeleton 90/100 with zero real findings.

| component | score | verdict |
|---|---|---|
| AtlSkeleton | 90 | **in sync** — all 4 tool findings artifacts |
| AtlMenu | 92 | **in sync** — row height correctly on the `--ui-row-height-sm` ladder (40px), though unbound in the master |
| AtlTooltip | 76 | **in sync** — every real value matches; score depressed purely by naming artifacts |
| AtlToggle | 43 | **in sync** — geometry, colours, hover and focus all match. Proves the Checkbox/Radio staleness below is fixable in this file |
| AtlCard | 97 | padding=none fixed (see below); asymmetric scale open |
| AtlBreadcrumbs | 87 | separator glyph open; missing `.breadcrumb-current` padding |
| AtlPagination | 80 | `showFirstLast` declared but unwired |
| AtlTabGroup | 83 | row heights 44/36 vs 40/32 |
| AtlAlert | 84 | `dismissible` default; border expressibility |
| AtlBadge | 85 | weight; border expressibility |
| AtlDialog | 77 | the 10px-per-rem bug |
| AtlDrawer | 83 | **most severe** — three of four advertised sizes are non-functional |
| AtlCheckbox | 29 | master stale on four axes |
| AtlRadio | 29 | same, plus the checked "hole" colour |
| AtlRadioGroup | 48 | master does not model the component at all |
| AtlStepper | 27 | four real findings under heavy paradigm noise |

### Fixed already

- **AtlCard `padding=none` padded like `padding=md`** — 12/16/12/16 on all four
  inner frames, identical to `md`, same 190px height. Now 0; the four steps are
  finally four distinct heights (102/146/190/238). Commit `0380f06`.
- **AtlButton labels wrapped to "But / ton"** on all eight `md` variants —
  `textAutoResize: HEIGHT` with a stale 51px fixed width. Commit `eb4fce7`.
- **Block padding policy** applied to AtlButton/AtlInput/AtlBadge. ADR-0107.

### Fixed 2026-09-07 (`0cca35b`)

- **AtlDrawer** rebuilt on a 720×480 viewport — the size that makes every
  existing variant exactly 1:1 with the code (right sm 320 / md 448 / lg 640 /
  full 720, left md 448, top and bottom md 320 tall). Backdrop fills the
  viewport; `header` and `footer` now STRETCH, having been FIXED-width.
- **AtlDialog** widths corrected to 384/576/768/1024; `full` takes 1280, since
  `100vw` has no fixed equivalent and that is the only value keeping
  sm<md<lg<xl<full true. Its two 1px dividers had also been FIXED at the old
  width and stopped short of the edge.
- Housekeeping the resizes forced: `figma_arrange_component_set` is **wrong for
  this file** — it wraps the set in a generic "Component Container" four frames
  deep and lifts it out of its component-named frame, leaving that frame as a
  husk. Every other set here sits directly inside a frame named after the
  component. Reverted by hand. The taller Drawer then overlapped AtlToast, both
  masters overflowed the Overlay section, and Overlay then overlapped Feedback;
  the section's five children and the page's nine sections were re-stacked.

**And the finding that outlasts both fixes: no gate covers master geometry.**
`snapshot.json` records `variantAxes`, `variants`, `properties`, `rootPaint`,
`overlays` and `layers` — not frame dimensions. `check:figma` cannot see a
master's width at all, which is why a 1.6× scale error across five variants and
a drawer with one panel for seven sizes both survived every green run. Both were
found by reading a screenshot. A gate that measures a master's resolved geometry
against the code would have caught both on the day they were introduced.

### Master needs fixing — unambiguous

- ~~**AtlDrawer's size variants are placeholders.**~~ Fixed above. The inner `dialog` panel is
  fixed at 220×320 in `right,sm`, `right,md`, `right,lg` and `right,full`; only
  the outer demo frame changes (320/440/720/1280), and both children are
  `layoutPositioning: ABSOLUTE` with `clipsContent: true`. Screenshot-verified by
  the agent: `sm` clips the panel and truncates its own button, `lg` leaves a
  blank gap. `left`, `top` and `bottom` exist only at `md`. Three of four
  advertised sizes for the one position that has them do not work.
- ~~**AtlDialog's widths** — the 10px/rem bug above.~~ Fixed above.
- **AtlPagination `showFirstLast`** is declared with `defaultValue: true` but
  `componentPropertyReferences` is `{}` on all nine children and there are no
  first/last layers at all. Toggling it in Figma does nothing.
- **AtlCheckbox is stale on four axes**, and AtlToggle in the same file already
  does all four correctly: box 18px vs code's 20px (`1.25rem`); unchecked fill
  bound to `color/surface` where code uses `--ui-color-input-bg`
  (= `surface-sunken`); unchecked border bound to `color/border` (decorative)
  where code uses `--ui-color-border-strong`, the token `tokens.css` documents as
  "functional ≥3:1" for WCAG 1.4.11; border width 1.5px, which is not on the
  library's two-step scale at all. AtlRadio shares the border-token and width
  findings.
- **AtlCheckbox and AtlRadio have no real focus variant** — the box is unchanged
  from default. AtlToggle's focus variant does flip its border to primary, so the
  technique exists here.
- **AtlButton label weight** — Medium 500 against the `action` role's SemiBold.

### Code needs fixing

- **`.atl-card-header` omits its leading.** It restates three of
  `--ui-type-title`'s four axes by hand and inherits 1.5 from `.atl-card` where
  the role says 1.25. Figma has 125% and is right. Exactly what ADR-0036 exists
  to prevent. **[verified]** — delegated.
- **Pagination and Stepper override the `control` role to semibold on the active
  state**, against the role table above. **[verified]**
- **`.step-description` / `.step-optional` hardcode `margin-top: 2px`**, matching
  no token; Figma binds the equivalent gap to `spacing/1` (4px). Code is the
  off-scale side.
- ~~**`.breadcrumb-current` has no padding** where the master pads it to align with
  link items.~~ **Wrong — I was, and it was measured wrong out of me 2026-09-07.**
  `.breadcrumb-link`'s `padding: var(--ui-spacing-1) var(--ui-spacing-2)` is
  exactly cancelled by `margin: calc(var(--ui-spacing-1) * -1) calc(var(--ui-spacing-2) * -1)`
  on the next line — a hit/hover-area enlargement with no effect on the flow. Measured
  in real Chromium: both rows come out 17.5px and the link's text starts at the same
  offset within its row as the current item's span. Adding matching padding without a
  compensating negative margin would have made that row 25.5px — the regression, not
  the fix. Neither side is wrong: the master shows the padding box, the code shows
  padding plus its cancellation, and a static Figma frame cannot express the
  cancellation. Fourth member of ADR-0107's expressibility family, alongside derived
  padding, `100vw`, and (wrongly, at first) `color-mix`.

### Needs a decision

- **The `color-mix` borders.** Alert and Badge colored variants bind stroke to
  the *same* variable as fill, making a 1px border invisible; code uses
  `color-mix(in srgb, var(--ui-color-X-text) 25%, transparent)`. **[verified]**
  — all four Alert variants (`877:403/397/399/401`), and Badge's `default`
  correctly differs (`877:407` vs `877:409`). One agent called the master stale;
  that is too strong. A Figma Variable cannot hold a `color-mix`, so this is the
  same expressibility class as ADR-0107's derived padding: either add explicit
  tint variables, bake a resolved stroke and lose the binding, or accept and
  document.
- **The 8px vs 12px label gap** on all four selection controls — Figma binds
  `spacing/2`, code uses `--ui-spacing-3`. Both are legitimate named steps, so
  this is one decision, not four bugs.
- **AtlCard's asymmetric padding scale** (8/12, 12/16, 20/24 vertical/horizontal,
  each bound) against the code's symmetric 16/24/32. Two systems, not an
  off-by-one, and no ADR records an asymmetric intent.
- **AtlDialog and AtlDrawer content/footer padding** sit one token step below
  code, consistently and bound. Internally coherent enough to look deliberate.
- ~~**AtlBreadcrumbs' separator.**~~ Decided and applied 2026-09-07: Figma's three glyph nodes → `/`, and the CSS fallback `'›'` → `'/'` so the two agree. **[verified]** The code's default is `/`
  (`separator = '/'` in the TSX, always written to the inline `--atl-separator`),
  the spec metadata offers `/` and `>`, and Figma draws `›`. Two consequences:
  the master shows a glyph nothing ships, and `atl-breadcrumbs.css:52`'s
  `content: var(--atl-separator, '›') / ''` fallback is **unreachable** — the
  inline property is always set. The `/ ''` alt-text technique itself is correct
  and is not in question (ADR-0100).
- **AtlAlert `dismissible`** default: Figma `true`, code `false`.
- **AtlRadioGroup's master does not model the component.** It is an indicator
  pill plus one label ("Free"/"Pro"), with no orientation axis, no multi-item
  layout and no children — nothing representing a group of radios. Its
  `selection: unselected/selected` axis corresponds to nothing in
  `AtlRadioGroupSpec`, where selection lives on the children. Redesign it to show
  two or three `AtlRadio` instances per `orientation`, or rename it — pixel
  parity on this node is meaningless until that is settled. The 48/100 score is
  high only because the tool had almost nothing to compare.
- **AtlRadio's checked "hole"** is `text-on-primary` in Figma; code leaves the
  background at `--ui-color-input-bg` and draws the ring with a 6px border, so
  the hole shows `#f1f5f9`. Near-identical in light mode, diverges in dark.
- **AtlStepper's error circle** is two-tone in Figma (fill `danger-text`, stroke
  `danger`); code sets both to `--ui-color-danger`.
- **AtlStepper circle diameter** 32px (Figma) vs 36px (code). Neither is bound,
  but 32 equals `--ui-spacing-8` and 36 matches nothing.
- **AtlTabGroup row heights** 44/36 against the code's 40/32
  (`--ui-control-height-md/sm`). Figma's are unbound literals and its own
  block padding is 0, so 44 is not self-consistent with its own box.
- **Close affordances** are modelled three different ways: Dialog has a bare
  16×16 icon with no hit area, Drawer a 16×28 hug frame, code a 32×32
  `--ui-control-height-sm` button with hover and focus ring.

### Artifacts — do not re-report these

Each was checked independently rather than taken from the tool's label:

- **`lineHeight` unit mismatches.** `21px vs 1.5` is 21/14. `17.5 vs 1.25` is
  17.5/14. `18 vs 1.5` is 18/12. `20px vs 125%` is 16×1.25. All identical values.
- **`#nodeId` suffixes.** Figma names boolean properties `disabled#507:154`,
  `dismissible#507:267`, `linear#507:308`, `showFirstLast#911:26`. The tool's
  matcher does not strip the suffix, so one property reads as two unmatched ones.
- **`targetSize` criticals.** `416×136`, `444×88`, `478×80` are the *aggregate
  bounding box of the whole variant grid*, compared against a single control.
- **The `errorState` "major".** Fires on any semantic-danger-coloured variant as
  if it were form validation. Alert and Badge are not form controls;
  `aria-invalid` does not apply.
- **`role` / `keyboardInteractions` / `focusVisible` info items.** The masters
  carry no a11y annotations at all. A library-wide documentation gap, not
  per-component drift.
- **Imperative props.** `open`, `onOpenChange`, `closeOnBackdrop`, `showDelay`,
  `width`/`height` on Skeleton — no Figma primitive exists, and none should.
- **AtlMenu's "no disabled variant".** The tool inspected the container;
  `AtlMenuItem` carries a bound `disabled#911:27` and a `_disabled-overlay`.
- **AtlCheckbox's 24px row vs code's 40px `min-height`** — invisible hit-target
  padding around a 20px control (ADR-0052). Static mockups do not draw it.

---

## What the tool cannot see, and why the manual drill mattered

`figma_check_design_parity` compares the COMPONENT_SET's own root box against the
flat `codeSpec` it is handed. Four of the most consequential findings —
AtlCard's `padding=none`, AtlDrawer's clipped panels, AtlPagination's unwired
property, and every colour-token binding — live in descendants and were invisible
to it. AtlCard scored **97/100** while its padding scale diverged two levels
down. Treat the score as a hint about the root frame, never as a parity verdict.

## Suggested order

1. AtlDrawer's size variants — the only finding that makes a master actively
   misleading rather than merely inaccurate.
2. AtlDialog's widths — one systematic correction, ÷1.6 across four variants.
3. The code fixes: card header leading, the two `control`-role weight overrides,
   the 2px step margin, breadcrumb-current padding. All small, all gated.
4. AtlCheckbox and AtlRadio to match AtlToggle, which is already right.
5. AtlPagination's first/last layers.
6. The decisions, in one pass: label gap, `color-mix` borders, Card's asymmetric
   scale, the separator glyph, `dismissible` default, AtlRadioGroup's scope.

21 masters remain unswept: the 10 compositional sub-parts, plus AtlAvatar,
AtlAvatarGroup, AtlTable, AtlChat, AtlProgress, AtlAccordionGroup, AtlCombobox,
AtlIcon, AtlSelect, AtlTextarea, AtlToast, AtlCodeBlock.
