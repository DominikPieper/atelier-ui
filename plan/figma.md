# Figma as Visual Source of Truth

**File:** Atelier UI
**File Key:** `QMnDD8uZQPldPrlCwZZ58T`
**URL:** https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier%20UI

---

## File Structure

### Pages

| # | Page | Purpose |
|---|------|---------|
| 1 | `Colors` | Visual documentation of the color scale (Light/Dark). |
| 2 | `Typography` | Visual documentation of the typography scale + text styles. |
| 3 | `Spacing & Radius` | Visual documentation of spacing and radius tokens. |
| 4 | `Cookbook` | Worked examples composing multiple components (forms, dashboards, dialogs). |
| 5 | `Icons` | Catalogue of pictogram glyphs used in components (status, navigation, action). |
| 6 | `Components` | All 27 component sets organized one per Section. |

> **Note:** When the library grows past ~30 components or a 2nd domain emerges, split the `Components` page into category-scoped pages (e.g. `Forms`, `Feedback`, `Navigation`, `Overlays`, `Data Display`).

---

## Variable Collections

The file uses 5 local collections — a three-tier token architecture (primitives → semantic → component) plus motion and effects.

| Collection | ID | Modes | Variables | Purpose |
|---|---|---|---|---|
| `UI Tokens` | `VariableCollectionId:3:120` | Light (`3:0`) · Dark (`3:1`) | 66 | Semantic tokens consumed by components (color/spacing/radius/typography). |
| `Primitive Tokens` | `VariableCollectionId:73:405` | Default (`73:2`) | 39 | Low-level raw values (teal/500, slate/100, neutral/0 …) referenced by semantic tokens. |
| `Component Tokens` | `VariableCollectionId:73:445` | Default (`73:3`) | 15 | Component-scoped aliases (`button/bg-primary`, `input/border-focus` …) for per-component overrides. |
| `Motion Tokens` | `VariableCollectionId:73:399` | Default (`73:0`) | 4 | Durations and easing. |
| `Effects Tokens` | `VariableCollectionId:73:402` | Default (`73:1`) | 2 | Shadow variants. |
| **Total** | | | **126** | |

### Text Styles

Text styles bind to `font-size/*` variables and lock concrete `Inter` weights so component text uses consistent typography tokens.

| Style | Font | Size (bound to) | Usage |
|---|---|---|---|
| `text/heading-lg` | Inter Semi Bold | `font-size/2xl` (24) | Page/section headings |
| `text/heading-md` | Inter Semi Bold | `font-size/xl` (20) | Card titles, dialog headers |
| `text/heading-sm` | Inter Semi Bold | `font-size/lg` (18) | Sub-section headings |
| `text/body-md` | Inter Regular | `font-size/md` (16) | Prose |
| `text/body-sm` | Inter Regular | `font-size/sm` (14) | Input text, table cells, card body |
| `text/label-lg` | Inter Medium | `font-size/md` (16) | Button (lg) |
| `text/label-md` | Inter Medium | `font-size/sm` (14) | Button (md), Badge (md) |
| `text/label-sm` | Inter Medium | `font-size/xs` (12) | Button (sm), Badge (sm) |
| `text/code-sm` | JetBrains Mono Regular | `font-size/sm` (14) | Code blocks, inline code |

### Color Tokens — UI Tokens (selected)

| Figma Variable | CSS Token | Light | Dark |
|---|---|---|---|
| `color/primary` | `--ui-color-primary` | `#2563eb` | `#3b82f6` |
| `color/primary-hover` | `--ui-color-primary-hover` | `#1d4ed8` | `#60a5fa` |
| `color/primary-active` | `--ui-color-primary-active` | `#1e40af` | `#93c5fd` |
| `color/primary-light` | `--ui-color-primary-light` | `#2563eb14` | `#3b82f626` |
| `color/secondary` | `--ui-color-secondary` | `#64748b` | `#94a3b8` |
| `color/danger` | `--ui-color-danger` | `#ef4444` | `#f87171` |
| `color/success` | `--ui-color-success` | `#22c55e` | `#4ade80` |
| `color/warning` | `--ui-color-warning` | `#f59e0b` | `#fbbf24` |
| `color/info` | `--ui-color-info` | `#06b6d4` | `#22d3ee` |
| `color/surface` | `--ui-color-surface` | `#ffffff` | `#1e1e2e` |
| `color/border` | `--ui-color-border` | `#e5e7eb` | `#2e2e3e` |
| `color/text` | `--ui-color-text` | `#0f172a` | `#f1f5f9` |
| `color/text-muted` | `--ui-color-text-muted` | `#64748b` | `#94a3b8` |
| `color/input-bg` | `--ui-color-input-bg` | `#f5f5f5` | `#18181f` |
| `color/input-border-focus` | `--ui-color-input-border-focus` | `#2563eb` | `#3b82f6` |
| `color/input-border-invalid` | `--ui-color-input-border-invalid` | `#ef4444` | `#f87171` |

### Spacing (FLOAT, px)

| Figma Variable | CSS Token | Value |
|---|---|---|
| `spacing/1` | `--ui-spacing-1` | 4 |
| `spacing/2` | `--ui-spacing-2` | 8 |
| `spacing/3` | `--ui-spacing-3` | 12 |
| `spacing/4` | `--ui-spacing-4` | 16 |
| `spacing/5` | `--ui-spacing-5` | 20 |
| `spacing/6` | `--ui-spacing-6` | 24 |
| `spacing/8` | `--ui-spacing-8` | 32 |
| `spacing/10` | `--ui-spacing-10` | 40 |
| `spacing/12` | `--ui-spacing-12` | 48 |
| `spacing/16` | `--ui-spacing-16` | 64 |

### Radius

| Figma Variable | CSS Token | Value |
|---|---|---|
| `radius/sm` | `--ui-radius-sm` | 6 |
| `radius/md` | `--ui-radius-md` | 8 |
| `radius/lg` | `--ui-radius-lg` | 12 |
| `radius/xl` | `--ui-radius-xl` | 16 |
| `radius/full` | `--ui-radius-full` | 9999 |

### Typography (FLOAT)

| Figma Variable | CSS Token | Value |
|---|---|---|
| `font-size/xs` | `--ui-font-size-xs` | 12 |
| `font-size/sm` | `--ui-font-size-sm` | 14 |
| `font-size/md` | `--ui-font-size-md` | 16 |
| `font-size/lg` | `--ui-font-size-lg` | 18 |
| `font-size/xl` | `--ui-font-size-xl` | 20 |
| `font-size/2xl` | `--ui-font-size-2xl` | 24 |
| `font-weight/normal` | `--ui-font-weight-normal` | 400 |
| `font-weight/medium` | `--ui-font-weight-medium` | 500 |
| `font-weight/semibold` | `--ui-font-weight-semibold` | 600 |
| `line-height/tight` | `--ui-line-height-tight` | 1.25 |
| `line-height/normal` | `--ui-line-height-normal` | 1.5 |
| `opacity/disabled` | `--ui-opacity-disabled` | 0.5 |

> **Note:** Shadow and motion tokens (`--ui-shadow-*`, `--ui-transition-*`, `--ui-ease-*`) are bound to `Effects Tokens` / `Motion Tokens` collections in Figma. Some CSS-only easing functions have no Figma equivalent.

---

## Components — COMPONENT_SET node IDs

Node IDs below point to the actual `COMPONENT_SET` nodes (the parent of all variants). Use these IDs with `figma_get_component`, `figma_analyze_component_set`, and `figma_audit_component_accessibility`.

### P0 — Core

| Component | nodeId | Variants | Properties |
|---|---|---|---|
| `LlmButton` | `129:20` | 10 | variant (primary/secondary/outline) · size (sm/md/lg) · state (default/focus) |
| `LlmInput` | `129:33` | 5 | type (text/email/password) · state (default/filled/focus/invalid/disabled) |
| `LlmCard` | `55:65` | 12 | variant (elevated/outlined/flat) · padding (none/sm/md/lg) |
| `LlmBadge` | `55:22` | 10 | variant (default/success/warning/danger/info) · size (sm/md) |

### P1 — Extended

| Component | nodeId | Variants | Properties |
|---|---|---|---|
| `LlmSelect` | `55:92` | 5 | state (default/filled/open/disabled/invalid) |
| `LlmDialog` | `55:94` | 5 | size (sm/md/lg/xl/full) |
| `LlmTabGroup` | `55:123` | 4 | variant (default/pills) · selected index states |
| `LlmAccordionGroup` | `55:127` | 3 | variant (default/bordered/separated) |
| `LlmMenu` | `55:130` | 2 | variant (default/compact) |
| `LlmTooltip` | `55:52` | 4 | position (above/below/left/right) |

### P2 — Full Library

| Component | nodeId | Variants | Properties |
|---|---|---|---|
| `LlmAlert` | `55:31` | 8 | variant × dismissible |
| `LlmCheckbox` | `55:36` | 5 | state (unchecked/checked/indeterminate/disabled/focus) |
| `LlmToggle` | `55:41` | 5 | state (off/on/disabled-off/disabled-on/focus) |
| `LlmTextarea` | `55:87` | 5 | state (default/filled/focus/invalid/disabled) |
| `LlmRadioGroup` | `55:137` | 4 | selection states |
| `LlmRadio` | `420:185` | 5 | state (unchecked/checked/disabled/invalid/focus) |
| `LlmSkeleton` | `55:102` | 3 | variant (text/circular/rectangular) |
| `LlmProgress` | `420:153` | 12 | variant × size + `indeterminate` boolean component property |
| `LlmAvatar` | `55:151` | 10 | size × shape × status |
| `LlmToast` | `55:47` | 5 | variant |
| `LlmBreadcrumbs` | `55:141` | 3 | path-length variants |
| `LlmPagination` | `55:145` | 3 | page position (first/middle/last) |
| `LlmDrawer` | `421:398` | 4 | position (right/left/bottom) |
| `LlmTable` | `421:1183` | 10 | variant (default/striped/bordered) × size × state |
| `LlmCodeBlock` | `420:286` | 4 | variants + copy/line-number flags |
| `LlmCombobox` | `421:339` | 6 | state (default/open/filled/invalid/disabled) |
| `LlmStepper` | `421:505` | 5 | orientation + step states (active/completed/error/optional/disabled) |

---

## Workflow

### Design Token Change
1. Update value in Figma: `figma_update_variable` with the variable ID.
2. Copy the new value to `libs/angular/src/styles/tokens.css`.
3. Mirror to `libs/react/src/styles/tokens.css`.
4. Screenshot key Storybook stories to confirm no visual regression.

### New Component
1. Create a new Section on the `Components` page.
2. Build a `COMPONENT_SET` with variant properties that match the code spec (`libs/spec/src/index.ts`).
3. Apply text styles (`text/*`) and variables — never raw hex/px.
4. Write a component description (variants · sizes · states · a11y). It becomes the Assets-panel tooltip and the Dev Mode spec.
5. Run generator: `nx generate @atelier-ui/generators:llm-component --name=<name>`.
6. Implement Angular + React simultaneously, referencing Figma values.
7. Verify parity with Storybook screenshot.

### Changing a Component's Visual Design
1. Update the Figma variant first.
2. Screenshot and confirm it looks right.
3. Update `.css` file in Angular lib (`:host` selector).
4. Mirror to React lib (`.llm-<name>` selector).
5. Final parity check.

### Accessibility hygiene
- Any color-coded variant (success/warning/danger/info) **must** include a non-color differentiator: an icon, label prefix, pattern, or border. This is WCAG 1.4.1. `LlmBadge` uses glyph text layers (`✓ ⚠ ✕ ℹ`) matching the CSS `::before` in both frameworks.
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

/* Figma text style: text/label-md → Inter Medium 14 */
font: var(--ui-font-weight-medium) var(--ui-font-size-sm) / 1 'Inter', sans-serif;
```

---

## Known Issues / Backlog

Captured from `figma_audit_design_system` + `figma_lint_design` runs; not yet addressed.

- **WCAG 1.4.1 lint false-positive** on `LlmBadge` / `LlmAlert` / `LlmToast`: the page-level `wcag-color-only` rule compares raw variant background fills and does not walk child nodes, so it keeps flagging variants that already have visible glyph text layers. The per-component `figma_audit_component_accessibility` scores 93–100 on colorDifferentiation for all three — real accessibility is in place. Accept the lint noise or raise upstream.
- **LlmTable state property**: values mix orthogonal features (sortable/selectable/sticky overlap). Split into boolean properties + `state` variant for `default | empty | focus`.
- **Decorative icon glyphs left unstyled**: ~50 pictogram text nodes (`▲ ▼ ✓ ✕ ⎘ ⎗ ⊕ ✏ →`) are intentionally not bound to a text style. Lint flags them under `no-text-style`; they should either be converted to vector icons or given a dedicated `text/icon-sm` style.
- **Sub-12px text in icon roles**: 18 remaining `wcag-text-size` findings are chevrons/arrows at 10–11 px and 9 px avatar initials. Visually intentional; consider nudging to 12 px or converting chevrons to vector glyphs.
- **Section-level caption text** (e.g. "variant: primary | …", "size: md") is documentation scaffolding not part of any component — convert to small captions or move into the component description.
- **Card empty slots**: 12 empty `card-section-2` frames. Rename to `card-slot-content` or remove.
- **Auto-layout**: 8 top-level display wrappers lack auto-layout (WCAG 1.4.10 reflow).
- **No Cover / Icons page**: add when the file grows.
