# Figma Workspace Audit — Atelier UI

Generated against: repo `6ace655` · Figma file `QMnDD8uZQPldPrlCwZZ58T` (live session 2026-07-22) · Dashboard score **83/100** (Naming 100 · Token Architecture 72 · Component Metadata 83 · Accessibility 87 · Consistency 79 · Coverage 69)

Re-verify any finding if either pin moves before acting on it.

## Priority list

| # | ID | Severity | Finding | Effort |
|---|----|----------|---------|--------|
| 1 | TA2/ES1 | **Blocker** | The component library has no themable semantic tier: Component Tokens (15) are single-mode, so the library's dark mode — which the code ships — cannot exist in Figma at all | L |
| 2 | ES1 | **Critical** | Figma token names *and values* diverge from `tokens.css`: `tx/primary #333E48` vs `--ui-color-text #0f172a`; no Figma token carries `--ui-color-primary #006470` except `Component:button/bg-primary`; dark surfaces `#333E48/#3F4B56` vs code `#0a1116` | L |
| 3 | TA1 | **Critical** | Two design systems share one semantic collection: "UI Tokens" is the docs-site brand system (area/\*, cbadge/\*, Conciso business-area tints) *and* the closest thing the library has to semantics (bg/\*, tx/\*, border/\*) — library masters bind across both plus primitives | M |
| 4 | TA4 | **Critical** | 128 of 143 variables are `ALL_SCOPES` (only Component Tokens are scoped) — color tokens pollute number pickers and vice versa | M |
| 5 | TA3 | **Critical** | All 39 UI-Tokens colors hold raw literals, zero alias Primitives (their own descriptions call this out); Component Tokens by contrast alias 15/15 correctly | M |
| 6 | TA5/ES1 | **Warning** | No typography tokens at all — no Text Styles (0 styles in file), no font/\* variables — while the code has `--ui-font-size/weight/line-height-*`; the Typography page is static drawings | M–L |
| 7 | CD8 | **Warning** | Residual unbound/mode-dead fills: Figma Toast drawn dark vs code light (allowlisted, open design decision); Chat AI-avatar bound directly to primitive `ki/500`; Chat app-mockup fills unbound by design | S–M |
| 8 | CD7 | **Warning** | Interactive state vocabulary is mostly standard, but `error` state exists only as `invalid` Booleans on form fields and Button uses `active` — fine per the known audit-tool false-positive list, document rather than rename | S |
| 9 | FS2 | **Suggestion** | No Cover page (name/version/last-updated); page structure otherwise exemplary (Colors, Typography, Spacing & Radius, Cookbook, Icons, Components, Inventory, Workshop-Templates) | S |
| 10 | ES4 | **Suggestion** | Component descriptions are excellent (28/29 with spec mapping + use-when) but only surfaced in Figma; the docs site duplicates this content by hand in `components.ts` | — |

## What is already good (don't touch)

- **Naming alignment code↔Figma: 100/100.** All 29 masters `Atl*`-named, variant axes/values match the spec unions exactly (`check:figma` name checks green). ES2/ES3 pass.
- **Component Tokens collection is the architectural model to copy**: 15/15 aliased to primitives, 15/15 properly scoped — exactly what the checklist demands, just too small and single-mode.
- **Descriptions** (CD6): rich use-when/don't-use/API-surface text on 28 of 29 masters, machine-cross-referenced to spec interfaces.
- **No legacy styles** — the file is fully Variables-first (TA5 pass on the migration axis).
- **Token bindings on masters**: ~2750 bindings landed 2026-07-22; `check:figma` token checks green (3 non-blocking warnings).
- **Docs-brand system** (the UI-Tokens content itself): thoughtful mode-aware values with documented contrast rationale — it's in the wrong collection scope-wise, but its quality is high.

## Findings in detail

### 1 · TA2/ES1 — Library dark mode is structurally impossible (Blocker, L)

The code ships a dark theme (`[data-theme="dark"]` in `libs/*/src/styles/tokens.css`). In Figma, the only mode-aware collection is the docs-brand "UI Tokens"; the Component Tokens the library chrome should bind to have a single `Default` mode. Masters bound to primitives or component tokens render identically in both modes; masters bound to UI Tokens flip to *docs-site* dark values (`bg/page` dark `#333E48`), which are not the library's dark values (`--ui-color-surface` dark `#0a1116`). Net: switching the file to Dark produces a mixture of no-change and wrong-change — there is no way to preview the library's real dark rendering.

**Fix (the "Token-Value-Sync" project, now precise):** create a `Library Tokens` collection with Light/Dark modes whose variables mirror `tokens.css` names 1:1 under an agreed transformation (`--ui-color-text` → `color/text`, `--ui-spacing-4` → `spacing/4`, …) and whose per-mode values are byte-equal to the code. Re-point Component Tokens to alias it; migrate master bindings from UI-Tokens/primitives onto it. Then the Toast question (finding 7) becomes answerable by switching modes.

### 2 · ES1 — Name and value drift vs tokens.css (Critical, L — same fix as 1)

Cross-source check: `--ui-color-primary: #006470` (light) / `#34d8d8` (dark) has no Figma counterpart except the single-mode `button/bg-primary`. `--ui-color-text: #0f172a` vs `tx/primary #333E48`. The library's neutrals in code are the slate family; the file's neutrals (`n/*`) are a teal-tinted family for the docs brand. Every Figma-first design decision made against these tokens silently diverges from what the code renders.

### 3 · TA1 — Two systems, one semantic collection (Critical, M)

"UI Tokens" holds docs-only tokens (`area/co-50` "Corporate lightest tint", `cbadge/aa-*` contrast-rating badges, business-area tints) next to generic semantics (`bg/*`, `tx/*`, `border/*`, `c/*`, `focus/*`). The generic-looking names invite library use — which is exactly what happened during the binding pass. **Fix:** after the Library-Tokens collection exists (finding 1), rename the docs collection to `Docs Brand Tokens` (rename = safe, aliases follow) so nothing generic-sounding sits next to library semantics. Note: `tools/scripts/figma-snapshot.mjs` captures the collection literally named "UI Tokens" and `check-figma` treats it as the semantic tier — both need the collection-name switch in the same change.

### 4 · TA4 — Scopes unset on 128 variables (Critical, M)

Only Component Tokens are scoped. One `figma_execute` pass can set scopes by name pattern: `bg/*`,`c/*-bg` → FRAME_FILL/SHAPE_FILL; `tx/*`,`badge/*-text`,`c/{success,warning,error}` → TEXT_FILL; `border/*` → STROKE_COLOR; `spacing/*` → GAP/WIDTH_HEIGHT; `radius/*` → CORNER_RADIUS; `icon-stroke/*` → STROKE_FLOAT; palettes co/ki/wo/es/ro/n → ALL_FILLS+STROKE_COLOR.

### 5 · TA3 — Semantic tier holds literals (Critical, M)

39/39 UI-Tokens colors are raw values. Several *cannot* alias (mode-dependent alias-target switches, documented in their descriptions), but most single-hue tints (`area/*-50` = palette `*-50/100` values, `focus/ring-outer` = `co/700`/`co/500`) can. Alias what is aliasable; document the rest as deliberate literals. Applies equally to the future Library Tokens collection: alias primitives where an exact step exists.

### 6 · TA5/ES1 — Typography exists only as pixels (Warning, M–L)

Zero Text Styles, zero `font/*` variables; the Typography page draws the scale statically. Code: `--ui-font-size-xs…2xl`, `--ui-font-weight-*`, `--ui-line-height-*`, `--ui-letter-spacing-*`. Minimum viable: FLOAT variables for size/line-height/weight in Library Tokens + bind the masters' text nodes; alternatively Text Styles (Variables don't cover font-family well yet — Styles remain legitimate here per checklist).

### 7 · CD8 — Residual binding gaps (Warning, S–M)

- **Toast**: drawn as a dark card (`#1e293b/#334155`), code renders light `surface-raised`. Allowlisted with rationale; resolves via finding 1 (redraw bound to `color/surface-raised` and let Dark mode produce the dark look) — or a deliberate redesign of the code toast.
- **Chat ai-avatar** bound straight to primitive `ki/500` (the one remaining non-semantic warning in `check:figma`).
- **Chat app-mockup** fills deliberately unbound (illustration) — fine, documented.

### 8 · CD7 — State vocabulary deviations (Warning, S)

Form fields model `error` as an `invalid` Boolean (matches the spec API — correct per CD2, flagged only by the audit tool's fixed vocabulary). Button has `active` in addition to the standard set. No action beyond keeping the known-false-positive notes in the checklist.

### 9 · FS2 — No cover page (Suggestion, S)

Eight well-named pages, no Cover. Add one with library name, version band (0.1.x), last-updated, and the two-system note (docs brand vs library tokens) once finding 3 lands.

### 10 · ES4 — Description content is single-sourced in Figma (Suggestion)

The excellent master descriptions overlap heavily with `docs/src/data/components.ts` prose. Long-term: one side should generate the other (the repo's drift-gate idiom fits — a `check:descriptions` comparing Figma snapshot descriptions against docs data). Not urgent; noted for the roadmap.

## Recommended execution order

1. **Library Tokens collection** (findings 1+2, the Prio-1 project): agree the name transformation, generate the collection from `tokens.css` (a `figma_execute` batch driven by the parsed CSS — `tools/scripts/sync-tokens.mjs` already parses it code-side), Light+Dark values byte-equal to code.
2. **Rebind masters** from UI-Tokens/primitives/raw → Library Tokens; re-alias Component Tokens; update `figma-snapshot.mjs`/`check-figma.js` semantic-collection name; re-snapshot; `check:figma` + visual mode-switch screenshots (Light AND Dark) per `references/code-verify.md`.
3. **Rename the docs collection** to `Docs Brand Tokens` (safe op) + set scopes everywhere (finding 4) + alias pass (finding 5).
4. **Toast decision** falls out of 2 (preview real dark rendering, then pick).
5. Typography tokens (finding 6) as a follow-up block.
6. Cover page + roadmap notes (9, 10).
