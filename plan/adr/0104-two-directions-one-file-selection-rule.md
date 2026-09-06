---
status: accepted
date: 2026-09-06
sources:
  - "plan/adr/0024-design-parity-persistence-gate.md (§2 already states the principle this implements: the hash covers what figma_check_design_parity was measured against)"
  - "plan/adr/0035-typography-instrument-pair.md (Consequences: named the token-sheet gap this closes, and deferred the fix here)"
  - "this session"
---

# ADR-0104: Two directions, one file-selection rule

## Status

Accepted. This **implements** ADR-0024 §2, it does not revise it: §2 already says the
`inputsHash` must cover "what the score was measured against"; the code in
`tools/scripts/lib/parity-inputs.js` simply fell short of its own stated principle, in
two directions at once. Nothing in ADR-0024's Decision or Consequences was wrong —
`check-parity.js`'s severities, its offline `--report` mode, and the score's removal
(2026-08-26 amendment) are all untouched. Also closes a named gap: ADR-0035's
Consequences section flagged that the gate was "blind to" a repo-wide token-sheet
change and recorded the gap in `tasks/todo.md` for a later session. This is that
session.

## Context

`inputFiles()` in `parity-inputs.js` walks every file under
`libs/{angular,react,vue}/src/lib/<module>/` with no further filtering, then
`computeInputsHash()` hashes the lot. Two things followed from that, in opposite
directions:

1. **Too narrow a definition of "changed", inside the walk.** A component directory
   also holds its `*.spec.ts(x)` and `*.a11y.spec.ts(x)` test files. Storybook never
   renders them — `figma_check_design_parity` measures the implementation, CSS and
   story, not the test suite — but the walk hashed them anyway. A comment-only edit
   to a spec file moved the hash exactly as far as a real markup change, producing a
   **false DRIFT**.
2. **Too narrow a definition of "changed", outside the walk.** Every story in every
   framework's Storybook loads one more file that the walk never touched:
   `libs/{fw}/src/styles/tokens.css`, side-effect-imported by
   `libs/{fw}/.storybook/preview.{ts,tsx}` (`import '../src/styles/tokens.css'`,
   verified by reading all three files directly — **not** `preview-head.html`, which
   only loads Google Fonts and a `font-family` fallback rule; that was the original
   hypothesis and it was wrong on the specific mechanism, right on the conclusion).
   ADR-0035 changed this file's typeface tokens across all three frameworks and
   triggered **no DRIFT for any of the 29 components it visibly changed** — a
   **false clean**, the mirror image of (1).

Both are the same underlying mistake: the hash was never actually "every file
Storybook renders for this component" — it was "every file that happens to sit in
the component's own directory", which both over-counts (tests) and under-counts
(the shared token sheet) relative to what ADR-0024 §2 asked for. Narrowing and
widening are not two competing fixes to choose between; they are the one
correction that rule needed.

**Which copy of `tokens.css` to hash** needed its own check, because there are four
byte-identical copies today (`check:tokens` / `sync-tokens.mjs --check` enforces
that): the create-workspace *seed* at
`libs/create-workspace/src/generators/preset/files/styles/tokens.css`, and the three
per-framework copies at `libs/{fw}/src/styles/tokens.css`. The seed is never loaded
by Storybook — it exists to scaffold new workspaces. The file each framework's
`preview.{ts,tsx}` actually imports is the per-framework copy. Hashing "the thing
that was rendered" therefore means the per-framework copy, not the seed, even though
today they are identical — the hash should still mean what it says if `check:tokens`
were ever red.

## Decision

`parity-inputs.js`:

- `walkFiles()` skips any entry matching `/\.spec\.tsx?$/i` (covers `.spec.ts`,
  `.spec.tsx`, and the `.a11y.spec.*` variant, since it shares the same tail).
- `inputFiles()`, for each framework whose module directory exists, additionally
  pushes that framework's `libs/{fw}/src/styles/tokens.css` onto the file list
  before hashing.

One hash, no new field, no new gate logic — `check-parity.js` and the record shape
in `tools/figma/parity.json` are unchanged; only the file *set* `computeInputsHash`
walks moved.

### The separate half: `figmaLastModified` (informational, not gated)

A parity record stores `figmaNodeId`, `verifiedSha` and `inputsHash` — nothing about
the Figma *master's* own state. No content hash over the *code* side can ever fix
that: `check-parity.js` is deliberately fully offline (ADR-0024), and the only place
that knows anything about Figma's timeline is `tools/figma/snapshot.json`'s
`meta.figmaLastModified`, populated by a live bridge call in `figma-snapshot.mjs`
(currently `null` there — a separate, already-open gap, see ADR-0019/ADR-0034's
promotion notes and `tasks/review-state-2026-08-26.md`).

`parity-record.mjs` now copies that same field through onto each record it writes,
verbatim, `null` included. This costs nothing extra: the snapshot file is already
read at that point to resolve `figmaNodeId`. It is **purely informational** —
`check-parity.js` reads nothing from it and gates nothing on it, on purpose. It
only becomes meaningful once the separate `figmaLastModified`-in-the-snapshot gap
is closed; until then a record simply carries forward whatever the snapshot had.
The field is additive: its absence on the 37 pre-existing records is expected, not
an error, and no code path treats a missing key as a fault.

## Migration and its result

The 37 records reduce to 6 distinct `verifiedSha` values. For each, the corrected
rule was replayed offline against the historical tree via `git show <sha>:<path>`
(and `git ls-tree`/`git cat-file -e` to enumerate what existed at that sha), and
each record's `inputsHash`/`inputs` were recomputed — **with one exception below.**

**One of the six `verifiedSha` values is dangling.** `25ac006` (recorded for 10
components: AtlCheckbox, AtlCombobox, AtlInput, AtlMenu, AtlMenuItem, AtlPagination,
AtlRadio, AtlRadioGroup, AtlTextarea, AtlToggle) is **not an ancestor of `HEAD`**
(`git merge-base --is-ancestor 25ac006 HEAD` fails; `git branch --all --contains`
and `git log --all` find no ref reaching it). The object is still present locally
and `git show` against it does not error, but `git rev-parse --short HEAD` only
ever records the last *commit*, not the working tree at record time — and for at
least 3 of the 10 (AtlCombobox, AtlRadio, AtlRadioGroup) the two provably disagree:
their **originally recorded** `inputsHash` matches the *current* working tree under
the old rule, while `25ac006`'s own committed tree does not contain the change
(an added invalid-state icon in `atl-combobox.ts`/`atl-radio.ts`) that the current
tree does. The only explanation is that the working tree had uncommitted changes
beyond `25ac006` at the moment `parity:record` ran, later folded into a different
commit (`7ca3ffe`, same message, amended forward with only `CHANGELOG.md`/
`package.json` version-bump differences from `25ac006` — so even that near-miss
doesn't recover the missing content for these three). Reconstructing "what was
rendered" from an unreachable commit is not something a content hash can paper
over, so these 10 records were **left with their original, unmigrated
`inputsHash`/`inputs`** rather than a fabricated reconstruction — a real
`figma_check_design_parity` + `parity:record` re-run is the honest fix for them,
not a script. They now show DRIFT unconditionally, correctly, if for the blunter
reason that their recorded file *set* no longer matches the rule at all.

**The other 27 records** (verified at `3c15080`, `4c57b74`, `51d2d9d`, `560bd9e` or
`e4f61ca` — all confirmed ancestors of `HEAD`) were migrated with confidence.

**Measured result — `npm run check:parity --report`, DRIFT count:**

| | before | after |
|---|---|---|
| all 37 | 32 | 37 |
| the 27 migrated (real `verifiedSha`) | 25 | 27 |
| the 10 left alone (dangling `verifiedSha`) | 7 | 10 |

**The count did not drop. It rose.** Read literally against the task's own test —
"if the number does not drop, something about the diagnosis is wrong" — this
deserves the scrutiny that sentence asks for, so here is the decomposition, not an
adjustment to make the number look better:

- Of the 27 migrated records, **17** have a real, non-spec, non-test code change
  since their `verifiedSha` (a real edit to the component's own implementation/
  CSS/story) — DRIFT before and after, correctly, on both rules.
- **0** records' *only* divergence from their recorded state was a spec-file edit.
  If that were the whole story, narrowing alone would have cleared them.
- **8** records have *both* a spec-file edit *and* a genuine `tokens.css` change
  since their `verifiedSha` — narrowing correctly stops treating the spec edit as
  a cause, but widening independently keeps them in DRIFT for the real reason.
- **2** records (`AtlAccordionGroup`, `AtlAccordionItem`, both verified at
  `51d2d9d`) have **no** component-file or spec-file change at all — only
  `tokens.css` moved underneath them (new `--ui-type-control`/`--ui-type-action`
  role tokens, ADR-0074/ADR-0085; the accordion trigger consumes
  `--ui-type-action`). These flip from **clean to DRIFT** — exactly the failure
  mode ADR-0035 named, now caught for the first time.

**Isolating the narrowing fix alone** (drop spec files from the hash, leave
`tokens.css` out) drops the 27-migrated-record DRIFT count from 25 to **17** — the
fix works exactly as intended. It is the *combination* with widening that pushes
the total to 37/37, and precisely two commits are responsible for all of it:
`e4f61ca` ("two roles the eight did not span…", ADR-0074, 2026-08-27 21:39 — itself
one of the six `verifiedSha` values) minted `--ui-type-control`/`--ui-type-action`,
and `93323ec` ("decide the counting rule, then mint the two roles it earns…",
ADR-0085, 2026-08-29) minted `--ui-type-row`/`--ui-type-row-sm`. `git log
<sha>..HEAD -- libs/angular/src/styles/tokens.css` returns exactly these two
commits for every one of `3c15080`/`4c57b74`/`51d2d9d`/`560bd9e`, and just the
second one for `e4f61ca` itself — no other commit touched the file in that
window. (An earlier draft of this section, working from `tokens.css`'s *entire*
git history rather than the range actually relevant to these verifications,
overstated this as "upwards of twenty commits" — wrong; caught rereading this ADR
as a hostile reviewer, before publishing it.) Two real, deliberate, ADR-backed
token-role additions — not twenty, not noise — are enough to move every tracked
component's rendered output and correctly invalidate every record verified before
them. **Diagnosis:** correct. **Conclusion:** the whole recorded parity dataset
is stale against the current token layer, which is a smaller but still real and
more urgent finding than the two bugs this ADR set out to fix, not a sign the fix
is wrong.

## Consequences

- `check:parity --report`'s 37/37 DRIFT is the new, honest baseline. Clearing it
  needs the Figma Desktop Bridge — a real re-verify pass across all 37 tracked
  components, not another script. That pass should prioritize the 10
  dangling-`verifiedSha` records (data-integrity issue, independent of this ADR)
  and can otherwise follow the DRIFT list `check:parity --report` already prints.
- A future `tokens.css` change will now correctly DRIFT every component it
  touches, in every framework it touches. That is by design (ADR-0024 §2) and by
  volume: expect widescale DRIFT after any shared-token change, same as ADR-0035's
  should have produced.
- `parity:record`'s new `figmaLastModified` field is inert until the separate,
  already-tracked gap (populating it in `figma-snapshot.mjs`) closes. No gate reads
  it yet.
- **New file:** none — `parity-inputs.js` and `parity-record.mjs` are edited in
  place; `tools/figma/parity.json`'s 27 migrated records change shape (fewer
  `inputs` entries per framework — no more `*.spec.*` — plus one more,
  `tokens.css`); the 10 dangling-`verifiedSha` records are untouched pending
  re-verification.
