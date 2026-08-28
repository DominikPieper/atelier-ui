---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0066-a-warning-nobody-can-clear.md (the constraint every ratchet here is shaped by)
  - plan/adr/0073-a-role-is-for-prose-not-for-a-derived-box.md (the carve-out that keeps longhand where a calc names the leading)
  - plan/adr/0074-two-roles-the-eight-did-not-span.md (the roles this record measures the reach of)
  - plan/adr/0077-an-unresolved-layer-is-an-unchecked-layer.md (the same lesson, one axis over)
  - plan/adr/0078-a-count-you-can-only-ratchet-down.md (amended here)
  - plan/adr/0079-type-does-not-need-the-painted-box.md (amended here)
  - tasks/type-role-resolution-2026-08-28.md (the analysis and the census)
---

# ADR-0080: A guard that skips is not a check

## Status

Accepted. Type is now measured rather than assumed: the two comparisons that had never
run are repaired, the per-TEXT-node facts the snapshot never carried are captured, and
every finding neither side can pay today is ratcheted against a recorded list of the
findings themselves. Amends ADR-0078 and ADR-0079, both accepted the same day, on three
points a hostile re-derivation broke: the baselines recorded counts where they had to
record identities, `--update-baseline` printed a green line over unrelated blockers, and
`check:typeface` measured a different population in Angular than in React and Vue.

## Context

### A role a human counted is not a declaration a gate can read

`grep -rn "ui-type-" libs --include='*.css'` returns **four component stylesheets**:
`atl-alert.css` (`--ui-type-body-sm`), `atl-code-block.css` (`--ui-type-code`),
`atl-textarea.css` (`--ui-type-body-md`) and `atl-toast.css` (`--ui-type-body-sm`). Three
distinct roles. `--ui-type-title`, `--ui-type-display`, `--ui-type-headline`,
`--ui-type-body-lg`, `--ui-type-label`, `--ui-type-control` and `--ui-type-action` are
referenced by **zero** — seven of the ten.

ADR-0074 minted `ty/control` and `ty/action`, justified them with "6 CSS rules" and "3 CSS
rules", bound 231 Figma nodes to them, and never wrote `font: var(--ui-type-control)` into
a single rule. The roles are real: they name combinations the library genuinely renders.
But they exist as *resolved longhand* a human counted, not as declarations any gate can
read, which is why `check:typeface`'s `font:`-shorthand branch almost never fires and why
"the CSS says ty/control" is, everywhere in the analysis, shorthand for "three longhands
resolve to the four values that role happens to name". Every measurement below had to go
through the longhands.

### Two comparisons that had never run, and the shape they share

**`inherit` produced a null, and the null was read as "nothing to compare".** `lengthOf()`
in `check-figma.js` returns `null` for `inherit` — correctly; it also answers for
`min-height`, `gap` and four padding sides, and `inherit` is not a length. That null flowed
through `boxFromDeclarations()` into `want.fontSize`, and the comparison was guarded by
`want.fontSize !== null`. `.atl-input input`, `.atl-textarea textarea` and
`.atl-select select` all say `font-size: inherit`, and all three of those cascades are
single-selector, so the guard was permanently false. **Three form fields had never had
their type measured.** Proven before the repair by setting `.atl-input`'s size to a
deliberately wrong token and watching the gate stay green at 14 warnings, exit 0.

**An exclusion justified by paint silently also excluded type.** `ROOT_PAINT` lists the
masters whose Figma root and CSS root paint the same box, and its own comment explains why
thirteen are missing: *"the paint sits on an inner box while the Figma root is a
transparent container"*. True about paint, irrelevant about text — a transparent container
still states the size and leading its text inherits. Type was resolved from that table only
because that is where the cascade happened to live, so AtlCombobox, AtlCheckbox, AtlRadio,
AtlRadioGroup, AtlToggle, AtlTable and seven more were outside a question they belonged in.

These are the same defect twice, and it is the one worth carrying forward:

> **A guard that skips on missing data is indistinguishable from a passing check.**
> `if (want !== null)` and `if (label in TABLE)` both read as care and both produce
> silence. Silence is what a green run looks like. Neither guard can be told from a
> comparison that ran and agreed — not from the exit code, not from the output, not from
> the code without tracing the data that reaches it. The only way to tell them apart is to
> break what the check exists to catch and watch it fail; ADR-0077 learned this about
> unresolved selectors and ADR-0073 about a perturbed leading, and it keeps being true.

### What nobody had counted

A read-only census of all 43 masters on the `🧩 Components` page, run for this work and
re-derived independently afterwards:

| | |
|---|---:|
| TEXT nodes | 566 |
| carrying no `ty/*` text style | 311, across 33 masters |
| on Figma `lineHeight: AUTO` | 206 |
| sourcing `fontSize` from `Docs Brand Tokens` | 212 |
| sourcing it from `Library Tokens` | 23 |
| no size binding at all | 331 |
| invisible, or inside an invisible frame | 9 |
| inside a nested INSTANCE | 57 |

None of it was capturable before: the snapshot recorded typography only as a per-variant
root summary and as layer records — 106 root entries and 160 layer records covering 189
nodes — and recorded the family, the weight, the text-style binding and the size
variable's collection for **no node at all**.

The 212 is the reason none of this is payable today. A node whose size comes from the
docs-site collection cannot be corrected 14 → 16 as a plain edit; the value is not the
master's to set. That is a separate decision nobody has written.

## Decision

### 1. Measure it, and ratchet what nobody can pay

The repairs themselves are recorded in ADR-0079 (`inherit` as a no-op plus a `ROOT_TYPE`
cascade table; four per-TEXT-node checks) and ADR-0078 (`[NO-SIZE]`, and a root decided by
name rather than by shape). This record settles the shape they share.

Every check added or repaired here ships as a **ratchet**: a committed baseline records
today's findings, the gate passes while the observed findings are exactly the recorded
ones, and it BLOCKS in both directions — when one appears that is not recorded, naming it,
and when a recorded one disappears without the baseline being updated. The update path is
`--update-baseline`, a flag on the existing script; no new npm script, and `check:all` is
untouched.

**Recorded today:** `[NO-SIZE]` 15 prose roots (accordion, card, chat, dialog, drawer —
three each, one per framework) in `tools/parity/typeface-baseline.json`;
`[FIGMA-AUTO-LEADING]` 206 nodes over 18 masters, `[FIGMA-VARIABLE-COLLECTION]` 212 over
22, `[TEXT-UNSTYLED]` 257 over 29 (after the structural exemptions and a short
pending-removal list), `[TEXT-OVERRIDE]` 4, and `[ROOT-TYPE]` 8 over 6 in
`tools/figma/type-baseline.json`.

**Why a ratchet and not the two obvious alternatives.** A plain blocker would leave
`check:all` red indefinitely: the remedy for almost every one of these findings is to
retype a node whose size binds to the wrong collection, so the data fix is gated on a
decision nobody has taken. A permanent warning is precisely what ADR-0066 threw out — *"a
warning has to be clearable"* — and 480 unclearable lines in a channel that carries 14
today would empty that channel of meaning. What ADR-0066 actually prescribed for a
population nobody can act on is *"reported as a count, with the reason inline"*, and the
ratchet's green line is exactly that: one line per check, the number, the `kind` and the
top offenders, no per-node detail. **Promotion condition:** when a check's entry reaches
zero its key is deleted; when the whole entry is gone, the ratchet goes with it and the
check becomes a plain blocker. Both baseline files say so in their own header.

Two conventions travel with it, both borrowed rather than invented. A **disappearance is a
failure**, for the reason `[STALE-EXEMPTION]` already gives about allowlist entries: an
improvement nobody records can silently reverse. And every entry carries a mandatory `why`
and a `kind` of `design` or `gap` — a bare number with no reason is ADR-0066's unclearable
exemption one abstraction up. A baseline is **not** an allowlist: `lib/allowlists.js`
answers *"this one is exempt forever"*, a baseline answers *"these are owed"*, and the same
defect must never be recorded in both.

### 2. The baseline records findings, not counts

This is the correction that matters, and it was found by breaking it rather than by
reading it. Both baselines first recorded a number per directory or per master. A number
cannot do either of the two things a ratchet exists to do.

*It cannot see a substitution.* On `check:typeface`, sizing `.atl-accordion-group` (a fix,
−1) while leading `.atl-accordion-item` prose without a size (a new defect, +1) in the same
edit left `accordion: 3` untouched — **green, exit 0**, with the new defect and the
unrecorded improvement both absorbed at once. On `check:figma`, the same trick on AtlTable
defeated `[TEXT-UNSTYLED]`, `[FIGMA-AUTO-LEADING]` and `[FIGMA-VARIABLE-COLLECTION]`,
each time with no output at all. ADR-0079 had stated the opposite — *"the three text checks
do not have this problem: they are presence tests, so a count is faithful"*. A count is
faithful to *how many*, not to *which*.

*It cannot name what is new.* A rising count printed the whole directory or the first six
findings on the master, one of which was the new one.

So `perComponent` and `perMaster` hold sorted lists. A `[NO-SIZE]` entry is a file plus a
selector, with no line numbers, so it survives churn exactly as the count was chosen to.
A Figma entry is the finding's own text, carrying the node multiplicity (`×16`) where a
deduplicated record stands for several nodes, so the node arithmetic stays exact and a
variant added to a set moves the entry rather than hiding inside it. ADR-0079 rejected
this shape as making the file unreadable "for a case nobody has hit"; the case was hit
within the hour, and the file is 571 lines — longer than a table of numbers, and the only
shape that can name what changed. It also closes, for free, the `[ROOT-TYPE]` value-change
hole that ADR-0079 disclosed as the price of counting: the measured value is part of the
finding's text, so 14-vs-16 drifting to 14-vs-18 is now two blockers.

### 3. A finding has to name one node

`text-nodes.json`'s own `meta.note` told every consumer to *"address a record by master +
path + chars"*, and `check-figma.js` built exactly that address. It is not unique: 13 keys
stand for two or three records each. `AtlButton`'s single string `Button “Button”` covers
three — 14px bound to `ty/control` and clean, 16px ×16 and 18px ×4 both on the wrong
collection — so two thirds of that finding is real debt and one third is already fixed, and
the operator cannot tell which node to open. The address is now master + path + chars +
size + weight, which is unique across all 277 records, and the note says so.

### 4. The three adapters must be measured by one rule

`check:typeface` decided a root by name in React and Vue and by *shape* in Angular, so
`:host(.atl-card-content)` counted where the byte-identical `.atl-card-content` in the
other two frameworks could not be seen. `card: 4` was `2 + 1 + 1`. A host narrowed by
another component's `.atl-*` class now answers to the same name list, the slot is out of
scope in all three, and the population is 15 — three per component, one per framework,
which is the shape a cross-framework count should have and is itself the evidence the
sixteen was wrong. In a repo whose premise is drift-gating three adapters against one
spec, a number that is not comparable across them is worse than no number.

### 5. The update path must not be able to hide anything

`--update-baseline` called `process.exit(0)` before the report ran, in both scripts. Every
ratchet message tells the reader to run it, so the documented remedy was also the command
that swallowed an unrelated `[SET-CLIPS]` or `[DESCENDANT]` blocker and printed
`✓ baseline updated` over it. It now refuses to write while any other error stands, prints
them, and exits non-zero — a baseline recorded from a broken tree records the breakage. It
is also a no-op when the population has not moved: it used to rewrite `generatedAt` on
every invocation, including the ones it itself called "no change".

## Consequences

- **Three form fields are measured for the first time**, and two real divergences fell out
  immediately: AtlInput and AtlSelect draw 14px against a 16px CSS. Six masters
  `ROOT_PAINT` excluded for a paint reason are type-checked. Every one of these was
  verified by making the CSS *agree* with Figma and watching the finding vanish — a test
  the old code could not have failed.
- **Two committed baseline files are a new maintenance surface**, 571 and 40 lines, both
  untracked-but-not-ignored so they will commit. They are the honest cost of the ratchet:
  the debt is now written down where a diff shows it moving, instead of living in an
  analysis document. They are also the thing most likely to rot — a large `--update-baseline`
  diff is easy to approve without reading, which is why the entries are sentences rather
  than numbers.
- **The ratchet still cannot see a defect nobody drew.** It compares what the snapshot
  captured; a master that stops being captured, a node type nobody probes, an axis nobody
  records are all still silence. The union-of-keys comparison closes one form of this — a
  master dropping to zero surfaces as a disappearance rather than as absence — but the
  general case stands, and it is the same lesson this record opens with.
- **Twenty-one masters run no root-type comparison at all** and nothing is printed for any
  of them; for fourteen the CSS resolves an expectation and only the absence of a single
  direct TEXT child at the Figma root keeps the guard from firing. That is the opening
  lesson recurring one level down, accepted rather than fixed because warning about all of
  them would be the unclearable warning ADR-0066 refuses — but written into ADR-0079's
  Consequences so the coverage claim cannot read wider than the measurement.
- **Nothing in Figma was touched.** Every figure here comes from read-only queries and from
  the repo's own snapshot script. The 212 wrong-collection bindings, the two roles the ten
  do not span (`ty/row`, `ty/row-sm`) and the seven masters the analysis never covered are
  recorded in `tasks/todo.md` as work, not done here.
- `figma-snapshot.mjs` now rounds leading to two decimals (56 nodes were committed as
  `164.9999976158142%`), emits `UNRESOLVED` rather than `null` for a text style whose id
  cannot be resolved — the gate skips it out of `[TEXT-UNSTYLED]` and warns instead, so an
  unresolvable style is neither counted as unbound nor silently swallowed — and
  states in its own note that only the `fontSize` variable's collection is captured — a
  bound `lineHeight` is invisible to `[FIGMA-VARIABLE-COLLECTION]`. Zero nodes exercise
  either sentinel today; both are guards, not repairs.
- `TEXT_UNSTYLED_PENDING` entries take an optional `|chars` qualifier, because AtlStepper's
  `!` badge was excused as a pictogram while AtlStep's identical `!` was counted, and
  excusing AtlStep's by path alone would have dragged its three numerals with it.
