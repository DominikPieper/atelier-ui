---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0066-a-warning-nobody-can-clear.md (the constraint this is shaped by)
  - plan/adr/0073-a-role-is-for-prose-not-for-a-derived-box.md (the role plumbing this reuses)
  - plan/adr/0052-the-row-is-the-second-ladder.md (the leading measurement `[NO-LEADING]` cites)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the child masters that make a directory hold several roots)
---

# ADR-0078: A count you can only ratchet down

## Status

Accepted. `check:typeface` decides what a component root *is* by name rather than by
shape, which closes the hole its own comment apologised for, and adds `[NO-SIZE]` — the
missing third of the metric — judged against the recorded SET OF ROOTS in
`tools/parity/typeface-baseline.json` rather than blocked outright. Amended the same day
by ADR-0080: the baseline first shipped as a per-directory count, which a review broke in
one edit, and the Angular branch of the root test measured a population the other two
frameworks could not.

## Context

`check:typeface` enforces two thirds of a component's own metric: the typeface
(`[NO-TYPEFACE]`, `[DESCENDANT]`) and the leading (`[NO-LEADING]`, ADR-0052). The size
was never asked about. Five roots state `line-height: var(--ui-line-height-normal)` with
a comment saying *"This one carries prose, so normal"* and never state a `font-size`, so
the prose those roots lead is sized by the consuming page — the same defect ADR-0052
measured for the leading, one axis over.

Two things stood in the way of simply adding the check.

**The gate could not tell a root from a slot.** `isRootSelector` was structural: one
compound selector with no combinator. That reads as a root test but is really a *depth*
test, and the library's slot wrappers are exactly one compound deep. `.atl-dialog-content`,
`.atl-card-header`, `.atl-drawer-footer` and all twelve `.atl-combobox-*` selectors passed
it. The consequence was latent — none of those rules happens to declare a family today —
but the file's own comment already recorded the bite: *"`.atl-combobox-input` has no
combinator either, so a structural test accepted a descendant and let two comboboxes
through"*. A `[NO-SIZE]` check anchored on that predicate would have asked its question of
the wrong boxes.

**The obvious predicate does not work.** "A root that states no `font-size`, and no
descendant in the same stylesheet states one either" was measured against the corpus and
is silent on all four cases it has to catch: accordion, card, dialog, drawer and
radio-group each contain exactly one `font-size` somewhere in the file
(`.accordion-trigger`, `.atl-card-header`, `.atl-dialog-header`, `.atl-drawer-header`,
`.error-message`). On this axis `.atl-card` and `.atl-radio-group` are byte-for-byte the
same shape, and the two must come out differently: the card carries prose, the radio group
is single-line chrome that delegates its size to `.atl-radio`.

## Decision

**1. A root is decided by name.** `tools/scripts/lib/component-roots.js` holds the rule
(`.atl-<dir>`, right for 26 of the 29 directories) plus the exceptions: the directories
that render a differently-named root (`.atl-drawer-host`, `.atl-tab-group`,
`.step-item`), and the ones that hold a second root because they ship a child master too
(ADR-0062). Angular's bare `:host` keeps the structural rule — a host *is* a root by
construction — but a host NARROWED by another component's `.atl-*` class answers to the
same name list, or the two branches measure different populations (ADR-0080). Forty-three
selectors stop counting as roots and one (`.step-item`) starts; the gate's output is
unchanged, which is the point.

The list is not derived from `check-figma.js`'s `ROOT_PAINT`, even though 21 of its
entries are also recorded there. `ROOT_PAINT` describes the **painted** box and only
incidentally names the root (`AtlInput`'s cascade is `.atl-input input`), and it excludes
thirteen masters for a paint reason that has nothing to do with type. Reconciling the two is
worth doing the next time `check-figma.js` is opened; a rule-plus-exceptions list is the
shape its own `rootSelectorFor()` already uses.

**2. `[NO-SIZE]` keys off the prose leading, not off the absence of a size.** The
separator is already written in the CSS, in the token the component chose:
`--ui-line-height-normal` means *this one carries prose*, `--ui-line-height-tight` means
*single-line chrome*. A root that declares itself a prose surface and never states a size
is the defect; a root led tight is exempt by design. That keeps `.atl-radio-group` silent
in all three frameworks, and — deliberately — `.atl-tab-group` too: leading prose *tight*
is a wrong-leading defect, a different question from a missing size.

A `font:` role answers for both, as ADR-0073 established: the role carries a size, and its
`lineHeight` is read from `lib/type-roles.js` rather than re-parsed. Only rules addressing
the root are consulted — a `font-size` on `.atl-card-header` sizes that element, never the
prose the root leads. Roots are grouped per **file**, because Angular ships several
components from one stylesheet: `:host(.atl-chat-message)` is another component's host,
named in `EXTRA_ROOTS`, and answers for itself, while `:host(.size-md)` and
`:host(.atl-drawer)` are the same host narrowed. A host narrowed by an `.atl-*` class the
name list does NOT hold is a slot wrapper, not a root — `:host(.atl-card-content)` is the
Angular spelling of React's `.atl-card-content`, and the root that leads it answers for
it in all three frameworks (ADR-0080).

**3. It ships as a ratchet, not as a blocker and not as a warning.**
`tools/parity/typeface-baseline.json` records the roots themselves, per component
directory — file plus selector, no line numbers — three per directory across accordion,
card, chat, dialog and drawer: fifteen roots, one per framework per component. The gate
passes while the roots observed are the roots recorded, fails when one **appears** that is
not recorded (naming it), and fails when a recorded one **disappears** without being
re-recorded. `node tools/scripts/check-typeface.js --update-baseline` rewrites the list;
there is no new npm script and `check:all` is untouched. It records identities and not a
count for the reason ADR-0080 gives: a count is blind to substitution.

The alternatives were both rejected by ADR-0066. A permanent warning is the thing that ADR
threw out — *"a warning has to be clearable"* — and the remedy here genuinely cannot be
applied today: stating the size means deciding what it is, which redraws five Figma
masters and is blocked on the variable-collection problem recorded in
`tasks/type-role-resolution-2026-08-28.md`. A plain blocker would leave `check:all` red
until that unblocks, which is the same lesson from the other side. What ADR-0066 actually
prescribed for a population nobody can act on is *"reported as a count, with the reason
inline"*, and that is exactly the ratchet's green line. On a passing run it prints one
summary line and no per-occurrence detail.

Two conventions come with it, both borrowed rather than invented. The **drop is a
failure** for the reason `[STALE-EXEMPTION]` already gives about allowlist entries: an
improvement nobody records can silently reverse. And every entry carries the
allowlists' two-kind marker plus a mandatory `why` — a bare number with no reason is the
unclearable exemption of ADR-0066 one abstraction up, so the gate refuses a count whose
`why` is empty. A baseline is **not** an allowlist: `lib/allowlists.js` answers *"this one
is exempt forever"*, the baseline answers *"this many are owed"*. The same defect must
never be recorded in both. When a component's count reaches zero its key is deleted; when
the entry is empty, the ratchet goes and `[NO-SIZE]` becomes a plain blocker.

## Consequences

- Fifteen roots are now counted that nothing counted before, across five components in
  three frameworks — exactly three per component, which is the shape a cross-framework
  population should have and was the signal that the first, asymmetric count of sixteen
  was wrong. The four slots the analysis named — `.accordion-panel`,
  `.atl-card-content`, `.atl-dialog-content`, `.atl-drawer-content` — are covered by the
  root that leads each of them. None of those slot rules says anything about text at all
  (`.accordion-panel` states only `overflow: hidden`), so no rule-level check could ever
  have reached them; the root is the only place the question can be asked.
- `[DESCENDANT]` now fires on a slot wrapper that declares the typeface, which it did not
  before. Proven by adding `font-family` to `.atl-dialog-content` and
  `font: var(--ui-type-body-md)` to `.atl-card-content`: green before the repair, blocked
  after, green again on revert.
- **The exception list is the fragile part.** `.atl-avatar-group`, `.atl-toast-container`
  and `.atl-tooltip-wrapper` are second roots that no machine-readable source in the repo
  names, and a fourth one added later would be read as a descendant. So the
  `[DESCENDANT]` message now names the file to register it in — otherwise the repair
  trades one confusing failure for another.
- **The check is only as good as one token.** Keying off `--ui-line-height-normal` means a
  root that carries prose but states its leading as a literal, or as some other token,
  goes unseen. That is zero roots today and `check:css-tokens` already forbids the literal,
  but it is a real narrowing and is written into the code as such.
- `--update-baseline` is a new flag convention. The eleven existing `--check` flags mean
  *verify, do not write*; this one means *write, do not verify*, and it reads correctly
  against them. A generator was the wrong shape: the roots are not derivable state to be
  regenerated, they are a debt somebody has to look at when it changes.
- `--update-baseline` **refuses to write while any other typeface error stands**, and is
  a no-op — no `generatedAt` bump, no diff — when the population has not moved. Both were
  found by breaking them: with a `[DESCENDANT]` blocker in the tree the update path
  printed a green line and recorded the baseline from the broken state, and every no-op
  invocation produced a one-line timestamp diff for somebody to review (ADR-0080).
- `kind` is validated next to `why`. It was required by the gate's own error message and
  never checked, so deleting it passed and printed the literal string `undefined` in the
  green summary line.
