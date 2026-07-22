---
status: accepted
date: 2026-07-22
sources:
  - tasks/figma-audit-2026-07-22.md (findings 1–3)
  - user request ("mit dem Figma-Design anfangen … was man verbessern könnte")
---

# Library Tokens: a code-generated semantic tier in Figma

## Status

Accepted.

## Context

The workspace audit (tasks/figma-audit-2026-07-22.md) found the Figma file
hosting two design systems: the docs-site brand system (a well-maintained,
mode-aware collection then named "UI Tokens") and the component library,
whose only dedicated tier was 15 single-mode Component Tokens. Consequences:

- The library's dark mode — which the code ships via `[data-theme="dark"]`
  — was structurally impossible to preview in Figma (audit Blocker).
- Token names *and values* drifted from `tokens.css` (`tx/primary #333E48`
  vs `--ui-color-text #0f172a`; no token carried `--ui-color-primary`).
- ~3500 master bindings pointed at **zombie variables**: the June-era
  `color/*` tokens had been deleted during the docs-brand rebuild but
  remained referenced by id, so the collection listed 39 variables while
  masters resolved names against ghosts.

## Decision

1. **The semantic tier for the component library is generated from code.**
   `tools/scripts/gen-figma-library-tokens.mjs` parses the canonical
   `tokens.css` (the create-workspace preset copy, same source
   `sync-tokens.mjs` projects into the libs) into variable definitions;
   the "Library Tokens" collection (Light/Dark) is created from that
   output. Code is the source of truth; the Figma values are byte-equal
   projections. Editing the collection by hand is drift by definition —
   change the CSS, regenerate.
2. **Name transformation** `--ui-<group>-<name>` → `<group>/<name>`:
   `--ui-color-text` → `color/text`, `--ui-spacing-4` → `spacing/4`,
   `--ui-radius-md` → `radius/md`, `--ui-font-size-xs` → `font-size/xs`,
   `--ui-opacity-disabled` → `opacity/disabled`, `--ui-font-family` →
   `font/family`. rem→px at the 16px root. `var()` references become
   in-collection aliases. Skipped as not simple-variable material:
   shadows (Effects), easings/durations (Motion Tokens), letter-spacing,
   z-index, the composite focus ring.
3. **Tier wiring:** masters bind to Library Tokens (or Component Tokens,
   which now alias it); the conformance gate treats
   `['Library Tokens', 'Component Tokens']` as semantic. The docs-site
   collection is renamed **"Docs Brand Tokens"** so nothing
   generic-sounding sits beside library semantics.

Alternatives considered:
- **Sync values into the existing "UI Tokens" collection** — rejected:
  that collection is the docs-site brand system with its own correct
  values and naming (`tx/*`, `area/*`); overwriting it breaks the docs
  design language, and mixing the two systems is what caused the drift.
- **Figma-first tokens, code follows** — rejected: the repo's entire gate
  architecture (ADR-0009, ADR-0019) treats the spec/code as canonical and
  projects outward; tokens follow the same direction.
- **Hand-maintain the collection** — rejected: value drift is exactly the
  failure mode being fixed; a generator makes the correct state
  reproducible.

## Consequences

- Library dark mode previews correctly in Figma for the first time
  (verified against the code's dark values). The long-open "Toast is
  drawn dark, code renders light" question dissolved: the dark drawing
  *was* the dark rendering — Toast (and Badge-default) are now bound to
  semantic tokens and correct in both modes; Toast's conformance
  allowlist entry is removed.
- 4398 bindings migrated in one pass; the zombie variables are no longer
  referenced by anything.
- Refreshing after a `tokens.css` change is currently manual (run the
  generator, apply via the Desktop Bridge, `npm run figma:snapshot`);
  extending it into a scripted sync in the figma-snapshot.mjs style is
  the natural follow-up, as is binding text nodes to the new
  `font-size/*`/`line-height/*` variables (audit finding 6) and an alias
  pass over the docs-brand literals (finding 5).
- Cross-links: refines ADR-0018 (token tiering — the "UI tier" of that
  record is now split into Docs Brand vs Library); feeds ADR-0019's gate
  (semantic-collection rename is encoded in figma-snapshot.mjs).
