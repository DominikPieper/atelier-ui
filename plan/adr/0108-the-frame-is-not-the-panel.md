---
status: accepted
date: 2026-09-07
sources:
  - "tasks/figma-parity-sweep-2026-09-07.md (found and fixed both bugs this ADR gates against; states the gap this closes)"
  - "tools/scripts/check-figma.js ([ROOT-BOX]/[SET-CLIPS]/[ROOT-TYPE], whose severities and table conventions this reuses)"
  - "tools/scripts/figma-snapshot.mjs (the 2b probe this extends)"
  - "plan/adr/0107-the-master-states-the-primitive.md (the sibling expressibility family — derived values, viewport units, cancelled padding — this ADR's [ROOT-SIZE]/[LAYER-SIZE] also has to skip)"
  - "this session"
---

# ADR-0108: The frame is not the panel

## Status

Accepted.

## Context

Two real defects sat in the Figma library for months, both found the same way —
a human reading a screenshot, not a gate:

- `Overlay/AtlDialog`'s five size variants were each the code's px ÷ 1.6 — the
  master had been authored at 1rem = 10px instead of 16. Wrong across every size.
- `Overlay/AtlDrawer`'s seven variants all shared ONE 220×320 panel; only the
  outer demo frame had been resized per size, so three of four advertised sizes
  clipped or rendered blank.

`tools/figma/snapshot.json` records `variantAxes`, `variants`, `properties`,
`referencedProperties`, `iconInstanceNames`, `rootPaint`, `overlays` and
`layers` — no frame dimensions at all. `SET-CLIPS` compares the SET's frame to
the *extent* its variants reach, which catches clipping but says nothing about
whether a variant's own size is the right number. Nothing else in the gate
reads a `width` or `height` at all. Both bugs were therefore invisible to every
`check:figma` run by construction, not by an oversight in one rule.

## Decision

Capture per-variant width/height (both the variant's own frame — `rootPaint`
gains `width`/`height` — and every named descendant layer already walked by the
existing 2b probe, which already records `width`/`height` per `layers[]` entry
and needed no snapshot change), and add two BLOCKER checks against it:

- **`[ROOT-SIZE]`** — the variant's own frame, reusing `ROOT_PAINT`'s existing
  (file, cascade) table. AtlDialog's cascade grows one member,
  `.atl-dialog.size-{size}`, which states only `width` (and, for `size=full`,
  `height`/`max-width`/`max-height`/`border-radius: 0`/`margin: 0` — verified
  against the CSS that none of that perturbs `[ROOT-PAINT]`'s own fill/stroke
  comparisons: the literal `border-radius: 0` does not match
  `cssToVariable`'s `var(--ui-radius-*)` pattern, so it resolves to `undefined`
  and is skipped exactly as any non-token-expressible value already is).
- **`[LAYER-SIZE]`** — a named descendant, for masters where the frame is the
  wrong depth entirely. AtlDrawer's Figma root is a fixed 720×480 viewport
  MOCKUP: every position and size variant measures the same 720×480 (verified
  against the refreshed snapshot), because only the `dialog` panel one layer
  down actually resizes. Appending AtlDrawer's axis-scoped selector to
  `ROOT_PAINT`'s cascade was tried first and rejected — it would have compared
  the descendant's width against the constant-720 root and fired on every
  variant, a false positive caught before it shipped rather than after. A
  five-line dedicated table (`SIZE_LAYER_CASCADES`), not a second axis-selector
  shape taught to the general `[LAYER-PAINT]` engine (whose cascade-builder
  only ever constructs a single-axis `.is-<value>` class, never a compound
  `.position-<p>.size-<s>` one) — the same call `ROOT_PAINT`'s own comment
  makes for why this cascade does not live there either.

**Depth needed: two.** A rule that reads only the variant's own frame would
have caught AtlDialog and missed AtlDrawer outright — the frame was never
wrong, the panel inside it was. Cost: two numbers added to an existing,
already-captured object (`rootPaint`) per variant across ~43 masters (a few
hundred numbers, immeasurable against the snapshot's existing size); the
descendant layer needed *no* new capture at all, since `layers[]` already
recorded `width`/`height` per named part before this check existed.

**What counts as comparable.** `min-height: var(--ui-control-height-md)` and
`width: 20rem` resolve through the same `lengthOf()`/`resolveLength()` this
file already had. `width: min(36rem, 90vw)` needed one new function,
`resolveSizeValue()`: when exactly one operand of a two-argument `min()`/`max()`
resolves to a fixed length and the other does not (a viewport unit or a
percentage), the fixed operand IS the design value — the vw/dvh term is a
runtime floor, not a second design intent, and a static Figma canvas can only
draw one number. `100vw`/`100dvh` alone (Dialog's `size=full`, Drawer's
cross-axis) still resolve to `null` and are silently skipped, the same
contract `lengthOf()` already had for `auto`/`%`. `width: 1.25rem` needed
nothing new. No SIZE comparison requires a Figma Variable binding — unlike
`[ROOT-BOX]`'s padding, a frame's width is a raw drawn number in this file by
convention, so "unbound" is not itself a finding here; only "wrong number" is.

**Severity: BLOCKER**, matching `[SET-CLIPS]` and unlike `[ROOT-BOX]`'s
WARNING. `[ROOT-BOX]` warns because ADR-0107 already decided six masters'
padding drift is undecidable-by-gate (some derived values have no Figma
equivalent at all) — genuine, permanent ambiguity. A wrong width has none:
Figma can type an exact number, the CSS states an exact number, and a mismatch
is never advisory. It is exactly `[SET-CLIPS]`'s own reasoning — "AtlDialog was
360x170 around 800x1111... nothing measured it" — one property over: a wrong
dimension misleads every designer who opens the file, the same way a clipped
variant does.

Rejected: **ratchet like `[ROOT-TYPE]`.** That debt is ratcheted because it is
structurally blocked — the wrong-variable-collection problem has to be solved
first, or fixing type role-by-role would only relabel it. A wrong width has no
such blocker: Figma lets a frame be typed directly, so there is nothing standing
between "found" and "fixed" except doing it.

## Consequences

- Ran against the live file (refreshed twice, independently, to rule out a
  fluke): AtlDialog and AtlDrawer are both silent — the fixes already
  committed under `tasks/figma-parity-sweep-2026-09-07.md` hold exactly. Proven
  by construction, not merely by absence of a finding: dividing AtlDialog's
  captured widths by 1.6 and forcing AtlDrawer's `dialog` layer to 220×320
  reproduces both historical bugs' exact numbers and fires `[ROOT-SIZE]` /
  `[LAYER-SIZE]` with them; restoring the real snapshot goes silent again.
- **`[ROOT-SIZE]` found a third, real, previously-unknown defect on its first
  live run**: `AtlAvatar`'s `size=xl` (both `shape=circle` and `shape=square`)
  is 56×56 in Figma against `.atl-avatar.size-xl { width: 64px; height: 64px; }`
  — a plain literal, not a token or a `calc()`. `xs`/`sm`/`md`/`lg` all match
  their code exactly (24/32/40/48), so this is one size drawn 8px small on both
  shapes, not a systemic scale error. Allowlisted
  (`AtlAvatar:root-size:width`/`:height`, `tools/scripts/lib/allowlists.js`) as
  a `gap`, not a `design` call — nothing says 56 is intentional — because this
  pass is read-only in Figma and fixing it means a Figma edit, out of scope
  here. Tracked in `tasks/todo.md`.
- `figma-snapshot.mjs`'s `rootPaint` fact gains two fields per variant
  (`width`, `height`); every other consumer of `rootPaint` is unaffected (they
  read `pad`/`gap`/`fill`/`stroke`/`radius`/`fontSize`/`lineHeight`, none of
  which changed shape).
- The next master whose bug looks like AtlDrawer's — right master, right
  variant, wrong descendant — gets one line in `SIZE_LAYER_CASCADES`, not a
  rewrite of `[LAYER-PAINT]`'s cascade engine.
