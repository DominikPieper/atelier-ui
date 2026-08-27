---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md (the rule, in its sixth home)
  - plan/adr/0057-the-icon-set-was-text-in-figma-too.md (the icon library these instances come from)
  - plan/adr/0068-a-parent-can-only-instantiate-what-the-child-can-express.md (the probe rule this extends)
---

# ADR-0069: The illustration beside the master

## Status

Accepted. Adds `[PAGE-GLYPH]` to `check:figma` and replaces the five pictograms that
lived where no check could reach them.

## Context

The glyph rule has now been applied in six places: a string map (ADR-0050), component
templates (ADR-0055), the Figma Icons page and fifteen masters (ADR-0057), embedded in
prose inside a master (ADR-0058, `‹ Prev`), and the four content samples (ADR-0060). Each
time the rule was the same and only the *hiding place* was new.

The sixth hiding place is the illustration frame that sits **beside** a master. The
Components page holds, next to the masters themselves, sketches that show a component in
context: an open dropdown next to AtlSelect, a toast container next to AtlToast, a
trigger button next to AtlMenu. `[MASTER-GLYPH]`'s probe walks COMPONENT and
COMPONENT_SET nodes, so none of it was ever read.

Six glyphs were there. Five stood in for icons the library ships (`✓`, `ℹ`, `✕` twice
over, and `▾`), and one — `→` inside the AtlAvatar caption *"fallback:
image→initials→icon"* — is punctuation in prose.

One of the five was `"Actions ▾"`: a label with an **embedded** pictogram, which is
exactly the shape that hid `‹ Prev` for months, because a whole-string test cannot see it.

## Decision

**1. `[PAGE-GLYPH]` reads every text node on the Components page that no COMPONENT,
COMPONENT_SET or INSTANCE owns.** A finding is a WARNING rather than a blocker: an
illustration is not the transfer target. It is reported anyway, because an illustration is
what a designer copies.

**2. The five became icon instances**, each carrying the glyph's own colour so the
illustration keeps its meaning: `✓` → `Icon/check`, `ℹ` → `Icon/info`, `✕` →
`Icon/close`, `▾` → `Icon/chevron-down`. `"Actions ▾"` was split into the label
`"Actions"` plus a chevron instance, the way the code renders a trigger.

**3. The exemption lives in the allowlist, keyed on the character.** There is no
description to write it into — a caption belongs to no master — so `page:glyph:→` carries
the reason that an arrow inside prose is punctuation and not a pictogram any component
renders. `[STALE-EXEMPTION]` (ADR-0068) confirms the entry is consulted, so it cannot rot
into a dead excuse.

## Consequences

- `check:all` exits 0 with 12 advisory warnings. Verified by injecting a `★`: the check
  reports it with its location and both remedies.
- **The rule was never wrong; the reachable set kept being smaller than it looked.** Six
  applications, six hiding places, and each new one was found by a change of scope rather
  than by a change of rule: walking masters, then their prose, then plain frames on the
  page. The remaining known gap is a glyph typed as an instance **override**, which
  ADR-0068's skip made invisible and which is recorded rather than closed.
- **A whole-string test cannot see an embedded pictogram**, and this is the second time
  that exact hole produced a finding — `‹ Prev` in a master, `Actions ▾` on the page. The
  per-master probe learned it in ADR-0058; the page-level one was written knowing it.
