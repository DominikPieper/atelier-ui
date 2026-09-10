---
status: accepted
date: 2026-09-09
sources:
  - tasks/schulung-content-review-2026-09-08.md (§ Gegenprobe — Codex, 2026-09-09, finding G4)
  - tools/scripts/sync-tokens.mjs
  - tools/scripts/gen-artboard-palette.mjs
  - tools/scripts/gen-figma-library-tokens.mjs
  - tools/scripts/figma-sync-library-tokens.mjs
  - tools/scripts/check-css-tokens.js
  - tools/scripts/check-primitives.js
  - plan/adr/0018-figma-token-tiering-and-css-projection.md
  - plan/adr/0030-library-tokens-collection.md
  - plan/adr/0104-two-directions-one-file-selection-rule.md
---

# ADR-0115: The source is an axis, not a file

## Status

Accepted.

## Context

Four documents each called a different file "the source of truth" for design tokens:

- `docs/src/pages/index.astro:81` — "Single source of truth for tokens and component
  frames. Variables sync to `tokens.css`" (implies Figma → code, automatic).
- `plan/figma.md`'s "Design Token Change" workflow — edit the Figma Variable first, then
  hand-copy the value into `libs/angular/src/styles/tokens.css`, then mirror to
  `libs/react/src/styles/tokens.css` (omits Vue entirely).
- `skills/figma-workspace-architect/references/code-sync.md` — "currently kept in sync
  manually … ongoing changes happen on whichever side the contributor is in."
- `skills/artboard-bridge/references/palette-mapping.md` — names
  `libs/create-workspace/src/generators/preset/files/styles/tokens.css` as "the token
  source of truth per `sync-tokens.mjs`."

A contributor changing one color cannot tell which file to edit or what propagates from
it. The four documents disagree because they answer four different questions and treat
each answer as if it were the whole one. Read as ground truth — the gates and the
scripts they run, not the prose — there is no single "source of truth" file. There are
four independent axes of ownership, each with its own owner and its own gate:

1. **Visual decision authority** — Figma's `Components` page master `COMPONENT_SET`s
   (`AGENTS.md`). A designer's decision about what a component looks like and its variant
   matrix. Not code-generated, not gated by any token script.
2. **Token *value* authority** — `libs/create-workspace/src/generators/preset/files/styles/tokens.css`.
   Hand-edited; every other `tokens.css`-shaped file in the repo is a generated,
   byte-identical projection of this one (both `sync-tokens.mjs` and
   `gen-figma-library-tokens.mjs` call it "the canonical tokens.css" in their own
   comments).
3. **API / behavior authority** — `libs/spec/src/index.ts` (pre-existing, `AGENTS.md`).
   Component props, variants and events; drift-gated across the three framework libs.
   Restated here only as the fourth axis this map needed to name, not re-decided.
4. **Generated projections of axis 2**, each with its own script and gate:
   - `libs/{angular,react,vue}/src/styles/tokens.css` and
     `skills/atelier-design/assets/colors_and_type.css` ← `tools/scripts/sync-tokens.mjs`,
     gated by `npm run check:tokens` (`sync-tokens.mjs --check`), inside `check:all`.
   - `docs/src/styles/tokens.css` is not a copy at all — it `@import`s the React
     projection live, so it can never drift independently of axis-4's first row.
   - `tools/design/artboard-palette.css` ← `tools/scripts/gen-artboard-palette.mjs`,
     gated by `npm run check:artboard-palette`, inside `check:all`. From there it is
     pasted by hand into a Claude Design artboard's `_sheet.css` (`artboard-bridge`
     Publish, step P2) — the MCP session is interactively authenticated, so an unattended
     script cannot reach it; this hop is manual by necessity, not by neglect.
   - Figma's `Library Tokens` Variable collection ← `gen-figma-library-tokens.mjs` +
     `figma-sync-library-tokens.mjs` (`npm run figma:sync-tokens`), **code → Figma**,
     one-way (ADR-0030). Hand-triggered — it needs Figma Desktop with the Bridge plugin
     open — and **not** part of `check:all`. This is the inverse of what
     `index.astro` claimed: nothing pulls a Figma-side edit back into code; editing the
     Variable directly in Figma is drift by definition (ADR-0030's own Decision §1).
5. **Usage discipline over axis 2**, not a value authority of its own:
   `check:css-tokens` (no raw color literal in component CSS; no `--ui-*` read that axis 2
   doesn't declare) and `check:token-tiers` (component CSS may only reference the
   semantic tier, never a primitive, per ADR-0018). These gates constrain how component
   CSS may *use* the values axis 2 declares; they own no value themselves.

## Decision

Adopt this five-row ownership map as the answer to "what is the source of truth for
tokens" in this repo, and make every document that answers that question point at this
ADR (and, through it, at the gate that actually enforces each row) instead of restating
its own version of the answer:

- `docs/src/pages/index.astro` — corrected to state Figma's actual role (visual frames /
  variant matrix) and the real push direction (code → Figma), not an automatic
  Figma → `tokens.css` sync that does not exist.
- `plan/figma.md`'s "Design Token Change" workflow — rewritten to start at axis 2 (the
  canonical file), run `sync:tokens` (which now covers all three frameworks plus the
  `atelier-design` skill asset — the missing-Vue defect is gone because the propagation
  is generated, not hand-copied), and treat the Figma push as the optional, one-way,
  gate-free step it is.
- `skills/figma-workspace-architect/references/code-sync.md` — its generic
  direction-picking guidance (§"Pick a direction first", the four approaches) needed no
  change; its repo-grounding "Project-level notes" section, however, turned out to
  predate ADR-0030 itself (it still named the superseded `UI Tokens` collection and
  described the sync as bidirectional/manual by convention) and has been corrected to
  match ADR-0030 and the live gates, with a pointer to this ADR for the full map. This
  is a wider fix than "cross-reference only" and is called out here because the
  assumption that this file was already correct did not hold on inspection.
- `skills/artboard-bridge/references/palette-mapping.md` — already correctly named axis 2
  and axis 4's artboard row; it gets a one-line pointer to this ADR and no content change.

## Consequences

- A change to a token's value now has one documented entry point (axis 2) and one
  documented verification chain (`check:tokens`, then `check:artboard-palette` if an
  artboard needs it, then optionally `figma:sync-tokens`), instead of four documents each
  describing a different one.
- This map creates no new gate. Nothing fails CI if a future document invents a sixth
  "source of truth" claim; enforcement is the existing five gates/scripts above plus
  reviewer discipline pointing new claims at this ADR. That is this decision's weakest
  point: it is a documentation convention, not a check, and would need a
  grep-shaped gate (in the style of `check:skill-discovery`'s `UNDISTRIBUTED_SKILLS`
  list) to become self-enforcing — not built here, since the task was corpus
  consistency, not a new gate.
- Two corrections adjacent to this map but not decisions of their own (recorded here per
  this ADR's own scope note, not as separate ADRs): `plan/design-principles.md`'s
  `scale(0.97)` / hover-lift rule and `plan/figma.md`'s locked "`Inter`" text-style claim
  both contradicted measurement (no component transforms on hover/press in any of the
  three framework libs; the brand typeface moved to Instrument Sans / Instrument Serif /
  JetBrains Mono under ADR-0035) and have been corrected in place.
