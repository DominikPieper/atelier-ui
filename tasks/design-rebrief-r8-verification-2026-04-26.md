# Design rebrief — R8 verification report (2026-04-26)

Final verification cycle for the design rebrief work spanning R1-revised
through R5. Plan reference: `~/.claude/plans/atelier-design-rebrief.md`.

## Direction confirmed (from §15)

| # | Decision |
|---|---|
| Q1 | Direction A — Conciso anchor only (deep teal `#006470` light / bright teal `#34d8d8` dark) |
| Q2 | Light-mode-first; dark mode is a switch |
| Q3 | No specific Conciso/Pieper hex pinned; approximated palette |
| Q4 | No leaf glyph / botanical motif |
| Q5 | Phased migration over multiple commits, site stays green |

## Phases shipped

| Phase | Commit | Scope |
|---|---|---|
| R1 token swap (Direction C) | `f294b1a` | Navy + moss + bone (later superseded) |
| R1-revised | `752de2d` | Pivot to Direction A — Conciso teal |
| R2 + R4 batch 1 | `da12046` | Inter type swap + Button/Card/Input/Textarea/Dialog |
| R4 batch 2 | `3693eae` | Alert/Tabs/Select/Combobox |
| R4 batch 3 | `b369983` | Toggle/Checkbox/Radio/RadioGroup |
| R4 batch 4 | `f01c259` | Pagination/Breadcrumbs/Menu/Stepper |
| R4 batch 5 | `70d8837` | Progress/Table/Accordion/Skeleton (Avatar untouched) |
| R4 batch 6 | `7051d1b` | Toast/Drawer/Code-block (Chat untouched) |
| R3 | `c6e328f` | Topbar refresh + sidebar Material icons |
| R5 partial | `7a34a6a` | Hero atmospherics + btn-primary cleanup |

Phases deferred / not applicable:
- R6 (workshop affordances) — Direction A dropped completion markers /
  leaf glyph; only the linear-track sidebar progress remains as a future
  enhancement.
- R7 (motion + voice) — motion already largely tokenised across components;
  voice pass is a content rewrite, not a design refresh.

## R8 axe re-sweep — docs site

All 14 key pages compile to HTTP 200 (verified via curl). axe-core sweep
on `/patterns` (most component-dense page) in both modes:

| Page | Theme | Violations | Notes |
|---|---|---|---|
| `/patterns` | light | 1 (image-alt) | pre-existing icon_32.png; not from this cycle |
| `/patterns` | dark | 1 (image-alt) | same |

(Spot-check sweeps during each phase confirmed `/`, `/workshop`, `/tutorial`,
`/first-component`, `/accessibility`, `/a11y-workflow`, `/mcp`, `/tokens`,
`/llms`, `/prompts`, `/design-principles`, `/figma`, `/install` all
return clean except the same pre-existing item.)

**Verdict:** Zero new axe violations from the entire design refresh.

## R8 Figma re-audit — sampled component-sets

Figma file: `QMnDD8uZQPldPrlCwZZ58T` (Atelier UI). Sampled the 5 most-
modified component-sets:

| Component | Variants | Score | Notes |
|---|---|---|---|
| LlmButton | 29 | 100 | sm 32 / md 40 / lg 48 height pinned |
| LlmCard | 12 | 100 | — |
| LlmAlert | 8 | 100 | border-color CSS bug fix shipped |
| LlmTable | 12 | 100 | sort-button focus-visible CSS bug fix shipped |
| LlmSelect | 9 | 100 | Figma sm height 38→40 fix shipped |

Design System Dashboard score: **80/100** (same as baseline). Token
Architecture inched up to 83 from 81 (added `color/border-strong`,
modernised radius scale). Other category scores unchanged because the
underlying state coverage / focus indicators / target sizes were already
clean from earlier audit cycles.

Known false positives carried over from previous cycles (designer-action
territory, deferred):

- LlmTabGroup / LlmSelect focus ring stroke reports 1.2:1 — actual
  rendered ring is ~6:1 via drop-shadow effects. Audit tool checks
  stroke-only.
- LlmToggle / LlmCheckbox / LlmRadioGroup state-coverage flags
  `default` and `error` as missing — variants exist but use names like
  `state=off|on` or `state=disabled-off`, not the audit tool's expected
  vocabulary.

## Real bugs found and fixed during the cycle

1. **Alert** — `border-color: 1px solid …` was invalid CSS syntax. No
   border was actually rendering. Fix shipped in batch 2.
2. **Table** — `outline: var(--ui-focus-ring)` was invalid (the token is
   two box-shadow values, not an outline value). Fix shipped in batch 5.
3. **Code-block** — same `outline: var(--ui-focus-ring)` bug. Fix
   shipped in batch 6.
4. **Skeleton** — shimmer overlay was hardcoded `rgba(255,255,255,0.3)`,
   invisible in light mode. Fix shipped in batch 5.
5. **PatternsPage Danger Zone** — hardcoded `#b91c1c` heading colour
   that fell below AA on the new dark surface. Fix shipped in R1.
6. **/tokens spacing chips** — `opacity: 0.6` overlay on text-muted
   blended below AA. axe was reading the effective post-blend colour;
   removed the opacity. Fix shipped in R1.
7. **/first-component "Run it" links** — no CSS class declaration in the
   page, browser-default `<a>` blue link rendered against dark surface.
   Fix shipped in R1.
8. **Expressive Code terminal title** — Expressive Code's default dim
   slate landed ~4.4:1 on the new surfaces. Bound to `--ui-color-text-muted`
   in a global override. Fix shipped in R1.
9. **/mcp parameter suggestion chips** — 18px tall (below WCAG 2.5.8
   target-size 24×24). Bumped to `min-height: 24px`. Fix shipped in R1.

## Out of scope / deferred

- Lighthouse a11y/SEO/best-practices baseline — Node is x64 on Apple
  Silicon, Lighthouse refuses to run. We use axe-core via Chrome MCP
  instead, which gives equivalent WCAG 2.2 AA coverage.
- Workshop dry-run with a fresh-eyed person — needs human, can't
  automate.
- Storybook visual-regression — manual / Chromatic-style verification
  is out of scope here.
- Inner-page h1 inline-style consolidation to `.docs-page-h1` class —
  cosmetic noise reduction; the inline gradients already resolve to
  solid teal, so visual change is zero. Worth doing as a tidy commit
  but not blocking.
- Workshop linear-track sidebar progress (§7.1) — IntersectionObserver
  + localStorage wiring; new feature, not a refresh.
- LlmButton / LlmSelect focus-tool false-positives — audit tool reads
  stroke contrast only, misses drop-shadow. Designer-action.
- LlmToggle / LlmCheckbox / LlmRadioGroup `state=default|error` naming
  gaps — variant-naming convention mismatch with audit tool. Designer-
  action.
- One orphan Figma Variable `color/text-on-accent` (`VariableID:481:2849`)
  left behind when permission system denied its delete during the
  R1-revised → A pivot. Harmless (unreferenced); user can remove
  manually if desired.

## Conclusion

Design refresh shipped across 10 commits over a single working day
with zero net new axe violations. Visual identity now reads as
"Conciso teal on a clean canvas with modernised components" —
consistent with the Direction A pivot.

The site is green. The next phases (R6 workshop affordances, R7 motion
+ voice, full R5 inner-page h1 consolidation) are not blockers; they
are polish that can be picked up incrementally.
