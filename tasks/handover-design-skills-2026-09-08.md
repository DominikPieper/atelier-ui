# Handover — design-workflow skills, state at 2026-09-08

Written to be picked up cold in a new session. The running plan stays in
`tasks/todo.md`; this file is the "where we stopped and why" that a todo item cannot
carry.

## Where things stand

Everything the 2026-09-07 decision (`plan/design-skills-blueprint.md` § 8) asked for is
built and gated:

| Deliverable | State |
|---|---|
| ADR-0110 (pin `figma-console-mcp` 1.40.0, repo + scaffold preset), ADR-0111 (Code Connect out by toolchain), ADR-0096 dated correction | done |
| `figma-workspace-architect` additions — `plugin-api-gotchas.md`, `build-from-code-contract.md`, tool map 71→100, page taxonomy, state→CSS table, native Slot, `codeSyntax.WEB`, audit rules | done |
| `tools/scripts/test-skill.mjs` derives modes from `### <Name> mode` headings | done |
| `skills/design-to-code` — Build + Review, 4 references, 6 fixtures, iteration-1 evals (86 % vs 59 %) | done |
| `skills/artboard-bridge` — Intake + Publish, 3 references, 5 fixtures, iterations 1 and 2 | done |

`npm run check:all` exit 0 on `f807ebc`. **Four commits unpushed** (`20ec1a8`, `9c38317`,
`946f853`, `7607e00`, `f807ebc` — check `git log origin/main..HEAD`). Pushing triggers a
release run; expect a `chore(release)` commit and an llms.txt regen commit after it
(see the memory note on that pattern).

## Blocked right now

1. **`figma-console` MCP is disconnected.** It dropped mid-session when the description
   loop spawned ~24 headless sessions that each started the repo's `.mcp.json` servers
   and fought over the one Desktop Bridge plugin (`tasks/lessons.md`, 2026-09-08).
   Reconnect with `/mcp` before anything Figma-shaped. Everything below marked *needs
   Bridge* waits on this.
2. **All 37 parity records are DRIFT** (`npm run check:parity` exit 1, 37 blockers).
   Expected: ADR-0104 hashes the shared `tokens.css` into every component's inputs, and
   the typography work moved it. Consequence: `artboard-bridge` Publish is blocked
   repo-wide by its own P0, and `check:parity` stays red until a re-verify sweep. *Needs
   Bridge.*

## Next steps, in the order they were agreed

1. **`design-to-code` iteration 2** — the eval metadata is already written at
   `/private/tmp/.../scratchpad/design-to-code-workspace/iteration-2/` (four evals:
   dead node id, live node id, AtlCard verify, out-of-scope token architecture). That
   scratchpad is session-local and will be gone; the assertions are reproducible from
   `skills/design-to-code/evals/iteration-1.md` § "Eval critique carried into iteration 2".
   *Needs Bridge.*
2. **`artboard-bridge` iteration 3** — the write path P1–P7 has never run. Needs one
   component with a fresh parity record: re-verify + `parity:record` for it, or a
   clearly-marked synthetic fixture. Also re-run the governance eval against the fixed
   description (iteration 2's verdict on it is anachronistic — see below). *Needs Bridge
   for the parity half.*
3. **Description-optimisation loop** (`skill-creator/scripts/run_loop.py`) for both
   skills' `evals/trigger-eval.json`. **Run it alone**, after every Figma- and Claude-
   Design-dependent task is finished, ideally from a cwd without an `.mcp.json`. It is a
   resource event, not a background job.
4. **create-workspace packaging** — blueprint § 8 decision 7, still open. Recommendation
   stands: vendor the generic skills into the scaffold and give `design-to-code` a
   scaffold profile, now that both skills have eval records.

## Loose ends a new session should know about

- **Scratch Claude Design project `44481d29-1041-4aa0-adf0-cf59028016d7`** ("Atelier —
  artboard-bridge eval scratch", bound to the Atelier design system) holds
  `AtlBadge.dc.html` + `support.js` — the baseline run's sheet of *unverified* AtlBadge
  code. Left in place deliberately: iteration 3 needs the project, the file is private,
  and the local copy is the eval evidence. Delete the file (not the project) when
  iteration 3 starts, or when the owner says so.
- **The iteration-2 governance verdict is anachronistic.** The grader judged that run
  against the description carve-out I added *after* it ran. The run's reading was
  defensible against the text as it stood; that is exactly why the text changed. Do not
  quote the grader's "not defensible" without this context.
- **Eval harness facts** (both skills' iteration records repeat these): agent worktrees
  are cut from the last *pushed* commit and carry files uncommitted at creation time;
  skills load through the Skill tool from the main checkout, so baseline isolation rests
  on the instruction, not on absence. `grading.json` needs `summary.pass_rate` for
  `aggregate_benchmark.py`. Layout it expects:
  `eval-N-name/<with_skill|without_skill>/run-1/{outputs,grading.json,timing.json,eval_metadata.json}`.
- **Pass rates need reading, not quoting.** On `artboard-bridge`'s Publish eval the
  literal count rewarded the run that published unverified code over the run that
  correctly refused. The assertion set, not the skill, was wrong.

## Repo findings the evals produced (all in `tasks/todo.md`)

AtlCard header tracking (code −0.01em vs master 0 %); story `figmaNode()` links unchecked
against the live file (`55-141` dead in three stories, 91 of 119 ids unverifiable
offline); possible `Library Tokens` value staleness; `plan/figma.md`'s two stale tables;
the architect's Audit recommending Breaking deletes without its Migrate protocol;
`AtlDrawer.dc.html` finding 4 false; 37/37 parity DRIFT.

## Where the reasoning lives

`plan/design-skills-blueprint.md` (proposal + decisions), `plan/research/design-skills-2026-09-07/`
(ten verbatim research digests + the NotebookLM notebook link),
`skills/*/evals/iteration-*.md` (what each eval taught and what changed because of it),
`tasks/lessons.md` (the two lessons this work added).
