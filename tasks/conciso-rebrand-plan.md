# Plan: Atelier under the Conciso Design System

**Status:** awaiting approval before implementation.
**Date:** 2026-08-26.
**Decided already:** the Claude Design project *Conciso Design System – Test*
(`d7f30939-ad36-45c6-8651-ab4a64e3bb90`) is the authoritative source for values.
First pass is a 5-component pilot.

**Consumer project:** *Atelier* — `7a6a2f19-9a3c-4dd9-9828-65c7cc67766c`,
<https://claude.ai/design/p/7a6a2f19-9a3c-4dd9-9828-65c7cc67766c>, created
2026-08-26 and bound to the Conciso design system. All artboards go here; the
design-system project is never written to. (Not to be confused with the separate
*Atelier Design System* project, `019de217-489c-7441-8275-2efe020086b5`, which is
registered as a design system in its own right.)

## Guardrails

1. **The design-system project is READ-ONLY.** No `write_files`, `delete_files`,
   or `copy_files` *into* `d7f30939-…`. Everything authored goes into a separate
   consumer project bound to it; assets come in via `copy_files` with
   `src_project_id` pointing at the DS.
2. **No values are hand-typed.** Everything that lands in `styles/tokens.css` is
   derived from the DS files, so a later DS change can be re-derived rather than
   re-guessed.
3. **The existing library is not rebuilt.** Spec, 29 components, three adapters
   and all 18 gates stay. This is a re-theme plus targeted anatomy decisions —
   not a regeneration.

## Done when

- `libs/{angular,react,vue}/src/styles/tokens.css` resolve every `--ui-*` to a
  Conciso value, with the Conciso ramps present as an explicit primitive tier.
- `npm run check:all` green, including `check:css-tokens` at full coverage and
  `check:tokens` in sync across the three libs.
- Contrast verified for every foreground/background pair the pilot components
  use, against the DS's own AA annotations — not by eye.
- The five pilot components render correctly in all three frameworks, with
  `storybook-test` (216 React + 242 Vue) still green.
- One Claude Design consumer project holds artboards for the five components,
  bound to the Conciso DS.
- The Figma library carries Conciso Variables and the five masters, **generated
  from the token layer** via figma-console-mcp — not traced from artboards.
- `check:figma` and `check:parity` pass against the regenerated masters.

## Architecture: one source, three outputs

Do **not** chain Claude Design → Figma → code. Claude Design → Figma has no
verified export path (import *into* Claude Design via Figma links exists; the
direction we need does not). Artboards carried into Figma arrive as frames, not
`COMPONENT_SET`s with variant axes and bound Variables — which would make
`check:figma` and `check:parity` assert nothing.

```
Conciso css/tokens.css + colors_and_type.css   (authoritative values)
        │
        ├─→ libs/*/src/styles/tokens.css    --ui-* aliased onto Conciso   → code
        ├─→ figma-console-mcp               Variables + COMPONENT_SETs    → Figma
        └─→ Claude Design consumer project  artboards: anatomy + review   → design
```

This is ADR-0018's three-tier architecture, already in place: **Conciso is the
primitive tier**, `--ui-*` stays the semantic API that components and the spec
address. Component-level tokens are unaffected.

## Token mapping

Mechanical, verified against both files:

| Family | Atelier | Conciso | Note |
|---|---|---|---|
| Spacing | `--ui-spacing-{1,2,3,4,5,6,8,10,12,16}` | `--s{1,2,3,4,5,6,8,10,12,16}` | **identical scale** (4/8/12/16/20/24/32/40/48/64) |
| Radius | `{sm,md,lg,xl,full}` | `{xs,sm,md,lg,xl,full}` | 1:1; Atelier has no `xs`. Decide: add `--ui-radius-xs` or map Conciso `xs`→`sm` |
| Shadow | `--ui-shadow-{xs,sm,md,lg,xl}` | `--e1..e5` | 1:1 by rank. Conciso shadows are notably darker (`rgba(0,0,0,.30)`) — a visible change |
| Motion | `--ui-duration-*` / `--ui-ease-*` / `--ui-transition-*` | `--m-fast` / `--m-std` | Conciso ships only two; keep Atelier's finer steps, seed them from these two |
| Focus | `--ui-focus-ring` | `--focus-ring` (double ring) + `--focus-aa` | 1:1 |
| Color | `--ui-color-*` semantics | 5 ramps ×10 + neutrals + semantics + surfaces/text | The main work; see below |
| Typography | separate `font-size` / `line-height` / `font-weight` / `letter-spacing` | 15 `font:` shorthands (`--t-display-lg` … `--t-label-sm`) | **structural fork — needs a decision** |

### The one structural decision: typography

Conciso's type scale is fifteen `font:` shorthand tokens. A CSS shorthand cannot
be decomposed back into its parts, so it cannot be aliased into Atelier's
separate axes. Two options:

- **(a) Decompose.** Read the fifteen shorthands and set Atelier's existing
  `--ui-font-size-*`, `--ui-line-height-*`, `--ui-font-weight-*`,
  `--ui-letter-spacing-*` from their parts. Keeps the current API and every
  component's CSS untouched. Loses the ability to say "this is `--t-body-md`" in
  one declaration, and the Conciso→Atelier relationship becomes derived rather
  than stated.
- **(b) Add a `--ui-type-*` shorthand tier** mirroring the fifteen, and migrate
  component CSS onto it over time. Truer to the DS and self-documenting, but it
  is an API addition — new tokens in the manifest, `check:css-tokens` coverage,
  and eventually touching every component's typography rules.

**Recommendation: (a) for the pilot, revisit (b) after.** (a) is reversible and
keeps the pilot about colour and shape, where the visible change actually is.

### The four brand areas — no new variant axis needed

`colors_and_type.css` already solves this with a scoping attribute:

```css
[data-area="co"] { --c500: var(--co-500); --c700: var(--co-700); --c50: var(--co-50); }
[data-area="ai"] { … }  /* note: ai maps --c700 to --ai-800, not --ai-700 */
```

That is structurally the same escape hatch as Atelier's `data-theme="dark"`. So
the four areas become a **scope**, not a variant — no extra Figma variant axis,
no matrix explosion, nothing added to `variantMatrix`. Worth stating explicitly
in the ADR, because "one axis per brand area" is the obvious wrong turn.

### Accessibility is already encoded — use it

The DS annotates its own ramps: `--co-700` is marked *"T — text AA 5.5:1"*,
`--ai-500` *"accent only (500 never for text)"*, `--ai-800` *"text AA 8.1:1"*.
That gives the repo's dormant contrast gate its expected values:
`tools/parity/wcag-contrast.mjs` exists and is wired to nothing (open item B5).
Wiring it during this work is nearly free and turns "we picked accessible
colours" into a checked claim. **The `--ai-500` rule is a hard constraint**: the
Angewandte-KI lime must never become `--ui-color-text-*` or a button label
colour.

## Phases

### Phase 0 — prerequisite (do first, blocks the rest)

- [ ] Land the ADR-0024 amendment: `parityScore` stops being a stored trend;
      keep `verifiedAt` / `verifiedSha` / `inputsHash` / `figmaNodeId`. **Reason
      it blocks:** a re-theme changes every component's CSS, so all 29 parity
      records go stale at once. Without this we would mint 29 fresh scores whose
      values are already known to be non-comparable (70/52/83 on one commit).

### Phase 1 — the token tier (repo only, no design work)

- [ ] Extract the Conciso primitives into a generated primitive tier. Source of
      truth is the DS project; the extraction is scripted so it can be re-run.
- [ ] Re-point every `--ui-*` in `libs/*/src/styles/tokens.css` at a primitive,
      per the mapping table. Decide radius-`xs` and apply typography option (a).
- [ ] `npm run sync:tokens` + `check:tokens` + `check:css-tokens` green; the
      token manifest updated.
- [ ] Wire `wcag-contrast.mjs` into a real check and run it over the new pairs.
      Any pair below AA is a finding to resolve before Phase 2, not a warning.
- [ ] Visual diff: screenshot the Storybook kitchen-sink before/after per
      framework. This is where "it looks like Conciso now" is confirmed or not.

### Phase 2 — Claude Design consumer project (design work)

- [ ] Create ONE consumer project (e.g. *Atelier × Conciso — Pilot*) bound to
      the Conciso DS. Never write into the DS project.
- [ ] `copy_files` only what the artboards need: `css/tokens.css`,
      `colors_and_type.css`, the Montserrat variable fonts, the UI icons.
- [ ] `create_support_js` once, then one `.dc.html` artboard per pilot
      component, each carrying a `:root{--ui-*}` block in `<helmet><style>` fed
      from Phase 1's output — so the artboards and the code share values by
      construction rather than by eye.
- [ ] Run Claude Design's own verify loop per artboard (render → gate on console
      errors/404s/blank mount → fresh-eyes review → act).
- [ ] Answer the questions tokens cannot: density, where the Libre Baskerville
      display serif belongs, whether elevation or border carries separation, how
      `[data-area]` reads on each component.

### Phase 3 — the Figma library (generated, not traced)

- [ ] `figma_batch_create_variables`: the Conciso ramps as a primitive
      collection, `--ui-*` as the Library Tokens semantic tier (ADR-0030), Light
      and Dark modes.
- [ ] Regenerate the five pilot masters as `COMPONENT_SET`s with the existing
      variant axes, bound to those Variables — values from the token tier, the
      Phase-2 artboards as visual reference only.
- [ ] `npm run figma:snapshot`, then `check:figma` — variant-matrix completeness
      and token-link coverage must pass.
- [ ] `figma_check_design_parity` per component, `parity:record` under the
      Phase-0 semantics.

### Phase 4 — fan out (only after the pilot is signed off)

- [ ] Cost per component measured on the pilot, then the remaining 24.
- [ ] ADR recording: Conciso as primitive tier, `[data-area]` as scope not axis,
      the typography choice, and what the pilot cost.

## Pilot set — and why these five

| Component | Covers |
|---|---|
| `AtlButton` | The full variant × size × state matrix; the focus ring; the accent-vs-text colour rule |
| `AtlInput` | Form control, error/invalid surface, border vs elevation, label typography |
| `AtlCard` | Composition (header/content/footer), surface hierarchy, tonal overlays |
| `AtlDialog` | Overlay, the darkest elevation step, backdrop, dark mode |
| `AtlStepper` | Complex layout, connector geometry, and it already has open questions (padding 16 vs 0, the ARIA pattern, no focus/disabled variant in Figma) — worth resolving in the same pass |

## Risks, named

- **Every parity record goes stale.** Mitigated by Phase 0, but the
  re-verification work is real and grows ×29 in Phase 4.
- **Conciso's shadows are much darker than Atelier's current ones.** Expect the
  visual change to be larger than a palette swap suggests; check dark mode
  early.
- **`--ai-500` (lime) is accent-only.** A naive "map brand 500 to
  `--ui-color-primary`" would produce failing contrast on any text use.
- **Dark mode.** Conciso ships `css/dark-mode.css`; Atelier has its own
  `prefers-color-scheme` + `data-theme` strategy. These must be reconciled
  deliberately, not merged by accident.
- **Docs and the workshop.** The docs site, the OG images and the
  `atelier-design` skill all encode the current palette. They drift the moment
  Phase 1 lands; `check:docs` will not catch a colour change.
