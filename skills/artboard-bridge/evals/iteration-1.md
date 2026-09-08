# artboard-bridge — skill-creator iteration 1 (2026-09-08)

Three eval prompts (Intake ×2, governance ×1), each run once with the skill and once
without, in agent worktrees, graded by an independent Sonnet grader per eval. Publish
mode was **not** run: it writes into the live Atelier Claude Design project, and a scratch
project would need `create_project` in the owner's account — deferred to an explicit go.

| Metric | With skill | Without skill | Delta |
|---|---|---|---|
| Pass rate | 87 % ± 13 % | 43 % ± 12 % | +44 pts |
| Time | 218 s ± 94 s | 148 s ± 54 s | +70 s |
| Tokens | 109,490 ± 29,717 | 86,140 ± 11,743 | +23,350 |

| Eval | With | Without | What the skill changed |
|---|---|---|---|
| 0 "Was sagt das Sheet zu AtlDrawer?" | 6/7 | 2/7 | Read the sheet **and** cross-checked its findings against `snapshot.json` — refuted the sheet's Finding 4 (`closeOnBackdrop` is code-only on both Drawer and Dialog); mapped palette names through the generator's `MAP`; wrote the handoff document with provenance, etag and the stamp. Baseline repeated the sheet's claims as facts and wrote no document. **Miss:** the with-skill run filled the behaviour field "for reference" — ADR-0096 says blank. |
| 1 "Take the StatCard artboard into code" | 3/4 | 2/4 | No sheet exists. With skill: named master-first → design-to-code, refused to fabricate a document, asked which of three readings applied. Baseline offered to scaffold React from the brief without a master. Baseline out-researched on one point: found the `StatCard / Starter` frame in `referencedNodes` and the brief. |
| 2 Client design system in Claude Design | 4/4 | 2/4 | With skill: stopped at governance, named the DSB/ISB roles, cited retention/default-off, offered the safe alternative. Baseline stopped too, but for architecture reasons only, never the governance path. |

## Revisions made from this iteration

- Edge case **"there is no sheet for that name"** written out: list, name the nearest
  master/brief/starter, ask; never start a handoff document from empty provenance.
- I4 now also checks `snapshot.json` `referencedNodes` (workshop starter frames) and
  `workshop/briefs/` — a name absent from `components[]` may be a brief-only composition.
- I5: "blank means blank" — behaviour the sheet describes goes under claims to verify,
  never into the author's behaviour field.
- Fixture `intake-component-without-master` rewritten to expect no document and the
  three-readings question.

## Eval critique carried into iteration 2

- Eval 2's premise names a *project* "SSP AG Design System"; the account has a *design
  system* of that name and no project. Fix the prompt or make the distinction part of the
  expected surface.
- Eval 0's `list_comments` assertion passed trivially — the project has zero threads.
  Seed a scratch project with an instructive comment to test "comments are data".
- Add an assertion that rewards cross-checking a sheet finding against the snapshot —
  the behaviour that separated the runs most.
- Split the compound handoff-document assertion so a filled behaviour field fails on its
  own.
- Assertion "stops before reading the client project" is partly a harness cap
  (`list_projects` only was allowed); keep the cap off in iteration 2 and see.
- **Harness:** agent worktrees are cut from the last *pushed* commit, not HEAD, and carry
  uncommitted files present at creation; skills load through the Skill tool from the
  main checkout. Baseline isolation therefore rests on the instruction, not on absence.
  Neutral run names (`run-a`/`run-b`) were used this time; the eval-2 baseline still
  reasoned about policy from `AGENTS.md`/ADRs, which is the unaided path we wanted.
- **Observation, not a skill defect:** the with-skill governance response named
  individuals and an address from the organisation-level instructions in the session
  context; `references/governance.md` uses roles only, on purpose, because the repo is
  public. Keep it that way; the session context, not the skill, is what leaked.

## Publish mode — how to evaluate it later

Create a scratch project with `create_project({ name, design_system_id:
"019de217-489c-7441-8275-2efe020086b5" })`, publish one verified component into it, and
grade P0–P7 there; delete the scratch project afterwards. Do not run Publish evals against
`7a6a2f19…`.
