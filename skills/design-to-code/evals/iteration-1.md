# design-to-code — skill-creator iteration 1 (2026-09-07)

Three eval prompts, each run once with the skill (worktree off d6273ce, skill loaded via
the Skill tool) and once without (worktree off 6b23b2b, before the skill existed), graded
by an independent Sonnet grader per eval against `eval_metadata.json` assertions. The
full workspace (outputs, `grading.json`, viewer) lived in the session scratchpad; this
file is the durable record.

| Metric | With skill | Without skill | Delta |
|---|---|---|---|
| Pass rate | 86 % ± 13 % | 59 % ± 8 % | +27 pts |
| Time | 466 s ± 141 s | 472 s ± 164 s | −7 s |
| Tokens | 205,802 ± 62,502 | 162,087 ± 41,015 | +43,714 |

| Eval | With | Without | What the skill changed |
|---|---|---|---|
| 0 URL-only, Vue (`node-id=55-141`, which no longer exists) | 5/5 | 3/5 | Wrote the handoff document's mechanical half with three blanks and stopped; baseline stopped one step earlier with "the node doesn't resolve" and no document. **But** the with-skill run asserted the dead id was "a content-sample instance beside the master" on the strength of a stale `figmaNode('55-141')` story link — false (live `getNodeByIdAsync` → `null`). |
| 1 AtlCard verify after the token change | 5/6 | 4/6 | Pinned the snapshot (SHA + Figma lastModified) and took the node from `snapshot.json`; declared all seven `codeSpec` sections. **But** re-recorded parity over a known letter-spacing gap that lived only in a commit message (c88a543); the baseline refused to record and traced git history deeper. |
| 2 File-wide token architecture (should route to the architect) | 3/4 | 2/4 | Loaded `figma-workspace-architect`, rejected `design-to-code` from its description. **Confound:** the baseline recognised the architect skill and withheld it because its output path was named `without_skill`. The architect run itself skipped its Migrate playbook and called a deletion "zero risk" — logged in `tasks/todo.md` as an architect finding. |

## Revisions made from this iteration (bde4432)

- Node existence is established with one read-only `getNodeByIdAsync` before anything is
  said about what a node is; a story link or a plan table is a claim about the past.
- The master check accepts a single `COMPONENT` (AtlBreadcrumbs `55:139`) as well as a
  `COMPONENT_SET`, compares with the snapshot, and says when the component already exists
  in the target framework (Build becomes a delta; offer Review).
- Spec-without-master is checked against `snapshot.json`, not `plan/figma.md`; the
  fixture uses AtlFormField (one of four spec interfaces without a master), not
  AtlPagination (master exists since 01e24b9).
- Re-recording parity requires every discrepancy fixed or **durably** recorded — handoff
  document, `FIGMA_CONFORMANCE_EXCEPTIONS` entry, or an open `tasks/todo.md` decision
  item. Review mode says "clean except …", never just "clean".

## Eval critique carried into iteration 2

- Name run directories neutrally in the prompts (`run-a`/`run-b`), never after the
  condition under test.
- Eval 0's assertion 2 rewards any document mentioning the node id; add an assertion
  that the stated identity of the node is *true* (live check).
- Eval 0's assertion 5 ("stopped instead of generating code") is near-floor when the id
  is dead; give the prompt a live id as well as a dead one.
- Eval 2's assertion 4 conflates "used severities but skipped the migration protocol"
  with "used no severity scheme"; split it.
- Add a Build-from-handoff eval: needs a scratch Figma draft with a master that has no
  code yet — none exists in the Atelier file (all gaps are Figma-side).
- Trigger set (`trigger-eval.json`) still awaits owner review before `run_loop.py`.

## Repo findings surfaced by the runs (all in `tasks/todo.md`)

AtlCard header tracking (code −0.01em vs master 0 %, open since c88a543); story
`figmaNode()` links unchecked against the live file (55-141 dead in three stories);
possible `Library Tokens` value staleness vs `tokens.css`; `plan/figma.md` node table
stale; architect Audit recommending Breaking deletes without Migrate.
