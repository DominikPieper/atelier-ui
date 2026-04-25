# Token architecture

The shape of the Variables system inside a Figma file is the single biggest predictor of whether the rest of the system holds up. Get this wrong and every Component built on top inherits the mess.

## The three-tier model

Use three Collections, one per tier. The tiers are named here as they typically appear; exact naming should match the codebase if the team has a convention there.

### Primitive (a.k.a. Global, Reference)

What it is: every raw value that exists in the design language. Color ramps, the spacing scale, the radius scale, the shadow values, the type scale.

What it is **not**: anything semantic. Nothing in this collection should reference what it's *for*.

| Looks like                        | Don't do                              |
|-----------------------------------|---------------------------------------|
| `color/blue/500` = `#2563EB`      | `color/primary/default`               |
| `space/4` = `16`                  | `space/card-padding`                  |
| `radius/md` = `8`                 | `radius/button`                       |
| `font-size/300` = `16`            | `font-size/body`                      |

Modes: usually **none**. Primitives are the same regardless of theme — that's why they're primitives.

Scope: each variable narrowly scoped to its data type's natural pickers (e.g. color primitives → `FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`, `STROKE_COLOR`).

### Semantic (a.k.a. Tokens, Aliases)

What it is: every choice the design language has made about *where* a primitive applies. These variables almost never hold raw values — they alias Primitives.

| Looks like                                            | What it aliases (Light / Dark)              |
|-------------------------------------------------------|---------------------------------------------|
| `color/text/primary` → `color/neutral/900`            | Light / `color/neutral/100` Dark            |
| `color/surface/raised` → `color/neutral/0`            | Light / `color/neutral/800` Dark            |
| `color/border/subtle` → `color/neutral/200`           | Light / `color/neutral/700` Dark            |
| `space/inline/md` → `space/4`                         | (no mode change)                            |

Modes: **this is where Light/Dark/Brand modes live.** The Primitive collection stays single-mode; the Semantic collection swaps which Primitive each token resolves to per mode.

Scope: tighter than Primitives. `color/text/*` should scope to `TEXT_FILL` only. `color/border/*` to `STROKE_COLOR`. `color/surface/*` to `FRAME_FILL` and `SHAPE_FILL`. This is what makes pickers usable.

### Component (optional)

What it is: tokens specific to a single component, e.g. `button/primary/background-default`, `card/padding-x`. They alias Semantics.

When to use: only when a component has multiple state-driven values that are easier to maintain centrally than as repeated overrides. Most teams don't need this layer in Figma at all and keep it on the code side. **If unsure, skip it** — added layers cost discoverability.

Modes: rarely. State (hover, active) is usually a Variant property, not a mode.

## Modes — when to use one

A Mode is appropriate when **the same semantic token resolves to a different value in a different context**. The classic uses:

- **Light / Dark** — the canonical case
- **Brand A / Brand B** — multi-tenant systems
- **Density: Comfortable / Compact** — sometimes
- **Locale: en / de / ja** — only for string variables, when text length needs different sizes

A Mode is **not** appropriate for:

- States (hover, active, focused) — those are Variant properties on the component
- Different sizes of the same component — those are Variant properties (`Size: sm/md/lg`)
- Sub-brands that are actually different design languages — that's a separate Library, not a mode

Adding a Mode duplicates every value in the collection for that mode, so adding modes carelessly creates maintenance debt fast. Add modes only at the Semantic tier — Primitive modes mean someone misunderstood the model.

## Variable Scopes — the silent killer

Default scope is `ALL_SCOPES`. That means a `color/text/primary` variable shows up in the picker for fills, borders, and every other color-accepting property. The picker becomes a wall of irrelevant suggestions and designers stop using Variables.

Set scopes deliberately for every Variable. Scopes are set via `figma_execute` calling `variable.scopes = [...]` on the Plugin API.

| Variable purpose                    | Scopes                                             |
|-------------------------------------|----------------------------------------------------|
| Background / surface color          | `FRAME_FILL`, `SHAPE_FILL`                         |
| Text color                          | `TEXT_FILL`                                        |
| Border color                        | `STROKE_COLOR`                                     |
| Icon color (if separate from text)  | `SHAPE_FILL` (or a custom Effect Style on icons)   |
| Spacing inside a layout             | `GAP`                                              |
| Padding                             | `GAP` (Auto Layout uses `GAP` for padding too)     |
| Width / height fixed                | `WIDTH_HEIGHT`                                     |
| Border radius                       | `CORNER_RADIUS`                                    |
| Stroke width                        | `STROKE_FLOAT`                                     |
| Opacity                             | `OPACITY`                                          |
| Font size                           | `FONT_SIZE`                                        |
| Font weight (numeric)               | `FONT_WEIGHT`                                      |
| Line height                         | `LINE_HEIGHT`                                      |
| Letter spacing                      | `LETTER_SPACING`                                   |
| Font family (string)                | `FONT_FAMILY`                                      |
| Font style (string)                 | `FONT_STYLE`                                       |
| Visibility toggle (boolean)         | (booleans don't need scopes — they go on the layer)|

Audit signal: a Primitive that's only ever consumed via a Semantic alias should still be scoped — because the alias inherits the Primitive's scope intersected with its own. A wide-scoped Primitive widens the alias unintentionally.

## Naming

The naming convention should match the codebase as closely as possible. Variable paths use `/` as the segment separator (Figma renders it as a folder hierarchy in the picker).

**Recommended structure:**

```
{category}/{purpose}/{variant}/{state?}
```

Examples:
- `color/text/primary` → `color.text.primary` in CSS-like
- `color/text/primary/disabled` → state suffix when needed
- `space/inline/md` → inline spacing, medium
- `space/stack/lg` → stack (vertical) spacing, large
- `radius/control/md` → radius applied to controls, medium

**Avoid:**

- T-shirt sizes when the codebase uses numbers (`sm/md/lg` vs. `2/4/8`) — pick one, stay consistent
- Color names at the Semantic tier (`color/blue/primary` — the whole point of Semantics is that the color name is hidden)
- Plurals (`colors/text` rather than `color/text`) — keep singular, it reads better in the picker
- Underscores in user-facing variable names (codebase compatibility) — the `_`/`.` prefix is reserved for *unpublished* component names, not variables

## Anti-patterns checklist

If you see any of these in an existing file, flag them in the audit:

- **Single mega-collection** containing primitives, semantics, and components mixed together. Verdict: split. Critical severity.
- **Primitives have modes** (e.g. `color/blue/500` has a different value in Dark mode). Verdict: the team is using primitives as semantics. The semantic layer is missing. Critical.
- **No semantic layer at all** — components reference Primitives directly. Verdict: dark mode/theming is impossible without rebuilding every component. Blocker if dark mode is on the roadmap, Warning otherwise.
- **`ALL_SCOPES` everywhere** — inferred from the picker showing color tokens for spacing pickers, etc. Verdict: scope every variable. Critical.
- **Hex values inside Semantic variables** — semantics should always alias Primitives, never hold raw values. If a semantic has a raw hex, the corresponding primitive is missing. Warning.
- **A Semantic variable that points to a different Semantic variable** that points to a Primitive — long alias chains are debugging hell. One alias hop is correct; two means a layer was misused. Warning.
- **Mode names like "Theme 1", "Theme 2"** — modes that don't carry meaning. Rename to "Light"/"Dark"/"Brand-A". Suggestion.
- **Color tokens named for what they look like** at the Semantic tier (`color/sky-blue/primary`). The Semantic name should describe purpose, not appearance. Warning.
