# Iconography

Icons are the most-multiplied asset in any design system. A workspace with 200 icons each set up wrong is harder to navigate than one with 200 components, because the asset panel shows them all and the consumer can't tell which is the canonical version. Get the architecture right early; retrofitting it later means renaming every instance.

## When this reference applies

- Setting up an icon library or icon collection from scratch.
- Auditing an existing icon set and deciding what to flag.
- Deciding whether a one-off SVG should be promoted to a Component.
- Splitting icons out of a main library into a separate Icon Library.

## Size system

Pick **one** set of size stops and use it across the whole library. The standard set:

| Stop  | Use for                                           | Stroke (outlined) | Pixel grid alignment           |
|-------|---------------------------------------------------|-------------------|--------------------------------|
| 12 px | Inline in dense UI (badges, breadcrumb separators)| 1 px              | Whole-pixel only; no half-px |
| 16 px | Standard inline (buttons, menu items, form fields)| 1.5 px            | Whole-pixel for axes, half allowed for diagonals |
| 20 px | Larger inline (tabs, prominent buttons)           | 1.5 px            | Whole-pixel preferred          |
| 24 px | Standalone (icon buttons, list items, toolbars)   | 2 px              | Whole-pixel preferred          |

`32` and `48` exist but they are usually **illustrations**, not icons — different aesthetic, different drawing rules, different naming. Keep them separate.

### One master vs optical-size variants

A single 24px master scaled down to 12px usually loses fidelity at the small end (lines blur, details collapse). Two paths:

- **One master + scale.** Pragmatic. Acceptable for outlined icons with simple geometry. Document that the master is drawn at 24 and the others are scaled.
- **Optical sizes — separate masters per stop.** Required when icons have detail that has to be redrawn at small sizes (filled icons, icons with text, icons with multiple lines close together). Costs ~3× the drawing time but reads correctly at every size.

Heuristic: if the design includes 12 px AND filled glyphs, you need optical sizes. If everything is outlined and 16 px or larger, one master is fine.

## Internal layout — the boxed model

Every icon Component is a **square frame** with a **glyph inside**. The frame defines the bounding box and the touch / hit target; the glyph is the visible shape, optically padded inside the frame.

```
┌────────────┐  ← frame (e.g. 24×24, the size stop)
│  ┌──────┐  │
│  │      │  │  ← glyph (e.g. ~20×20, leaves ~2 px optical padding)
│  │  ✓   │  │
│  │      │  │
│  └──────┘  │
└────────────┘
```

Rules:

- **Frame stays square** at the size stop. Never resize the frame to hug content.
- **Optical padding is judgment.** Some glyphs (a chevron) feel right with more breathing room; others (a filled circle) need less. Aim for visual balance, not pixel-equal margins.
- **Don't let the glyph touch the frame edge.** Looks cramped especially at 12 / 16 px.
- **Center on whole-pixel grid** at small sizes. A glyph centered at x=8.5 in a 16-px frame anti-aliases blurry on most screens.

## Style: filled, outlined, or both

Library-wide commitment, made once:

- **Outlined-only.** Cleaner, easier to maintain, works at small sizes. Default choice.
- **Filled-only.** Stronger visual weight, often used for status / brand icons. Harder to read at 12 px.
- **Both** — use a Variant Property `style: 'outlined' | 'filled'`. Doubles the draw work; only worth it when both styles are actually needed for state communication (e.g., outlined = inactive, filled = active in tab bars).

A library that has outlined icons everywhere and one filled "warning" icon is inconsistent. Make the choice intentionally.

## Color binding — never hardcode

Icon color is a Variable binding. Single-color icons:

```
fill → Variable: color/icon          (semantic, scoped to TEXT_FILL + STROKE_COLOR)
```

`color/icon` aliases to the appropriate primitive in each Mode (e.g. `primitive/slate/700` in Light, `primitive/slate/200` in Dark).

Multi-color icons (rare, usually status icons like a coloured warning triangle):

```
fill 1 → color/icon                  (the neutral part)
fill 2 → color/icon-accent           (the coloured part — typically danger / warning / success)
```

Pure brand logos / illustrations are the exception — they carry their own brand colors and are NOT bound to UI tokens. Keep them out of the standard icon set; they go in a separate `Brand` collection or page.

### Anti-pattern: variants per color

Don't make `icon/check-success`, `icon/check-warning`, `icon/check-danger`. The variant explosion is real and the consumer should change the icon color via the Variable, not by switching to a different icon Component.

## Component vs raw vector — when does an SVG earn promotion

Heuristic:

| Condition                                        | Decision                              |
|--------------------------------------------------|---------------------------------------|
| Used 1× in the whole file                        | Vector layer, not a Component         |
| Used 2× and unlikely to grow                     | Vector layer; revisit if it spreads   |
| Used ≥3× **or** likely to spread                 | **Promote to Component**              |
| Needs Variant Property (style / state / size)    | Component, regardless of usage count  |
| Shared across files / libraries                  | Component, in the canonical library   |
| Brand logo with its own color rules              | Component, but in a `Brand` collection — not the standard icon set |

The heuristic exists because **every Component shows up in the asset panel**. A library with 50 single-use icons-as-Components is unusable; designers can't find anything. Be conservative.

### Common icons that earn promotion despite single-use

- Navigation glyphs: chevron, caret, arrow (left / right / up / down). Even if they only appear in one component today, they will recur.
- System glyphs: ✕ (close), ✓ (check), – (collapse), + (expand), ⋯ (more). Always Components.
- File-type / status icons used only in one place but in a context where the consumer might want to swap — accept Component overhead for the optionality.

## Naming

`icon/<category>/<name>` is the long-term-maintainable form. Categories make the asset panel browsable when the set grows past ~30 icons.

| Category     | What lives here                                                                       |
|--------------|---------------------------------------------------------------------------------------|
| `navigation` | chevrons, arrows, carets, hamburger, close, back                                      |
| `system`     | settings, search, filter, sort, copy, edit, delete, more / overflow, pin, eye         |
| `status`     | check, error, warning, info, sync, loading-spinner                                    |
| `content`    | document, image, video, audio, code, link                                             |
| `social`     | external service logos (twitter, github, linkedin) when needed for share / login UI   |
| `brand`      | own product logo and variants — separate from `social` because they have brand colors |

### Anti-patterns

- **Flat naming** (`icon/check`, `icon/x-circle`, `icon/arrow-right`) past ~30 icons. Eventually you cluster them by category mentally; do it explicitly in the file.
- **Premature category** (one icon per category, eight categories). Wait for ~3+ icons per category before splitting; merge sparse categories under `icon/system`.
- **`icon-1`, `icon-2`, `icon-new-3`.** Numbers in icon names mean nobody knows what they mean. The name has to be reachable from "what do I want to convey".
- **Style baked into name** (`icon/check-bold`, `icon/check-light`). Prefer a Variant Property `weight: 'regular' | 'bold'` on a single Component named `icon/check`.

## Library boundaries — when to split icons out

Three signals to start a separate Icon Library:

1. **>100 icons.** The main library starts feeling icon-heavy; component browsing slows.
2. **Second consumer product.** A different app needs the same icon set independently of your component library. Splitting lets it import icons without inheriting components it doesn't use.
3. **Different release cadence.** Icon set updates monthly; component library is on a quarterly release. Bundling them couples the cadence — split.

Until then, keep icons in the main library on a dedicated `Icons` page. See `naming-and-file-structure.md` for the page-layout convention (`Cover / Tokens / Icons / Components / Patterns`).

## Audit checklist for icons

When auditing an existing icon set, walk in this order:

1. **Size system.** How many distinct sizes exist in the file? If >4, why? Reduce.
2. **Color binding.** How many icons have hardcoded fills? Each one is a theming break. Promote to `color/icon`.
3. **Component vs vector.** How many icons are vector-only? Survey usage; promote anything ≥3-use to Component.
4. **Naming.** Random sample 10 icons — can you reach them by typing what you want? If not, the names are wrong.
5. **Library boundaries.** Are icons clogging the main library's asset panel? If yes, split.
6. **Variant explosion.** Any icon with >4 variants is suspicious. Is it really 4 distinct icons (split), or color baked in (use Variable instead)?

Tag findings with the standard severity: Blocker / Critical / Warning / Suggestion. Color-binding violations are typically Critical (they break theming silently); naming inconsistencies are Warning; size-system drift is usually Critical because it blocks any future style refactor.
