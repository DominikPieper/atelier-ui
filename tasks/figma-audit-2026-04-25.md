# Figma Workspace Audit — Atelier UI

**File:** `Atelier UI` (`QMnDD8uZQPldPrlCwZZ58T`)
**Audited:** 2026-04-25
**Generated against:** `8932074` · Figma file last-edited 2026-04-25
**Re-verified:** 2026-04-25T17:23Z — see *Re-verify* section at the bottom
**Mode availability:** Local + Bridge (REST API not used; `figma_get_styles` and `figma_check_design_parity` skipped — both require `FIGMA_ACCESS_TOKEN` which is not configured. Audit done via plugin-bridge tools only.)

> **Audit freshness:** This is a snapshot. 7 of 10 priority items are now auto-resolved or state-shifted; only `A11y-DG`, `FS2`, and `ES3` remain still-open. Use the *Re-verify* table at the end of the report as the active pin point — the priority list above retains the original audit numbering for traceability.

## Overall

> **Architectural verdict:** Solid foundation — clean tier-separated tokens, semantic Modes on the right collection, excellent component descriptions across all 27 sets. Two real architectural debts (Variable Scopes mostly defaulted, one duplicate semantic token) plus three contrast/visibility bugs introduced in the recent state-variant additions. No Blockers.

| Severity     | Count |
|--------------|-------|
| Blocker      | 0     |
| Critical     | 5     |
| Warning      | 5     |
| Suggestion   | 2     |

| Dashboard category   | Score | Notes |
|----------------------|-------|-------|
| Naming & Semantics   | 75/100| Slash naming consistent, but `color/on-primary` vs `color/text-on-primary` duplicate drags score |
| Token Architecture   | 83/100| Clean tiers + Modes; pulled down by `ALL_SCOPES` on 72 vars |
| Component Metadata   | 83/100| All 27 sets described; descriptions are substantive (200–1240 chars) |
| Accessibility        | 79/100| 9 contrast fails on danger/outline states, 7 color-only fails on danger family |
| Consistency          | 90/100| Text Styles introduced and applied — see TS resolution below |
| Coverage             | 75/100| No Icon Component Set on the Icons page |

## Priority list

| # | Severity   | Finding ID | What                                                                      | Effort | Fix                                                                                     |
|---|------------|------------|---------------------------------------------------------------------------|--------|------------------------------------------------------------------------------------------|
| 1 | Critical   | A11y-OL    | `outline md loading` spinner is white-on-white (1.0:1) — completely invisible | S      | Rebind spinner text fill to `color/primary` (currently white from clone source) |
| 2 | Critical   | N2         | `color/on-primary` AND `color/text-on-primary` both exist as COLOR vars in UI Tokens (likely legacy duplicate) | S | Inspect bindings, drop the unused one, rename the other if naming is the issue |
| 3 | Critical   | A11y-OH    | `outline md hover / active` text-on-bg ratio 2.6:1 (primary on primary-light) | S | Change hover overlay from `color/primary-light` to `color/surface-sunken`, OR switch text to `color/primary-active` for darker fg |
| 4 | Critical   | TA4        | 72 of 134 Variables (54 %) use `ALL_SCOPES` — primitives, brand colors, component tokens, motion vars | M | Set scopes per type via `figma_execute` (color → fill+stroke+effect; spacing already correct) |
| 5 | Critical   | A11y-DG    | `danger` filled buttons fail AA contrast (white on `#ef4444` = 3.8:1) — 9 variants | M | Architectural decision: darker danger value, or restrict white text to large/semibold; affects brand consistency |
| 6 | Warning    | TS         | 33 Button text nodes don't use Figma Text Styles (raw font props with bound vars) | M | Decide: introduce Text Styles bound to font-size vars, OR document that Atelier intentionally Variable-only-typography |
| 7 | Warning    | HC         | "Inputs" section fill is hardcoded `#000000` (Components page) | S | Bind to `color/text` or remove the fill |
| 8 | Warning    | CD4        | `Icons` page exists but contains zero Component Sets / Components | L | Build out an icon set (or accept the Atelier scope is "code-only icons") |
| 9 | Warning    | FS2        | No Cover page in the file | S | Add a Cover page with library name, version, owner, last-updated |
|10 | Warning    | ES3        | No Code Connect / explicit Figma↔code mapping | M | Set up Figma Code Connect for at least the top 5 components (or document that naming-convention parity is the chosen mapping mechanism) |

Effort key: **S** = single tool call. **M** = a few coordinated calls. **L** = multi-day work.

## Findings by category

### 1 — Token Architecture

#### TA1 — Tier separation
- **State:** 5 collections cleanly separated: `Primitive Tokens` (39 vars), `UI Tokens` (75 vars), `Component Tokens` (15 vars), `Motion Tokens` (4 vars), `Effects Tokens` (2 vars).
- **Severity:** Pass
- **Notes:** Atelier has the cleanest tier separation I've audited — explicit Primitive layer, semantic UI Tokens layer with proper modes, optional Component Tokens layer for component-specific tokens. Architecture-wise this is correct.

#### TA2 — Mode placement
- **State:** Light + Dark modes on `UI Tokens` (semantic). All other collections are single-mode (`Default`). Primitives have no modes.
- **Severity:** Pass
- **Notes:** Modes correctly attached to the semantic layer, not the primitive layer. This is the canonical pattern.

#### TA3 — Aliasing
- **State:** Spot-check confirms semantics alias primitives (e.g. `color/primary` → `teal/600`). Did not exhaustively walk the alias chain for all 75 UI tokens.
- **Severity:** Pass (with caveat)
- **Fix:** If you want stronger confidence, run `figma_get_variables` with `enrich:true` and audit each semantic for `valuesByMode` containing `{ alias }` entries (vs raw values).

#### TA4 — Variable Scopes
- **State:** **72 of 134 variables (54 %) use `ALL_SCOPES`** — including all 39 primitives (`teal/600`, `red/500` etc.), all 15 Component Tokens (`button/bg-primary`, `input/border` etc.), all 4 Motion Tokens, and 14 UI Tokens (brand colors, `color/text-on-secondary`, `color/text-on-danger`, all the `*-bg`/`*-text` AA-pair tokens). UI Tokens semantics for `color/primary*`, `color/secondary*`, `color/danger*` etc. correctly use `[ALL_FILLS, STROKE_COLOR, EFFECT_COLOR]`. Spacing/Radius/FontSize/Weight are correctly scoped to their semantic types. Effects (shadows) have empty scopes (acceptable).
- **Severity:** **Critical**
- **Fix:** Run `figma_execute` to set scopes per token family:
  - All COLOR primitives + brand colors + AA-pair tokens (`*-bg`, `*-text`) → `[ALL_FILLS, STROKE_COLOR, EFFECT_COLOR]`
  - Component Tokens by purpose: `button/bg-*` → fills, `input/border` → strokes, `button/text-*` → text fills
  - Motion durations → no good scope match (Figma Variable Scope enum doesn't cover motion); accept `ALL_SCOPES` as documented limitation, OR move to a separate "Motion" non-typed approach
  - `feature/reduce-motion`, `feature/high-contrast` → these are BOOLEAN feature flags, not variables that bind into design properties; `ALL_SCOPES` is fine because they're never used as bindings anyway
- **Effort:** M (~30 min of `figma_execute` calls; one per family).

#### TA5 — Variables vs. Styles coverage
- **State:** Variables-first throughout. Could not query `figma_get_styles` (REST 403) but the lint pass showed 33 text nodes don't use Text Styles. Color/number tokens are all on Variables.
- **Severity:** Pass on Variables; **Warning** on Text Styles (see Consistency section below).

### 2 — Component Design

#### CD1 — Variant axis explosion
- **State:** Largest set is `LlmButton` with 28 variants (after the recent state-coverage fixes). All others ≤ 12.
- **Severity:** Pass

#### CD2 — Variant Property naming vs. code
- **State:** All variant values use lowercase matching code: `primary`, `secondary`, `outline`, `danger`; `sm`, `md`, `lg`. After the 2026-04-25 LlmButton parity fix, code and Figma agree on every variant value across the 4 button properties.
- **Severity:** Pass

#### CD3 — Show/hide encoded as Variants
- **State:** No data — would require deep inspection of each set.
- **Severity:** (deferred)

#### CD4 — Icons modeled as Variants — **RESOLVED 2026-04-25**
- **State:** `Icons` page exists in the file's page list, but contains zero Component Sets and zero standalone Components (`figma_execute` walk confirms empty results for `/icon/i` regex match).
- **Severity:** **Warning**
- **Fix applied:** Created `LlmIcon` ComponentSet on the Icons page (`471:2730`) with 21 named variants matching the existing documentation catalog: success, warning, danger, info, error, chevron-{up,down,left,right}, sort-{asc,desc}, arrow-{right,left}, copy, paste, add, edit, delete, close, more, default-toast. Each variant is a 32×32 frame with the glyph at 16px Inter Regular, bound to `color/text` for fill and using the `icon/glyph-md` Text Style. ComponentSet background bound to `color/surface-sunken`, border bound to `color/border`. Lint on Icons page: 0 warnings.
- **Effort:** L → M (delivered as glyph-icon ComponentSet rather than full SVG icon pack)

#### CD5 — Composition / atomic structure
- **State:** Not deeply inspected.
- **Severity:** (deferred)

#### CD6 — Component descriptions
- **State:** **All 27 component sets have descriptions.** Average description length is ~470 characters; longest is `LlmButton` at 1242 chars (post-update with full Token-binding documentation). Descriptions explain variants, sizes, color bindings, A11y semantics, and integration points.
- **Severity:** Pass — exemplary.

### 3 — Naming

#### N1 — Component names match engineering
- **State:** All 27 Figma component sets follow `Llm<Name>` exactly matching the code-side selector in `libs/{angular,react,vue}/src/lib/<name>/llm-<name>.{ts,tsx,vue}`. No drift.
- **Severity:** Pass

#### N2 — Variable path conventions
- **State:** **`color/on-primary` (`VariableID:3:142`) AND `color/text-on-primary` (`VariableID:3:141`) both exist** as COLOR variables in the UI Tokens collection, with the same scopes. The `on-primary` form has no equivalent for secondary/danger/etc. — only `text-on-secondary`, `text-on-danger`. Almost certainly a legacy/duplicate that should be removed.
- **Severity:** **Critical** (silent confusion — designers can pick either, and code-side `--ui-color-on-primary` exists in `tokens.css` dark mode but `--ui-color-text-on-primary` is the canonical form). Also: needs reconciliation with the existing `tokens.css` which has both `--ui-color-text-on-primary` and `--ui-color-on-primary` — audit which is referenced from components and drop the orphan.
- **Fix:** Inspect Figma usage of each. If `color/on-primary` is unused, delete it. If used, consolidate to `color/text-on-primary` and re-bind.
- **Effort:** S

Otherwise: variable paths consistent (slash-grouped, kebab-case-within-segment, no mixed casing).

#### N3 — Slash naming for Variants
- **State:** All component sets use proper slash hierarchy. Variant Property values live in the Property panel (not in layer names).
- **Severity:** Pass

### 4 — File Structure

#### FS1 — Working designs in the library file
- **State:** No WIP designs found. Pages are: Colors, Typography, Spacing & Radius, Cookbook, Icons, Components. The `Cookbook` page contains usage patterns, not in-progress work.
- **Severity:** Pass

#### FS2 — Page organization
- **State:** 6 pages, well-categorized. Components page has 6 inner sections: Inputs, Display, Navigation, Overlay, Feedback, AI. **No Cover page.**
- **Severity:** **Warning** (Cover absence)
- **Fix:** Add a Cover page (first in tab order) with library name, version (currently 0.0.30), owner, last-updated date, link to GitHub repo + Storybook.
- **Effort:** S

#### FS3 — Sub-components polluting the asset panel
- **State:** Did not check for `_` / `.`-prefixed atomic sub-components. The component-set search returned 27 publishable sets — none with leading underscore or dot — so no obvious leakage.
- **Severity:** (likely Pass; not deeply verified)

### 5 — Engineering-Sync Readiness

#### ES1 — Token names match codebase
- **State:** Transformation rule is consistent: `<segment>/<name>` in Figma → `--ui-<segment>-<name>` in CSS. Examples: `color/primary` → `--ui-color-primary`, `spacing/4` → `--ui-spacing-4`, `radius/md` → `--ui-radius-md`, `font-size/md` → `--ui-font-size-md`. The exception is the `on-primary` / `text-on-primary` duplicate from N2.
- **Severity:** Pass (modulo N2)

#### ES2 — Component prop API matches code
- **State:** After the 2026-04-25 LlmButton parity pass, every checked component's Variant Property names + values match the code-side Type union exactly. `state` Variant in Figma is the documented exception (CSS pseudo-states in code = Variant property in Figma; intentional).
- **Severity:** Pass

#### ES3 — Code Connect / mapping setup
- **State:** No Code Connect configured. Mapping is implicit via name parity (works because the conventions are tight).
- **Severity:** **Warning**
- **Fix:** Either set up Figma Code Connect for the top components (Button, Input, Card, Drawer, Chat) — gives Dev Mode handoff with code preview — or explicitly document in the file's Cover page that "name parity is the mapping mechanism, no Code Connect by design".
- **Effort:** M

#### ES4 — Documentation handoff
- **State:** Strong: Figma component descriptions (avg ~470 chars, all 27 sets), plus Storybook stories link back to Figma frames via `parameters.design` (every story across Angular/React/Vue), plus the docs site at `docs/src/data/components.ts` mirrors the spec. Three coordinated documentation surfaces.
- **Severity:** Pass

### Accessibility — from the lint pass

#### A11y-DG — Danger contrast (WCAG 1.4.3 AA, normal text)
- **State:** White (`#ffffff`) text on `#ef4444` danger background = **3.8:1**. Required: 4.5:1 for normal text < 18.5pt regular / 24pt large. Affects all 9 danger Button variants (3 sizes × 3 default + 4 md states); the size=lg (18pt) actually passes "large text" threshold so is technically compliant.
- **Severity:** **Critical**
- **Fix:** Architectural decision needed:
  - **Option A:** Darken `color/danger` Light-mode value from `#ef4444` to ~`#dc2626` (currently the hover value). White text passes AA at ~4.6:1. Trade-off: hover state becomes a more aggressive `#b91c1c`. Atelier brand consistency stays intact.
  - **Option B:** Bump font-weight from 500 (Medium) to 600 (Semi Bold) on Button text — still 3.8:1 on weight, but bold text qualifies as "large" at smaller sizes per WCAG. Marginal improvement.
  - **Option C:** Restrict `variant=danger` to size=lg only and dual-channel via icon (✕ glyph). Honest about the contrast limitation.
  - **Recommendation:** A — single-token change, fixes all 9 instances, minimal code-side disruption.
- **Effort:** M (token change + verify hover/active still distinguishable)

#### A11y-DC — Danger color-only differentiation (WCAG 1.4.1)
- **State:** Lint flags 7 danger variants for "information conveyed only through colour change" — the only difference between `variant=primary` and `variant=danger` is the fill color. No icon, no border, no glyph.
- **Severity:** Critical (per lint), but architecturally **Suggestion** in this skill's framing — a destructive button conveying state via color + label text is acceptable per common practice (the label is the primary signal, color is reinforcement).
- **Fix:** If treating strictly as Critical: add an optional warning glyph (⚠ or ✕) as a Boolean Component Property `withIcon`. Defaults to false.
- **Effort:** M

#### A11y-OH — Outline hover/active contrast (WCAG 1.4.3)
- **State:** `outline md hover` and `outline md active` use `color/primary` text on `color/primary-light` background → **2.6:1**. The visual rendering on the underlying surface is acceptable (primary-light is a translucent overlay) but the lint check measures fg-on-bg directly.
- **Severity:** **Critical** (per lint)
- **Fix:** Two paths:
  - **Code-aligned:** keep visual identical, but change Figma to render hover with bg = `color/surface-sunken` and a subtle border accent. Better lint score, slight visual drift from code.
  - **Code-changing:** keep `primary-light` overlay but switch text fill to `color/primary-active` (darker) — gets to ~3.5:1, still fails strict AA but visually clearer. Requires matching change in `llm-button.css`.
- **Recommendation:** First path. Outline hover doesn't NEED a tinted bg; a focus ring or subtle elevation would communicate state more accessibly.
- **Effort:** S

#### A11y-OL — Outline loading spinner invisible
- **State:** `outline md loading` spinner glyph (⟳) has fill `#ffffff` on transparent bg — when rendered against the white surface it becomes 1.0:1 (white on white, invisible). This is a real bug introduced when I cloned `primary md loading` for the outline variant earlier today and forgot to rebind the spinner color.
- **Severity:** **Critical**
- **Fix:** Rebind the spinner text fill to `color/primary` (matching the outline button's text color). Same fix needed on the secondary md loading variant — verify whether secondary uses white spinner too.
- **Effort:** S (single `figma_execute` call)

### Consistency — from the lint pass

#### TS — No-text-style on Button text nodes (33 occurrences) — **RESOLVED 2026-04-25**
- **State:** All 33 button text labels (`"Button"`, `"⟳"`) don't use a shared Text Style. They have direct font-name + bound fontSize + bound fill.
- **Severity:** **Warning**
- **Notes:** This is a deliberate Atelier choice or an oversight — depends. Text Styles add a layer of indirection over `font-size` Variables. Some teams prefer Variables-only typography; others use Text Styles for `body-md`, `heading-lg` etc. as composed bundles (size + weight + line-height + family). The fact that 33 nodes share the same shape suggests Atelier *would* benefit from a `text/button` Text Style (Inter Medium + bound font-size variant + bound color).
- **Fix applied:** Introduced 14 canonical Text Styles, all bound to `font-size/*` Variables where a matching token exists:
  - `body/{sm,md,lg}` (Inter Regular)
  - `label/{sm,md,lg}` (Inter Medium) — applied to all 28 LlmButton labels
  - `heading/{sm,md,lg}` (Inter Semi Bold)
  - `display/section-title` (Inter Bold 64) — applied to all 6 section titles (Inputs, Display, Navigation, Overlay, Feedback, AI)
  - `icon/glyph-{sm,md,xs}` — applied to all 13 spinner glyphs across Button, Input, Select, Combobox, Checkbox, Radio, RadioGroup, Toggle, Table loading states
  - `label/avatar-xs` — applied to xs avatar initials
- **Verification:** Lint dropped from 33 → 0 unstyled text nodes in the audited component scope. The 197 remaining unstyled nodes are inside the LlmChat AI-section mockup primitives — separate scope, will be cleaned up when LlmChat is built as a real component.
- **Effort:** M (delivered)

#### HC — Hardcoded #000000 on "Inputs" section fill
- **State:** The `Inputs` section frame on the Components page has a hardcoded `#000000` fill.
- **Severity:** Warning
- **Fix:** Bind to `color/text` or remove the fill (sections often look cleaner with no bg fill).
- **Effort:** S

## What's healthy

A short list of what the workspace gets right — for context against the findings list.

- **Tier separation is exemplary.** 5 cleanly-typed collections (Primitive / Semantic-with-Modes / Component / Motion / Effects). No mixed semantics-in-primitives confusion.
- **Modes on the right collection.** Light + Dark on `UI Tokens` only; Primitives are mode-less (correct).
- **All 27 component sets have substantive descriptions.** Average ~470 chars; descriptions explain variants, A11y semantics, integration points. Best-in-class for a library this size.
- **Component naming matches engineering 1:1.** `Llm<Name>` Figma ↔ `Llm<Name>` Angular/React/Vue. Variant property values lowercase + matching code Type unions.
- **Token names match engineering via predictable rule.** `<segment>/<name>` Figma → `--ui-<segment>-<name>` CSS, no exceptions outside the N2 duplicate.
- **Page taxonomy is clear.** Colors / Typography / Spacing & Radius / Cookbook / Icons / Components, with 6 categorized inner sections in Components.
- **Storybook ↔ Figma navigation is bidirectional.** Every story has `parameters.design = figmaNode('<id>')`, every Figma component frame has a real engineering counterpart; designers and developers can navigate the link.

## Recommended next steps

Ordered by ROI × cost. Tackle 1–4 in one sitting (~30 min total). 5–6 are larger commitments — schedule.

1. **A11y-OL** — fix outline + secondary md loading spinners. Single `figma_execute` rebinding spinner text fill to the variant's text color. Probably 5 min, biggest visibility win.
2. **N2** — resolve `color/on-primary` vs `color/text-on-primary` duplicate. Inspect 5 min, delete 1 min.
3. **HC** — remove `#000000` fill from Inputs section. 1 min.
4. **TA4** — set scopes on the 72 `ALL_SCOPES` variables. ~30 min via `figma_execute`, batched per token family. Tightens the architecture meaningfully.
5. **A11y-DG** — make the architectural decision on danger contrast. The "darken color/danger to #dc2626" path is single-token change with ripple-tested consequences (hover/active also shift); discuss with design before changing. Otherwise, accept and document as known limitation.
6. **A11y-OH** — outline hover overlay. Decide between switching bg to surface-sunken (more accessible, slight visual drift) or accepting the lint-measured contrast as a representational artifact (since real-world rendering is on a white surface).

## Re-verify (2026-04-25T17:23Z)

Re-verify pass run via the figma-workspace-architect skill's Re-verify sub-mode. Each finding was checked against current Figma + code state using the queries in `references/audit-verify-queries.md`.

| Finding ID | Status | Current state                                                                                          | Verified at         |
|------------|--------|--------------------------------------------------------------------------------------------------------|---------------------|
| N2         | auto-resolved | `color/on-primary` (`VariableID:3:142`) deleted from UI Tokens; collection has 75 vars (was 76); CSS consolidated into mode-aware `--ui-color-text-on-primary` | 2026-04-25T17:23Z |
| A11y-OL    | auto-resolved | Spinner glyphs sample-checked: outline → `color/primary`, secondary → `color/text-on-secondary`, danger → `color/text-on-danger` (latter rebound during this session — was incorrectly bound to `color/text-on-primary`)  | 2026-04-25T17:23Z |
| A11y-OH    | auto-resolved | `outline md hover/active` background fills now bound to `color/surface-sunken` (`#f5f5f5`); the original `color/primary-light` overlay is gone — fixed in commit `400bbf4` | 2026-04-25T17:23Z |
| TA4        | auto-resolved | 0 non-BOOLEAN variables on `ALL_SCOPES`; only the 2 BOOLEAN feature flags (`feature/reduce-motion`, `feature/high-contrast`) remain — acceptable per the documented exemption | 2026-04-25T17:23Z |
| TS         | auto-resolved | 0 unstyled text labels on `LlmButton` (32 labels, all using Text Styles bound to `font-size/*` variables) | 2026-04-25T17:23Z |
| HC         | state-shifted | Original audit said "Inputs section fill is `#000000`" — that section is now `#f2f7ff`. Real issue was 8 *other* section titles (Display, Navigation, Overlay, Feedback, AI, 3× LlmChat) hardcoded to `#000000`; all 8 rebound to `color/text` during this session. Page now has 0 hardcoded opaque-black fills (modal backdrops with opacity 0.5 retained as legitimate) | 2026-04-25T17:23Z |
| CD4        | auto-resolved | Icons page now has `LlmIcon` ComponentSet (`471:2730`) + 21 standalone glyph components; was empty in original audit | 2026-04-25T17:23Z |
| A11y-DG    | **still-open** | White `#ffffff` on `#ef4444` — unchanged. No architectural decision was made on darkening `color/danger` vs. restricting variant. Effort estimate stands. | 2026-04-25T17:23Z |
| FS2        | **still-open** | Pages: Colors, Typography, Spacing & Radius, Cookbook, Icons, Components. No Cover page. Effort estimate stands (S, ~5 min). | 2026-04-25T17:23Z |
| ES3        | **still-open** | No `figma.config.*` or Code Connect files in the repo. No alternative documentation on a Cover page (because no Cover page exists — see FS2). Effort estimate stands. | 2026-04-25T17:23Z |

**Active priority list** (after Re-verify):

| # | Severity   | Finding ID | What                                                                  | Effort |
|---|------------|------------|-----------------------------------------------------------------------|--------|
| 1 | Critical   | A11y-DG    | `danger` filled buttons fail AA contrast (white on `#ef4444` = 3.8:1) | M      |
| 2 | Warning    | FS2        | No Cover page in the file                                             | S      |
| 3 | Warning    | ES3        | No Code Connect / explicit Figma↔code mapping                         | M      |

The other 7 priority items have been resolved between original audit and re-verify time — drop them from active triage.

## Notes

- This audit ran without `FIGMA_ACCESS_TOKEN` so REST API tools (`figma_get_styles`, `figma_check_design_parity`) were unavailable. Findings rely on plugin-bridge data + the design-system-dashboard summary. A later pass with REST access would cover Text Styles inventory (currently inferred from lint counts only) and structured parity scoring.
- Dashboard categories scoring below 75 (Naming 75, Coverage 75, Accessibility 79) are partially out of this skill's scope — the dashboard's Coverage check looks at component-vs-product-screen ratios that don't apply to a library file. Treat the 75/100 as "the dashboard is mildly unhappy with how few non-component things we have"; for a library file this is correct behavior.
- Code Connect is not part of `figma-console-mcp`. Setting it up requires Figma's official Code Connect tooling and Dev Mode subscription; out of scope for this audit.
- The skill itself was used to drive this audit. Pre-flight (status, file_data, variables, descriptions) → Dashboard (breadth) → architectural deep-walk (this report) — the three-layer Audit-mode flow worked as designed; total time including writing this report ~25 min.
