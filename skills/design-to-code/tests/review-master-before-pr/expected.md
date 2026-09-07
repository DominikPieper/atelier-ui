---
mode: Review
references:
  - review-checklist.md
  - parity-codespec.md
first-tool: figma_analyze_component_set
out-of-scope: false
---

# Review mode — full PR-time review of one component

## Required surface

1. **R0 pin** in the report header (git SHA, Figma lastModified, snapshot refreshed or not).
2. **R1 Figma side:** `figma_analyze_component_set` axes vs `variantMatrix` (variant ×
   dismissible Boolean); `npm run check:figma` output quoted for AtlAlert; `figma_lint_design`
   and `figma_audit_component_accessibility` run; description names `AtlAlertSpec`;
   Inventory tile confirmed as an `INSTANCE`.
3. **Names the known false positive up front:** the page-level `wcag-color-only` lint
   flags AtlAlert's variants although the glyph layers differentiate — reported as
   known, not as a finding to fix (review-checklist.md).
4. **R2/R3 code side:** parity with declared sections; interactive pass or an explicit
   statement that it was skipped.
5. **R4 human prompts** listed for the reviewer (detach test, non-colour signal, leading,
   behaviour — Alert's dismiss behaviour and live-region politeness).
6. **Report in the architect's template shape:** priority list first, severities on every
   finding, one-line fixes.

## Regressions to flag

- Reviews without pinning the snapshot → **Critical** (ADR-0024: moved node, changed score).
- Reports `wcag-color-only` as a real Critical → **Critical** (known false positive).
- Re-derives the five `check:figma` items by hand instead of running the gate → **Warning**.
- Starts fixing the master → **Blocker** — Review reports; fixes are an architect task.
- Writes a treatise category-by-category with the Blockers buried → **Warning**.
