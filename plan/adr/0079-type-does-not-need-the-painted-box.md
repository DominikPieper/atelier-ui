---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0066-a-warning-nobody-can-clear.md (the constraint the ratchet is shaped by)
  - plan/adr/0078-a-count-you-can-only-ratchet-down.md (the ratchet convention this reuses)
  - plan/adr/0073-a-role-is-for-prose-not-for-a-derived-box.md (the perturbation test that caught the same class of hole)
  - plan/adr/0064-what-the-parity-stamp-rests-on.md (the amendment that gated root typography)
  - plan/adr/0030-library-tokens-collection.md (which collections are semantic)
  - tasks/type-role-resolution-2026-08-28.md (the census these counts come from)
---

# ADR-0079: Type does not need the painted box

## Status

Accepted. `check:figma` compares a master's root typography from its own cascade rather
than from the paint table, which repairs a comparison that had been structurally dead for
three masters and brings six more into the gate; and it records four per-TEXT-node defects
against a ratchet baseline in `tools/figma/type-baseline.json` rather than reporting them.
Amended the same day by ADR-0080: the baseline first shipped as per-master COUNTS, and a
review showed every one of the five checks going green on a substitution — a new defect
hidden by a fixed one — which this record had claimed the text checks were immune to.

## Context

Three separate holes, all in the same axis, all invisible.

**The font-size comparison could not see through `inherit`.** `lengthOf()` returns `null`
for `inherit` — correctly, because `inherit` is not a length and the same helper answers
for `min-height`, `height`, `gap` and four padding sides. But `boxFromDeclarations()` fed
that `null` straight into `out.fontSize`, and the comparison in `checkRootPaint()` was
guarded by `want.fontSize !== null`. `.atl-input input`, `.atl-textarea textarea` and
`.atl-select select` all say `font-size: inherit`, so all three guards were permanently
false and none of the three masters had ever had its type measured. Proven before the
repair by setting `.atl-input`'s size to a deliberately wrong token: the gate stayed green,
14 warnings, exit 0.

The analysis that found this proposed a one-line fix — prepend the component root to the
cascade so `inherit` has something to inherit from. **Measured, that does nothing.**
`boxFromDeclarations` walks the joined body in source order and `case 'font-size'`
overwrites unconditionally, so the root's 16px is set first and then clobbered back to
`null` by the leaf's `inherit`. The two halves are not alternatives: prepending the root
alone reproduces the baseline byte for byte, making `inherit` a no-op alone reproduces the
baseline byte for byte, and only both together produce a comparison.

**The paint table was excluding masters from a question about text.** `ROOT_PAINT` lists
only masters whose Figma root and CSS root paint the same box, and its own comment says
why thirteen are absent: *"the paint sits on an inner box while the Figma root is a
transparent container"*. That is a true statement about paint and an irrelevant one about
type — a transparent container still states the size and leading its text inherits. Type
was being resolved from the paint table purely because that was where the cascade happened
to live.

**Nothing looked at individual TEXT nodes at all.** A census of the 43 masters found 566
TEXT nodes, of which 311 carry no `ty/*` text style, 206 sit on Figma AUTO leading, and 212
bind their size to `Docs Brand Tokens` — the docs-site collection that ADR-0030 renamed and
explicitly excluded from what a component may bind to. The snapshot could not see any of
it: it recorded typography only as a per-variant root summary, and only when a variant had
exactly one direct TEXT child.

## Decision

**1. `inherit` is a no-op in `boxFromDeclarations`, and type gets its own cascade table.**
`ROOT_TYPE` sits beside `ROOT_PAINT` with sixteen entries and the same shape. Its cascades
are ancestor-first and include the rule the leaf inherits *from*, which is what makes the
`inherit` repair bite. A label with no `ROOT_TYPE` entry falls back to its `ROOT_PAINT`
cascade, so the thirty are not restated — and the fallback is load-bearing rather than
tidy: writing the loop over `ROOT_TYPE` alone would silently drop type checking for the
twenty-six masters only `ROOT_PAINT` names, including AtlAvatar, the master ADR-0064
wrote the comparison for.

The root is put into `ROOT_TYPE`'s cascade and **not** into `ROOT_PAINT`'s. Both would make
`inherit` resolve; only one avoids feeding a root's background, border and padding into
comparisons about none of those.

**2. The fix is smaller than the analysis claimed, and the ADR says so.** Eight findings
across six masters: AtlInput and AtlSelect draw 14px against a 16px CSS, AtlCheckbox and
AtlToggle the same plus AUTO leading against 125%, AtlRadio and AtlRadioGroup the leading
alone. AtlTextarea, AtlMenuItem and AtlTable move from *unchecked* to *checked and passing*.
But **only five of the thirteen masters `ROOT_PAINT` omits gain anything**: AtlCombobox,
AtlProgress, AtlBreadcrumbs, AtlPagination, AtlStepper, AtlAvatarGroup and AtlChat have no
single direct TEXT child at their root, so the snapshot records no root type for them and
nothing is compared. AtlCombobox's fifteen unstyled nodes are a *layer* problem, not a root
problem, and this change does not touch them. Claiming otherwise would repeat the
overclaim the analysis makes.

**3. Four per-TEXT-node checks, all recorded, none reported.** `[FIGMA-AUTO-LEADING]` (206
nodes), `[FIGMA-VARIABLE-COLLECTION]` (212), `[TEXT-UNSTYLED]` (257 after exemptions) and
`[TEXT-OVERRIDE]` (4). The collection rule is stated as *the library's own tiers are the
only legal source* — the `Library Tokens` / `Component Tokens` pair ADR-0030 made semantic —
and not as a list of villains, so a fourth collection added tomorrow is caught by the same
line. It has to be a collection test and not a name test: `font-size/sm` exists in both
collections, so the name distinguishes nothing.

`[TEXT-UNSTYLED]`'s exemptions are **structural, not a list of node ids**. A node with an
INSTANCE between it and the variant root is skipped because the master owns the type; an
invisible node is skipped because it is on no surface. The one exception is a short named
list of scenery and glyphs, and it lives in `check-figma.js` rather than in
`lib/allowlists.js` because none of it is exempt *forever* — every entry names something
that should stop existing. An entry that excuses nothing warns, the same rule
`[STALE-EXEMPTION]` applies one level up.

The override case is counted apart rather than folded in: those four nodes read as unbound
because a local override *detached* them from a style their master does state. That is the
opposite defect, it is unblocked today, and it should reach zero first.

**4. All five ship as ratchets, reusing ADR-0078's convention unchanged.** Same file shape
(`meta.note` + `checks.<TAG>.{kind, why, perMaster}`), same `--update-baseline` flag, same
mandatory `why`, same rule that a **disappearance** is a failure. `perMaster` holds the
findings themselves and not a number, for the reason ADR-0080 records; each entry carries
its own node multiplicity (`×12`), so a deduplicated record still contributes every node
it stands for. The baseline lives at
`tools/figma/type-baseline.json`, beside the Figma facts it counts, as `typeface-baseline.json`
lives beside the gate artifacts.

Ratcheted and not reported because the remedy is genuinely unavailable: correcting a
master's size means rebinding a variable that comes from the wrong collection, which is
`[FIGMA-VARIABLE-COLLECTION]`'s own debt. Fixing the leading or the style first would only
relabel the problem. ADR-0066 refuses a warning nobody can clear, and a plain blocker would
leave `check:all` red until that is decided. What ADR-0066 actually prescribed for a
population nobody can act on is *"reported as a count, with the reason inline"* — five
lines on a green run, no per-node detail.

## Consequences

- A comparison that had been dead since it was written now measures three masters, and two
  real divergences fall out of it immediately. Proven by making the CSS *agree* with Figma
  and watching the finding vanish — a test the old code could not have failed.
- Six masters that `ROOT_PAINT` excluded for a paint reason are type-checked for the first
  time. Seven more are named as still unreachable rather than quietly counted as covered.
- **Twenty-one of the 43 masters run no root-type comparison at all, and nothing is
  printed for any of them.** For fourteen the CSS cascade *does* resolve an expectation and
  the comparison is skipped only because the Figma root has no single direct TEXT child, so
  `got.fontSize` is null and both guards short-circuit — the same shape of silence this ADR
  was written to remove, one level down. Six are named above; the eight that were not are
  AtlAccordionGroup, AtlCard, AtlCodeBlock, AtlDialog, AtlMenu, AtlSkeleton, AtlTabGroup and
  AtlToast, and two of those resolve a real size that is never checked (AtlMenu 16px,
  AtlToast 14px). AtlMenuSeparator is in neither table and is never visited. No code change:
  warning about all of them would be the unclearable warning ADR-0066 threw out. The point
  of writing it down is that the coverage claim must not read wider than the measurement.
- **A count could not see a substitution, and this record first claimed otherwise.** The
  paragraph that stood here said `[ROOT-TYPE]` had the hole and that *"the three text
  checks do not have this problem: they are presence tests, so a count is faithful."* A
  count is faithful to *how many*, not to *which*, and a review broke all five in the
  simplest way: on AtlTable, giving one unstyled node a `ty/*` style while removing one
  from a bound node left the number flat and the gate exited 0 with **no output at all**.
  The same held for AUTO leading and for the wrong collection. The rejected alternative —
  recording each finding's text — is what shipped instead (ADR-0080): the baseline is 571
  lines, which is longer than a table of numbers and is the only shape that can name what
  is new. It also closes the `[ROOT-TYPE]` value-change hole as a side effect, because the
  measured value is part of the finding's text.
- **`ROOT_TYPE` is a second hand-maintained table about a generated thing**, which is what
  ADR-0070 and ADR-0072 warn rots. It is defensible only because it is small, because 27 of
  43 masters need no entry, and because the mechanical alternative — deriving the ancestor
  from `cascade[0]` by regex, as `rootSelectorFor()` does — is wrong for `[role='option']`
  and unverifiable for `.atl-drawer-host dialog`.
- Seven fallback labels resolve to no type at all and stay **silently** unchecked. Six are
  legitimate delegation to a parent master; the seventh, AtlDrawer, is a CSS defect —
  `.atl-drawer-host dialog` states nothing typographic through `all: unset`. Warning about
  all seven would be six-sevenths unclearable, which is precisely what ADR-0066 threw out,
  so AtlDrawer is recorded in `tasks/todo.md` instead.
- The gate now reads **two** committed artifacts and fails loudly when their `generatedAt`
  stamps disagree. They are written by one run, and a gate reading one against the other is
  counting a document that no longer exists in that shape.
- `--update-baseline` **refuses to write while any non-ratchet BLOCKER or CRITICAL
  stands**, and prints it. It first did the opposite: `process.exit(0)` inside
  `settleRatchets()` ran before `report()`, so the command every ratchet message tells you
  to run was also the command that swallowed an unrelated `[SET-CLIPS]` blocker and printed
  `✓ baseline updated` over it (ADR-0080). The sibling `check-typeface.js` had the same
  shape and got the same repair.
- The green summary line is derived from what was **observed**, not from the file. It used
  to read the recorded numbers, so on a red run it said a count was "at the recorded
  baseline" two lines under the blocker reporting that it is not.
- `TEXT_UNSTYLED_PENDING` entries take an optional `|chars` qualifier. Keyed on the path
  alone, AtlStepper's `!` badge could be excused as a pictogram while AtlStep's identical
  `!` was counted, and excusing AtlStep's by path would have dragged its three numerals —
  which the comment right there says are text — along with it.
- `SEMANTIC_COLLECTIONS` duplicates a pair that `figma-snapshot.mjs` also hardcodes. The two
  are not shared because the snapshot runs inside the Figma sandbox and imports nothing from
  the repo. Worth reconciling when a third caller appears, not before.
- ADR-0078 was taken by the sibling `check:typeface` work landing the same day, so this is
  0079, and ADR-0080 is the review that amended both. `tasks/type-role-resolution-2026-08-28.md`'s
  "recommended order of work" still names 0078 and 0079 for the role inventory and the
  variable-collection decision; both remain unwritten and will take the next free numbers.
