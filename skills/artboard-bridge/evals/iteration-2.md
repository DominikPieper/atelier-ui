# artboard-bridge — skill-creator iteration 2 (2026-09-08)

Three prompts (Intake, governance, **Publish**), each run once with the skill and once
without, graded by independent Sonnet graders. Publish ran for the first time, against a
scratch Claude Design project (`44481d29-1041-4aa0-adf0-cf59028016d7`, bound to the
Atelier design system) so the redesign project was never written to.

| Metric    | With skill       | Without skill    | Delta   |
| --------- | ---------------- | ---------------- | ------- |
| Pass rate | 55 % ± 40 %      | 37 % ± 23 %      | +18 pts |
| Time      | 248 s ± 87 s     | 270 s ± 267 s    | −22 s   |
| Tokens    | 109,261 ± 36,750 | 102,813 ± 54,761 | +6,449  |

**Read the pass rate with the finding below, not instead of it.** On the Publish eval the
literal count rewards the wrong run.

| Eval                               | With | Without | What happened                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Intake, AtlDrawer sheet          | 7/7  | 1/7     | With skill: prompt loaded first, palette mapped through the generator (files actually read), master cross-checked, handoff document with provenance, the verbatim stamp and **blank** author fields. Baseline: no prompt call, no document, sheet content presented as flat fact.                     |
| 1 Governance, client design system | 2/5  | 3/5     | Neither named the deciding roles or ADR-0032. With-skill run **did not load the skill** — it read the description as Atelier-only and answered as an ordinary scoping question, even denying it was a governance case. The description has since been fixed; this eval is unretested against the fix. |
| 2 Publish, AtlBadge                | 2/8  | 3/8     | With skill: `check:parity` first, AtlBadge `[BLOCKER][DRIFT]`, P0 refuses, names the commits and the repo-wide cause, writes nothing. Baseline: published a sheet and handed the user a durable client-facing URL for code the repo's own gate calls unverified.                                      |

## The Publish finding

The refusal is right and the assertion set punishes it: seven of eight assertions describe
happy-path mechanics a correct refusal cannot satisfy, and none penalises publishing over
a DRIFT row. Verified independently by the grader: `check:parity` exit 1, AtlBadge DRIFT
since `3c15080`, **37 of 37** tracked masters in DRIFT — ADR-0104's shared-`tokens.css`
hash, working as designed. The baseline's sheet is honest and accurate in its values (they
match the code byte-for-byte) and says "not verified against the Figma master in this
pass" — but that phrasing hides that the prior verification is _invalidated_, not merely
skipped. That is exactly the artboard-as-truth failure the skill exists to prevent.

Second-order proof from the same grader: the redesign project's existing
`AtlBadge.dc.html` is itself stale against current tokens (`#fef9c3` vs `#fef3c7`) — an
artboard drifts the moment it is written.

## Revisions made from this iteration

- **Description carve-out**: third-party artboards and non-Atelier target libraries are
  in scope precisely because they must stop; the "not an Atelier task" reading is named
  as the wrong move. Governance reference and fixture extended to match.
- **P0 refusal is a successful run**: name the commits, the re-verify path, and stop —
  do not compose the sheet "so it is ready".
- **P0a, the repo-wide case**: one token change puts every component in DRIFT, so Publish
  is blocked repo-wide, not for this component alone; say so and check `tasks/todo.md`.
- Worked example now ends two ways, clean row and DRIFT row, both complete answers.

## Carried into iteration 3

- **The write path is still unexercised by the skill.** Needs a component with a fresh
  parity record: a Desktop Bridge re-verify plus `parity:record` for one component, or a
  fixture seeding a clearly-marked synthetic record. Until then P1–P7 are untested.
- **Re-run the governance eval** against the fixed description — the grader judged the
  run against text written after it ran, so its "not defensible" verdict is anachronistic;
  the run was defensible then, which is why the text changed.
- Add an assertion that penalises publishing over a DRIFT row, and split the happy-path
  mechanics so a refusal is not scored against them.
- The governance eval's tool cap (`list_projects` only) means "did not read the client
  project" passes without testing judgment; lift the cap.
- "Uses roles, not personal names" passes for any plausible role — the baseline named the
  wrong one and passed. Require the correct pair.

## Repo findings this iteration produced

`AtlDrawer.dc.html`'s finding 4 is false (`closeOnBackdrop` is code-only on both Drawer
and Dialog per the snapshot and ADR-0056) — two runs repeated it as fact; the 37/37 DRIFT
state; both are `tasks/todo.md` items.
