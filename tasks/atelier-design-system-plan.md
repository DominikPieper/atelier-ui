# Plan: harden Atelier's own design system — Conciso as theme demo

**Status:** approved in direction 2026-08-26; phases not started.

## The decision, and why it is not a new one

The starting question was whether to rebuild the library under the official
Conciso design system. The repo had already answered it:

- ADR-0020 names its palette source as
  `docs/src/styles/docs-theme.css (Direction A: Conciso anchor only — the palette this extends)`,
  and the file's own header reads *"Direction A: Conciso anchor only … deep
  Conciso teal on a clean white canvas"*. `--ui-color-primary: #006470` **is**
  a Conciso-derived anchor — deliberately the anchor and nothing else.
- ADR-0020's decision sentence: *"Separate brand DNA (typography + motion) from
  palette (purpose-specific)."* Shared identity lives in type and motion, not
  colour.

Adopting the full Conciso system would reverse that standing decision. So:
**continue Atelier's own system, port what is brand-neutral from Conciso, and
use Conciso as a theme demo instead of a foundation.**

The demo is the better artifact anyway. If Atelier's token architecture is sound
enough that Conciso can be applied as a *theme* through one scope attribute,
that proves the token thesis the whole repo rests on. A rebrand proves nothing —
it swaps values. It also keeps the OSS library from carrying an employer's brand,
which would raise licensing and governance questions a public repo should not
have to answer.

## Existing assets (verified 2026-08-26)

| Thing | Where | State |
|---|---|---|
| *Atelier Design System* | Claude Design `019de217-489c-7441-8275-2efe020086b5` | Real and current: holds `libs/react/src/styles/tokens.css`, `docs/src/styles/docs-theme.css`, `colors_and_type.css`, the logo, 21 preview cards, `ui_kits/docs-site/` (landing.jsx + css), and a 9.8 KB `_adherence.oxlintrc.json` — more adherence rules than Conciso's. Clearly `/design-sync`-produced, recent manifest timestamp. |
| *Conciso Design System – Test* | Claude Design `d7f30939-ad36-45c6-8651-ab4a64e3bb90` | Reference only. 5 brand ramps ×10, neutrals, semantics, 15-token role type scale, spacing/radius/elevation/motion, Montserrat + Libre Baskerville, 24 preview cards, `_adherence.oxlintrc.json`. |
| Work project *Atelier* | Claude Design `7a6a2f19-9a3c-4dd9-9828-65c7cc67766c` | Empty, created 2026-08-26. `get_project` reports no design-system binding, and `get_claude_design_prompt` takes `design_system_id` per call — so the binding is soft. Use this project and pass the **Atelier** design system explicitly. |

## Guardrails

1. **Both design-system projects are READ-ONLY.** No `write_files`,
   `delete_files`, or `copy_files` *into* `d7f30939-…` or `019de217-…`. Work
   happens in project *Atelier* (`7a6a2f19-…`); assets arrive via `copy_files`
   with `src_project_id`.
2. **Pass `design_system_id: 019de217-…` explicitly** on every
   `get_claude_design_prompt` call, since the project carries no hard binding.
3. **Port structure, never brand.** No Conciso hex value, font, logo or area
   name enters `libs/` or `docs/` outside the Phase-4 theme demo, where it is
   explicitly namespaced.
4. **Additive first.** Phases 1–3 *add* tokens and leave existing `--ui-*`
   values alone, so component CSS is untouched and the 29 parity records stay
   valid. The moment component CSS starts referencing new role tokens, that
   changes — see Phase 0.

## What gets ported from Conciso — and what each one buys

| # | Pattern | Atelier today | Why it is worth porting |
|---|---|---|---|
| 1 | **Tonal ramps 50–900 with an explicit ★ anchor and a marked `T` text-safe shade** | flat semantics: `--ui-color-primary` / `-hover` / `-active`, no ramp, no documented text-safe shade | The largest structural gain. Gives every colour a defined text use instead of leaving it to judgement |
| 2 | **Contrast annotated in the token source** (`"T — text AA 5.5:1"`, `"accent only, 500 never for text"`) | `tools/parity/wcag-contrast.mjs` exists and is wired to nothing (open item B5) | Turns "we picked accessible colours" into a checked claim, and gives the dormant gate its expected values |
| 3 | **Role-based type scale** (display / headline / title / body / label × lg / md / sm) | `--ui-font-size-{xs…2xl}` — a size ladder, not roles | Components should reference a role ("this is body-md"), not a size. Sizes are an implementation detail of a role |
| 4 | **Elevation paired with tonal overlays** | `--ui-shadow-{xs…xl}`, no overlay concept | Surfaces that read as layered without relying on shadow alone — matters in dark mode |
| 5 | **`[data-area]` scope mechanism** (`[data-area="co"] { --c500: … }`) | `data-theme="dark"` is the only scope | The mechanism that makes Phase 4's theme demo possible with no fork. Structurally identical to what already exists |
| 6 | **`_adherence.oxlintrc.json`** — machine-checkable adherence rules | nothing equivalent; ADR-0032 rejected an artboard gate on a premise since disproven | A ready-made answer to ADR-0032's reopened alternative 4. Both DS projects ship one; read them before designing our own |

Explicitly **not** ported: the five brand ramps' values, Montserrat, Libre
Baskerville, the four area names, the logo, the voice guidance.

## Done when

- Every `--ui-color-*` semantic resolves through a documented ramp with a named
  anchor and a text-safe shade, and the ramp values are Atelier's own.
- A contrast check runs in `check:all` over every foreground/background pair the
  library actually uses, with the expected ratios stated in the token source.
- A role-based type scale exists, is covered by the token manifest, and
  `check:css-tokens` is at full coverage.
- The five pilot components render unchanged in all three frameworks (this is
  additive — a visual diff should show *nothing* until Phase 4).
- Project *Atelier* holds artboards for the five pilot components, driven by
  Atelier's own tokens.
- The Figma library carries Atelier's Variables and the five masters, generated
  from the token layer via figma-console-mcp — not traced from artboards.
- Phase 4: `[data-brand="conciso"]` restyles the whole library through the token
  layer alone, with no component CSS touched. Screenshots prove it.

## Architecture: one source, three outputs

Unchanged from the first draft, with Atelier's own tokens as the source. Do
**not** chain Claude Design → Figma → code: that direction has no verified
export, and artboards carried into Figma arrive as frames rather than
`COMPONENT_SET`s with variant axes and bound Variables, which would make
`check:figma` and `check:parity` assert nothing.

```
libs/*/src/styles/tokens.css   (Atelier's own values — the source of truth)
        │
        ├─→ code            components already consume --ui-*
        ├─→ figma-console-mcp   Variables + COMPONENT_SETs
        └─→ Claude Design       artboards: anatomy + review
                                    │
                                    └─→ Phase 4: [data-brand="conciso"] overlay
```

## Phases

### Phase 0 — ADR-0024 amendment (recommended first, no longer blocking)

- [ ] `parityScore` stops being a stored trend; keep `verifiedAt` /
      `verifiedSha` / `inputsHash` / `figmaNodeId`. Reason: three runs on one
      commit returned 70, 52 and 83 — the number tracks how much `codeSpec` was
      declared and which node was sampled, not the component.
- Why it is no longer *blocking*: this plan is additive, so component CSS stays
  untouched and the 29 records stay valid. It becomes blocking the moment
  component CSS migrates onto role tokens (late Phase 1 or Phase 4).

### Phase 1 reconnaissance — done 2026-08-26

Read the Atelier DS's `_adherence.oxlintrc.json` and checked every claim against
the repo. Four results, all verified:

1. **Atelier already has brand-area colours.** `--ui-color-brand-{agile, ai,
   architecture, corporate, development, light-blue, light-green, petrol}` — all
   eight exist in `libs/react/src/styles/tokens.css`. So port item 5 is half
   done: the *values* are there, the *scope mechanism* is not. That is a much
   smaller job than the plan assumed, and it gives Phase 4 a natural pairing
   (Atelier's areas beside Conciso's).
2. **The `/design-sync` manifest is NOT a trustworthy source.** Verified defects
   in the synced metadata: it lists `--ui-font-size-3xl`, `-4xl` and `-5xl`,
   which exist **nowhere** in the repo; it types `--ui-transition-fast|normal|
   slow` as `"color"`; it mixes 20 `--docs-*` private docs-theme tokens into
   what reads as the library's public token API; and `react/forbid-elements`
   ships with an empty forbid list, i.e. a no-op rule. **Phase 1 derives from
   `tokens.css` only.** The manifest is reference, never input. (This is also
   the honest lesson for the `/design-sync` kata: the tool's output needs
   review, and here is a concrete list of what it got wrong.)
3. **The adherence file's three `no-restricted-syntax` rules are reusable
   nearly verbatim** — raw hex literal → "use a token via `var()`"; raw
   `\d+px` → "use a spacing token"; `font-family` outside the DS list. That is
   ADR-0032's reopened alternative 4, already written. Lift these rather than
   inventing our own.
4. **The body font is Inter** (`--ui-font-family: 'Inter', …`), and Instrument
   Serif is docs-only (`--docs-font-accent`), consistent with ADR-0020. Worth
   putting on the table rather than keeping silently: Claude Design's own system
   prompt lists Inter among the "AI slop tropes … overused fonts (Inter, Roboto,
   Arial, Fraunces)". Since ADR-0020 makes typography the shared brand DNA, the
   most-used font in the ecosystem is a weak carrier of identity. A decision, not
   a defect — but one to make deliberately.

### Phase 1 — harden the token layer (repo only, additive)

- [x] ~~Read both `_adherence.oxlintrc.json` files first~~ — done, see
      reconnaissance above. Conciso's remains unread; Atelier's already answered
      the question.
- [ ] Decide the Inter question (finding 4) before touching the type scale — the
      role scale and the font choice are one decision, not two.
- [ ] Introduce ramps for Atelier's own palette: 50–900 per colour, anchor
      marked, text-safe shade marked with its measured ratio. Existing semantics
      re-point at ramp steps **without changing their resolved values**.
- [ ] Add the role-based type scale. Decide the shape: separate axes per role
      (keeps Atelier's current API) or `font:` shorthands like Conciso (truer to
      the role idea, but a shorthand cannot be decomposed later). **Needs an
      ADR** either way — it is an API addition.
- [ ] Add tonal overlay tokens alongside the existing shadows.
- [ ] Add the `[data-area]`-style scope mechanism over the eight existing
      `--ui-color-brand-*` values (finding 1). Values exist; only the scope is
      missing. This is the carrier for Phase 4.
- [ ] Wire `wcag-contrast.mjs` into a real gate; every pair below AA is a
      finding to fix, not a warning.
- [ ] `check:tokens`, `check:css-tokens`, `check:all` green; token manifest
      updated. A before/after screenshot diff should show **no change** — if it
      does, a value moved that should not have.

### Phase 2 — artboards in project *Atelier*

- [ ] `copy_files` from the Atelier DS only what the artboards need (tokens,
      logo, the docs-site UI kit if useful). Never write into the DS.
- [ ] `create_support_js` once, then one `.dc.html` per pilot component, each
      with a `:root{--ui-*}` block in `<helmet><style>` generated from Phase 1 —
      so artboards and code share values by construction.
- [ ] Run Claude Design's own verify loop per artboard (render → gate on console
      errors / 404s / blank mount → fresh-eyes review → act).
- [ ] Use them for what tokens cannot express: density, where the serif accent
      belongs (ADR-0020's signature), elevation vs border, focus treatment.

### Phase 3 — the Figma library (generated, not traced)

- [ ] `figma_batch_create_variables`: Atelier's ramps as the primitive
      collection, `--ui-*` as the Library Tokens semantic tier (ADR-0030), Light
      and Dark modes.
- [ ] Regenerate the five pilot masters as `COMPONENT_SET`s with the existing
      variant axes, bound to those Variables.
- [ ] `npm run figma:snapshot`, then `check:figma` — variant-matrix completeness
      and token-link coverage must pass.
- [ ] `figma_check_design_parity` + `parity:record` under Phase-0 semantics.
      Resolve the open AtlStepper questions in the same pass (padding 16 vs 0,
      the ARIA pattern, no focus/disabled variant).

### Phase 4 — Conciso as theme demo (the payoff)

- [ ] A `[data-brand="conciso"]` scope that re-points the semantic tier at
      Conciso values — one namespaced stylesheet, **no component CSS touched**.
- [ ] Screenshot the same Storybook stories under both brands. That pair of
      images is the proof and the teaching artifact.
- [ ] Only then decide whether it belongs in the workshop, and under which
      governance (a client brand in teaching material is a decision for the DSB
      / the client, not a technical one).

## Pilot set — and why these five

| Component | Covers |
|---|---|
| `AtlButton` | Variant × size × state matrix, focus ring, the accent-vs-text colour rule |
| `AtlInput` | Form control, error surface, border vs elevation, label typography |
| `AtlCard` | Composition, surface hierarchy, tonal overlays |
| `AtlDialog` | Overlay, darkest elevation step, backdrop, dark mode |
| `AtlStepper` | Complex layout, connector geometry, and it already carries open questions worth closing in the same pass |

## Risks, named

- **Additive-only is a discipline, not a guarantee.** The first component CSS
  that references a role token makes 29 parity records stale. Do that
  deliberately, after Phase 0, not as a drive-by.
- **A role type scale is an API addition.** New tokens must land in the
  manifest and in `check:css-tokens` coverage, and the docs prop tables will
  need them. This is the one place where "additive" still costs.
- **The contrast gate will find real failures.** Wiring it is cheap; fixing
  what it reports may not be. Budget for the findings, not just the wiring.
- **Docs, OG images and the `atelier-design` skill encode the current palette.**
  Phase 1 is value-neutral, so they should be unaffected — verify rather than
  assume.
- **Phase 4 is where brand and governance meet.** Keep it namespaced and
  optional so nothing about the OSS library depends on it.
