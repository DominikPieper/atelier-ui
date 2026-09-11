# Figma as Visual Source of Truth

**File:** Atelier
**File Key:** `QMnDD8uZQPldPrlCwZZ58T`
**URL:** https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier%20UI

---

> **Corrected 2026-09-09** (ADR-0116): the whole-document staleness note that stood here —
> `Llm*` component names, the "27 component sets" count, both `COMPONENT_SET` node-id
> tables, and the `Inter` font-family references in the Text Styles table — is resolved.
> Names are `Atl*` throughout, the node-id tables were replaced with a pointer to
> `tools/figma/snapshot.json` rather than transcribed a third time, and the Text Styles
> table now states the `ty/<role>` ↔ `--ui-type-*` mapping rule instead of a role list
> that has already grown three times (ADR-0059, ADR-0074, ADR-0085). The **Variable
> Collections** table below is a separate, narrower staleness case — it carries its own
> note (ADR-0030) and was not in scope for this pass. Token _value_ ownership — which
> file to edit, what propagates where — is mapped by axis in ADR-0115 and applied in the
> Design Token Change workflow below.

## File Structure

### Pages

| #   | Page               | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Colors`           | Visual documentation of the color scale (Light/Dark).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2   | `Typography`       | Visual documentation of the typography scale + text styles.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3   | `Spacing & Radius` | Visual documentation of spacing and radius tokens.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 4   | `Cookbook`         | Worked examples composing multiple components (forms, dashboards, dialogs).                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 5   | `Icons`            | Catalogue of pictogram glyphs used in components (status, navigation, action).                                                                                                                                                                                                                                                                                                                                                                                                              |
| 6   | `Components`       | One `COMPONENT_SET` per master, grouped into category Sections that mirror the Storybook sidebar (`Inputs`, `Display`, `Navigation`, `Overlay`, `Feedback`, `AI` — six as of the `AtlChat` addition). The count moves as components ship; read it from `tools/figma/snapshot.json` (`components.length`, 43 masters as of the last snapshot, including sub-components like `AtlTab` and `AtlMenuItem` that are not top-level Storybook entries) rather than from a number transcribed here. |

> **Note:** When a single category grows past ~15 components, promote it to its own page (e.g. split `Inputs` off first). The current single-page-with-category-Sections layout preserves "all components at a glance" while matching Storybook structure 1:1.

### Components — Category Layout

Category Sections are stacked top-to-bottom in the same order as `storySort.order` in `libs/{angular,react,vue}/.storybook/preview.{ts,tsx}`. Each has a subtle tinted background and a heading in the `ty/headline` text style (Instrument Sans SemiBold — see Text Styles below; the previous `Inter Semi Bold 64` description predates ADR-0035/ADR-0059). Per-component Sections are nested unchanged inside, preserving every `COMPONENT_SET` nodeId (so existing Storybook `addon-designs` links keep resolving).

Members are generated, not transcribed here: the live category → component mapping is
`COMPONENT_CATEGORIES` in `docs/src/data/components.ts`, and the live per-category
Storybook order is every story's `title: 'Components/<Category>/<Name>'` prefix under
`libs/react/src/lib/**/*.stories.tsx`. As of this pass the six categories are `Inputs`,
`Display`, `Navigation`, `Overlay`, `Feedback`, `AI` — verified against those
`title:` prefixes, e.g. `Inputs` currently covers `AtlButton`, `AtlInput`,
`AtlTextarea`, `AtlSelect`, `AtlCombobox`, `AtlCheckbox`, `AtlRadio`,
`AtlRadioGroup`, `AtlToggle`, and `AI` covers `AtlChat` alone.

**Resolved 2026-09-09 (ADR-0118).** This passage previously recorded an unresolved split:
`docs/src/data/components.ts` filed `AtlAccordionGroup` and `AtlAlert` under `Layout`
while Storybook and the Figma masters both said `Feedback`. Two agreeing sources outrank
one, so `components.ts` follows — and `check:category-alignment` now holds it, comparing
each component's category against both its Figma master name and its story title.

**Resolved 2026-09-10 (ADR-0120).** A different split in the same place — recorded here as
still open as of the previous pass — was the mirror image of the case above: the Figma
masters filed `AtlButton` under its own `Action` Section and the other seven Inputs
controls under `Form`, while `components.ts` and Storybook both said one flat `Inputs`,
with Figma as the outlier. Unlike the Feedback/Layout case, the owner did not apply
ADR-0118's tie-break here — moving the _code_ side (splitting eight Storybook story
titles) would have changed story IDs and broken saved links, `docs-show-story` calls and
`figmaNode()` references, while merging Figma's two Sections renames and reparents frames
without touching any `COMPONENT_SET` node id. So Figma was brought to match code instead:
`Action` and `Form` are now one Section, `Inputs`, in the same position the `storySort`
order puts it (first). All nine masters (`AtlButton` plus the eight `Form` controls,
`AtlRadio` included for consistency) were renamed from their old `Action/` / `Form/`
prefix to `Inputs/` — node ids unchanged, verified against `tools/figma/snapshot.json`
before and after. The eight `gap` exemptions in `CATEGORY_ALIGNMENT_EXEMPT` are deleted;
`check:category-alignment` passes with none in use. See ADR-0120 for the general rule
this collision resolved (which side moves when Figma-as-structural-source-of-truth and
ADR-0118's tie-break disagree).

---

## Variable Collections

The file uses a three-tier token architecture (primitives → semantic → component) plus motion and effects.

> **Stale as of ADR-0030 (2026-08-26 note).** The table below was captured before the Library Tokens
> decision: the semantic tier components bind to is now **`Library Tokens`** (code-generated from
> `styles/tokens.css`), and the collection listed here as `UI Tokens` was renamed **`Docs Brand Tokens`**.
> The IDs, mode IDs and counts below are therefore unverified — they need a refresh against the live file
> (Figma Desktop + the figma-console Desktop Bridge), which the committed snapshot cannot supply because
> `tools/figma/snapshot.json` records no collection data. Treat `check-figma.js` and
> `figma-snapshot.mjs` as authoritative on which collections count as semantic until then.
> See the whole-document note above for what else here is stale, and ADR-0115 for the
> token-_value_ ownership map this table doesn't cover — it records the Figma-side
> collection layout, not which file owns a token's value.

| Collection         | ID                            | Modes                        | Variables | Purpose                                                                                             |
| ------------------ | ----------------------------- | ---------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `UI Tokens`        | `VariableCollectionId:3:120`  | Light (`3:0`) · Dark (`3:1`) | 66        | Semantic tokens consumed by components (color/spacing/radius/typography).                           |
| `Primitive Tokens` | `VariableCollectionId:73:405` | Default (`73:2`)             | 39        | Low-level raw values (teal/500, slate/100, neutral/0 …) referenced by semantic tokens.              |
| `Component Tokens` | `VariableCollectionId:73:445` | Default (`73:3`)             | 15        | Component-scoped aliases (`button/bg-primary`, `input/border-focus` …) for per-component overrides. |
| `Motion Tokens`    | `VariableCollectionId:73:399` | Default (`73:0`)             | 4         | Durations and easing.                                                                               |
| `Effects Tokens`   | `VariableCollectionId:73:402` | Default (`73:1`)             | 2         | Shadow variants.                                                                                    |
| **Total**          |                               |                              | **126**   |                                                                                                     |

### Text Styles

ADR-0059 replaced Figma's text styles with exactly one per `--ui-type-*` composite
role in the canonical `tokens.css`, named `ty/<role>` — role name to role name, not a
separate Figma-side taxonomy, and each style's family/weight/size/leading is generated
to match its role (gated by `check:figma`'s `[TEXT-STYLE]`, ADR-0059). The role list has
grown twice since (ADR-0074 added `control`/`action`; ADR-0085 added `row`/`row-sm`), so
treat any specific count as of-the-last-check rather than transcribe it here — read the
current list from `--ui-type-*` in
`libs/create-workspace/src/generators/preset/files/styles/tokens.css`. What stays true
regardless of how many roles exist is the architecture (ADR-0035):

| Font stack                             | Roles that use it                                                                               | Notes                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--ui-font-display` (Instrument Serif) | `display` only                                                                                  | The single largest line on a surface — wordmark, hero, section opener. Never bolded (Instrument Serif ships one weight). |
| `--ui-font-family` (Instrument Sans)   | Every other role — `headline`, `title`, `body-*`, `label`, `control`, `action`, `row`, `row-sm` | Everything interactive and everything read at body length. Weight varies by role; the face does not.                     |
| `--ui-font-mono` (JetBrains Mono)      | `code` only                                                                                     | Code blocks, inline code, tokens.                                                                                        |

The `Inter` family previously named in this table predates ADR-0035 (Instrument
pair) and ADR-0059 (the sweep that applied it to every Figma text node); no current
text style uses it.

### Color Tokens — UI Tokens (selected)

| Figma Variable               | CSS Token                         | Light       | Dark        |
| ---------------------------- | --------------------------------- | ----------- | ----------- |
| `color/primary`              | `--ui-color-primary`              | `#2563eb`   | `#3b82f6`   |
| `color/primary-hover`        | `--ui-color-primary-hover`        | `#1d4ed8`   | `#60a5fa`   |
| `color/primary-active`       | `--ui-color-primary-active`       | `#1e40af`   | `#93c5fd`   |
| `color/primary-light`        | `--ui-color-primary-light`        | `#2563eb14` | `#3b82f626` |
| `color/secondary`            | `--ui-color-secondary`            | `#64748b`   | `#94a3b8`   |
| `color/danger`               | `--ui-color-danger`               | `#ef4444`   | `#f87171`   |
| `color/success`              | `--ui-color-success`              | `#22c55e`   | `#4ade80`   |
| `color/warning`              | `--ui-color-warning`              | `#f59e0b`   | `#fbbf24`   |
| `color/info`                 | `--ui-color-info`                 | `#06b6d4`   | `#22d3ee`   |
| `color/surface`              | `--ui-color-surface`              | `#ffffff`   | `#1e1e2e`   |
| `color/border`               | `--ui-color-border`               | `#e5e7eb`   | `#2e2e3e`   |
| `color/text`                 | `--ui-color-text`                 | `#0f172a`   | `#f1f5f9`   |
| `color/text-muted`           | `--ui-color-text-muted`           | `#64748b`   | `#94a3b8`   |
| `color/input-bg`             | `--ui-color-input-bg`             | `#f5f5f5`   | `#18181f`   |
| `color/input-border-focus`   | `--ui-color-input-border-focus`   | `#2563eb`   | `#3b82f6`   |
| `color/input-border-invalid` | `--ui-color-input-border-invalid` | `#ef4444`   | `#f87171`   |

### Spacing (FLOAT, px)

| Figma Variable | CSS Token         | Value |
| -------------- | ----------------- | ----- |
| `spacing/1`    | `--ui-spacing-1`  | 4     |
| `spacing/2`    | `--ui-spacing-2`  | 8     |
| `spacing/3`    | `--ui-spacing-3`  | 12    |
| `spacing/4`    | `--ui-spacing-4`  | 16    |
| `spacing/5`    | `--ui-spacing-5`  | 20    |
| `spacing/6`    | `--ui-spacing-6`  | 24    |
| `spacing/8`    | `--ui-spacing-8`  | 32    |
| `spacing/10`   | `--ui-spacing-10` | 40    |
| `spacing/12`   | `--ui-spacing-12` | 48    |
| `spacing/16`   | `--ui-spacing-16` | 64    |

### Radius

| Figma Variable | CSS Token          | Value |
| -------------- | ------------------ | ----- |
| `radius/sm`    | `--ui-radius-sm`   | 6     |
| `radius/md`    | `--ui-radius-md`   | 8     |
| `radius/lg`    | `--ui-radius-lg`   | 12    |
| `radius/xl`    | `--ui-radius-xl`   | 16    |
| `radius/full`  | `--ui-radius-full` | 9999  |

### Typography (FLOAT)

| Figma Variable         | CSS Token                   | Value |
| ---------------------- | --------------------------- | ----- |
| `font-size/xs`         | `--ui-font-size-xs`         | 12    |
| `font-size/sm`         | `--ui-font-size-sm`         | 14    |
| `font-size/md`         | `--ui-font-size-md`         | 16    |
| `font-size/lg`         | `--ui-font-size-lg`         | 18    |
| `font-size/xl`         | `--ui-font-size-xl`         | 20    |
| `font-size/2xl`        | `--ui-font-size-2xl`        | 24    |
| `font-weight/normal`   | `--ui-font-weight-normal`   | 400   |
| `font-weight/medium`   | `--ui-font-weight-medium`   | 500   |
| `font-weight/semibold` | `--ui-font-weight-semibold` | 600   |
| `line-height/tight`    | `--ui-line-height-tight`    | 1.25  |
| `line-height/normal`   | `--ui-line-height-normal`   | 1.5   |
| `opacity/disabled`     | `--ui-opacity-disabled`     | 0.5   |

> **Note:** Shadow and motion tokens (`--ui-shadow-*`, `--ui-transition-*`, `--ui-ease-*`) are bound to `Effects Tokens` / `Motion Tokens` collections in Figma. Some CSS-only easing functions have no Figma equivalent.

---

## Components — COMPONENT_SET node IDs

Node IDs point to the actual `COMPONENT_SET` nodes (the parent of all variants), used
with `figma_get_component`, `figma_analyze_component_set`, and
`figma_audit_component_accessibility`. **This section used to be a static table and
went stale twice** — `skills/design-to-code/SKILL.md` calls out the exact case by name:
this table listed `AtlBreadcrumbs` at `55:141`; the live master is `55:139` (the
Figma-side rebuild moved it). `AtlPagination` drifted the same way, `55:145` → `55:143`.
A third hand transcription would only go stale again.

**Current node IDs live in `tools/figma/snapshot.json`**, one entry per master:
`components[].nodeId`, keyed by `components[].selector` (e.g. `"selector": "AtlButton",
"nodeId": "129:20"`). That file is regenerated from the live Figma file and is the
freshest list this repo carries; a fresh `figma_get_component_for_development` call on
a selector's known-recent nodeId is the freshest possible if the snapshot itself is
older than the change you're chasing. Two node IDs are stable enough to use directly in
examples because they are the oldest, least-restructured masters in the file:
`AtlButton` → `129:20`, `AtlCard` → `55:65` — verify either against the snapshot before
relying on it for anything that isn't a passing example.

---

## Workflow

### Design Token Change

Token _values_ are owned in code, not in Figma (ADR-0115). The canonical file is
`libs/create-workspace/src/generators/preset/files/styles/tokens.css`; every other
`tokens.css`-shaped file in the repo is a generated projection of it.

1. Edit the value in the canonical file above.
2. `npm run sync:tokens` — regenerates `libs/{angular,react,vue}/src/styles/tokens.css`
   and `skills/atelier-design/assets/colors_and_type.css` from it in one step, all three
   frameworks together. `docs/src/styles/tokens.css` needs no step of its own — it
   `@import`s the React copy live.
3. `npm run check:tokens` to confirm the copies match (also runs inside `check:all`).
4. If the value feeds an artboard palette: `node tools/scripts/gen-artboard-palette.mjs`
   regenerates `tools/design/artboard-palette.css` (`npm run check:artboard-palette`
   verifies it matches), then hand the new block to `artboard-bridge` Publish (step P2)
   for any live Claude Design sheet.
5. Optional, one-way, and **not** gated by `check:all`: `npm run figma:sync-tokens` pushes
   the new value into Figma's `Library Tokens` Variable collection (ADR-0030), so the
   visual reference in Figma matches. Requires Figma Desktop with the Bridge plugin open.
   Nothing pulls a Figma-side edit back into code — editing the Variable directly in
   Figma is drift, not a valid entry point.
6. Screenshot key Storybook stories to confirm no visual regression.

### New Component

1. Create a new Section nested inside the matching category Section (`Inputs` / `Display` / `Navigation` / `Overlay` / `Feedback`) on the `Components` page. The category must match the Storybook `title:` prefix (`Components/<Category>/<Name>`).
2. Build a `COMPONENT_SET` with variant properties that match the code spec (`libs/spec/src/index.ts`).
3. Apply text styles (`text/*`) and variables — never raw hex/px.
4. Write a component description (variants · sizes · states · a11y). It becomes the Assets-panel tooltip and the Dev Mode spec.
5. **Run the [Figma component pre-release checklist](./figma-component-checklist.md)** before merging the matching PR. The PR template reproduces it as a required section.
6. Run generator: `nx generate @atelier-ui/generators:atl-component --name=<name>` (scaffolds Angular + React + Vue together by default; `--framework=` to target one).
7. Implement all three frameworks, referencing Figma values.
8. Verify parity with Storybook screenshot.

### Changing a Component's Visual Design

1. Update the Figma variant first.
2. Screenshot and confirm it looks right.
3. Update `.css` file in Angular lib (`:host` selector).
4. Mirror to React and Vue libs (`.atl-<name>` class selector — both frameworks use the same class-based convention, see `plan/big-picture.md`'s Framework Differences table).
5. Final parity check.

### Accessibility hygiene

- Any color-coded variant (success/warning/danger/info) **must** include a non-color differentiator: an icon, label prefix, pattern, or border. This is WCAG 1.4.1. `AtlBadge` renders an `AtlIcon` instance per variant (`libs/react/src/lib/badge/atl-badge.tsx`) — the earlier glyph-text-layer / CSS `::before` technique this line described was replaced by real Icon-component instances, on both the Figma side (ADR-0057) and the code side.
- Run `figma_audit_component_accessibility` after each component change; target ≥ 85 overall.

---

## Token → CSS Mapping Quick Reference

```css
/* Figma: color/primary (Light) = #2563eb */
background-color: var(--ui-color-primary);

/* Figma: spacing/4 = 16 */
padding: var(--ui-spacing-4);

/* Figma: radius/md = 8 */
border-radius: var(--ui-radius-md);

/* Figma text style: ty/label → Instrument Sans Medium 12 (ADR-0059/ADR-0035) */
font: var(--ui-type-label);
```

---

## Known Issues / Backlog

Re-measured 2026-08-27 against the file, after the Phase 3 transfer (ADR-0059..0064).
Everything below is a count taken from the file, not an estimate.

### Closed since the last pass

- ~~**Decorative icon glyphs left unstyled** (~50 pictogram text nodes)~~ — ADR-0057
  replaced them with instances of the generated `Icon/*` masters, and `[MASTER-GLYPH]`
  reads zero across all 39 masters. 20 pictograms remain, all inside the
  `Icons (superseded — glyph era)` frame kept for reference; deleting that frame is a
  separate item in `tasks/todo.md`.
- ~~**Auto-layout**: 8 top-level display wrappers lack auto-layout~~ — zero masters now
  have a multi-child variant root without auto-layout.
- ~~**No Cover / Icons page**~~ — both pages exist. So do Cookbook and
  Workshop-Templates.

### Open, with today's numbers

- **Five pictograms sit in illustration frames BESIDE a master, where
  `[MASTER-GLYPH]` cannot see them**: `✓` next to AtlSelect (an open-dropdown
  illustration) and `✓ ℹ ✕` next to AtlToast. The probe walks COMPONENT and
  COMPONENT_SET nodes, so a plain frame on the Components page is invisible to it —
  the same hole that let the four content samples keep `‹ Prev` for months. Widen the
  probe to every frame on the page.
- **AtlChat's `–` minimise control** is drawn inside `variant=popup` and marked with a
  stated exemption, because the decision is genuinely open: `AtlChatSpec` exposes
  `open` and `onOpenChange` and nothing else, there is no minimise prop, no
  `is-minimised` class and no CSS for one. Either AtlChat gains the state or the master
  loses the button.
- **Root typography is ungated, and it hid two real errors.** 100 master-variant roots
  carry their own single text child; `[LAYER-PAINT]` compares `font-size` and
  `line-height` for NAMED layers only, and the root belongs to `[ROOT-PAINT]`, which has
  no typography. Found by hand: AtlAvatar's `xs` initials were 9px against
  `--ui-font-size-2xs` (10px) and its `xl` were 16px against `--ui-font-size-lg` (18px) —
  both fixed. Still open: most of those 100 roots leave the leading on **AUTO** while
  every component's CSS states a `line-height`, which is ADR-0048's rule unapplied on
  the Figma side. Gating it needs the `ROOT_PAINT` cascades extended with the `size` and
  `shape` axes, since that is where `font-size` is declared.
- **536 text nodes below 12px**, and the split matters: 378 on Inventory (card meta at
  11px), 156 on Colors (swatch labels 11px, hex values 9px), 2 in Components — and those
  2 were the AtlAvatar bug above. So this is documentation scaffolding, not component
  text. `--ui-font-size-2xs` (10px) exists since ADR-0054; decide whether the catalogue
  pages adopt it or stay off-scale by intent.
- **13 empty `card-section-2` frames** (the earlier note said 12). Rename to
  `card-slot-content` or remove.
- **Section-level caption text** (e.g. "variant: primary | secondary | outline · size:
  sm | md | lg") is documentation scaffolding that lives inside the Components sections.
  Convert to a caption style or move into the master description.
- **WCAG 1.4.1 lint false-positive** on AtlBadge / AtlAlert / AtlToast: the page-level
  `wcag-color-only` rule compares raw variant background fills and does not walk child
  nodes, so it flags variants that already have visible glyph text layers. The
  per-component `figma_audit_component_accessibility` scored 93–100 on
  colorDifferentiation for all three. Accept the noise or raise upstream. (Not
  re-measured today — the lint has not been re-run since the rebuild.)
