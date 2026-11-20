# Exercise test run — do the exercises carry? (2026-11-20)

Owner request 2026-11-20: run every participant exercise of both days for real and judge
each on four questions — does the idea carry (does the designed effect happen), is the
result reached, does it fill its slot, is there something to discover.

## Method, and what it cannot say

- A fresh seat from `create-atelier-ui-workspace@0.4.17 seat --framework angular --figma`,
  one APFS clone per run. The participant is `claude -p --model sonnet` (Sonnet 5.5),
  project settings only, the seat's own `.mcp.json`, prompts pasted from the seat's
  `course/` folder (or from the golden prompts where `course/` has none).
- Figma writes went to the owner's duplicate "Atelier UI WS2" (`g7c76htXhtbQlKxBt5IaZU`).
  The original was fingerprinted before and after (node count per page, 286 variables,
  `Library Tokens` 143 in Light/Dark): identical.
- Runs: Day 1 complete, Settings Card ×3 (one invalid as a generation run), Team
  directory ×2; Day 2 all four briefs ×1, four sessions per brief (one per block).
- Measured: agent wall time, turns, tool calls outside the seat allow-list, gates by exit
  code, screenshots of the built result.
- **Not measured: human time.** Reading, deciding, typing, approving and the 20-minute
  manual Figma design row are not in any number below. "Agent time vs. slot" is a lower
  bound for the work, not a forecast of how long a participant sits there.
- Weakest points of this method: one model (Sonnet 5.5, not the Copilot models the
  participants use at work), headless with `--dangerously-skip-permissions` (approval
  moments are counted, not felt), one run per Day 2 brief (no variance), and each headless
  step starts its own figma-console server, which caused Bridge drops a single interactive
  session would see less often.

## Verdict per exercise

| Exercise                                | Idea carries?                                                                                                                                                                                                                       | Result reached?                                                                        | Agent time vs. slot            | Things to discover                                                                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 B01 setup                            | yes                                                                                                                                                                                                                                 | yes — scaffold 0, `preflight` 0 in 1 s, Storybook up in ≈ 24 s, five servers connected | minutes vs. 25 min             | little; that is fine for a setup block                                                                                                     |
| D1 B02 Settings Card (×2 valid)         | **yes, strongly** — all gates and axe green, yet 4 visible differences (run 2) / 1 (run 3)                                                                                                                                          | card built, but **not mounted in the app in 2/2 runs**                                 | ≈ 5 min vs. 55 min             | rich: `Save` left instead of right in every run, also after the agent claimed "all four fixed"; run-to-run variance                        |
| D1 B02 self-check ladder                | partly — break-on-purpose gives exactly the three rule ids; the `alt=""` trap never fires (3/3 runs wrote `alt="User avatar"`)                                                                                                      | yes                                                                                    | 86–107 s vs. 10 min            | step 1 has nothing to do when the agent already ran the gates                                                                              |
| D1 B03 linter, 3 rules                  | yes on the planted duplicate — exactly three findings, one per rule                                                                                                                                                                 | yes                                                                                    | 14 s vs. 10 min                | all three are real, so "real or false alarm" has no false alarm; the default run has one (18 contrast findings on a hidden disabled label) |
| D1 B03 pink test                        | yes — finds the planted button and one unplanted real defect (danger inner shadow `#000000`)                                                                                                                                        | yes, **with an improvised prompt**; `course/` has none                                 | ≈ 1.5 min vs. 10 min           | 103 colour variables by hand is not a 10-minute task                                                                                       |
| D1 B03 readiness checklist              | weak — nearly every row passes on the clean master                                                                                                                                                                                  | yes                                                                                    | —                              | little beyond the planted findings                                                                                                         |
| D1 B04 `docs-show` + story red → green  | yes — the red is real, readable, and goes green                                                                                                                                                                                     | yes                                                                                    | ≈ 111 s vs. 45 min             | atelier `docs-show` lists the library's 13 stories, the seat has 6; **no participant sheet in `course/`**                                  |
| D1 B05 Team directory (×2)              | **no** — "the agent goes wrong, you steer" does not happen: no invented prop, no hand-built twin, screen correct on first pass in both runs                                                                                         | yes, trivially                                                                         | ≈ 3 min vs. 60 min             | import class names are not in `docs-show`; the agent never opened a browser; label misalignment between `AtlInput` and `AtlSelect`         |
| D2 B00 questions                        | yes                                                                                                                                                                                                                                 | yes — six commands, the six workspace skills                                           | 6 s / 11 s                     | 14 built-in skills as noise in the answer                                                                                                  |
| D2 B01 Figma structure + handoff (×4)   | yes — the handoff carried the context into three later sessions in 4/4                                                                                                                                                              | yes                                                                                    | 3.6–5.1 min vs. 90 min         | 8–13 decisions per brief the brief leaves open; typography variables cannot be bound; no size tokens                                       |
| D2 B01 linter on the own set            | no — Toast 18, TagChip 4, StatCard 8, Avatar 0 findings, **every one a `Vector` layer inside a library icon**                                                                                                                       | —                                                                                      | 14–17 s                        | only "this is not my layer"                                                                                                                |
| D2 B01 API-rules pass                   | weak — 0 renames in 4/4, the brief fixes the names                                                                                                                                                                                  | —                                                                                      | 21–38 s vs. 15 min             | `state` holding a data direction (StatCard), `variant` vs. the library's `shape` (Avatar)                                                  |
| D2 B02 plan mode                        | **yes, 4/4** — each plan surfaces API the handoff does not contain (`closed` output; `role="group"` impossible on `AtlCard`; a decorative avatar)                                                                                   | yes                                                                                    | 32–47 s                        | a waved-through plan approves the agent's additions                                                                                        |
| D2 B02 generation                       | yes                                                                                                                                                                                                                                 | yes — component, 7–11 stories, six gates 0 in 4/4                                      | 2.6–6.9 min vs. 75 min (block) | the red happens here and the agent repairs it unseen; wrong token names from the handoff; the `app` selector rule                          |
| D2 B02 `docs-show` on the own component | no as worded — the three asked categories are clean in 4/4                                                                                                                                                                          | —                                                                                      | 23–31 s                        | 8–9 other real gaps each time (snippets that do not compile, `+12%` rendering `++12%`, undocumented opt-out)                               |
| D2 B03 self-healing loop                | **no — nothing red in 4/4** (`test-run` green, axe clean on the first run)                                                                                                                                                          | —                                                                                      | 1–1.5 min vs. 60 min           | the hex/px grep: 0–2 hits, false positives or justified exceptions                                                                         |
| D2 B04 a11y three-step                  | partly — Figma audit 100/100 in 4/4 with focus and target-size checks skipped; axe 0; keyboard walk found one real mismatch (Toast tab order)                                                                                       | yes                                                                                    | 52–130 s                       | "read how the tool classified the component"                                                                                               |
| D2 B04 dark check                       | checks 1 and 2 yes; **check 3 (disabled via opacity) is stale for the library and not applicable to three of four briefs**                                                                                                          | —                                                                                      | 30–92 s                        | Toast: a raw `rgba()` inset shadow on danger                                                                                               |
| D2 B04 parity                           | sorting carries, but the list is mostly tool artefacts and differences kept on purpose (set bounding box as target size, `#id` suffixes, single font size); real code items only in TagChip (2, found by the agent beyond the tool) | 3 of 4 ran                                                                             | 38–65 s                        | a fourth label is missing: "tool artefact, not a difference"                                                                               |
| D2 B05 scorecard                        | plausible (read, not run)                                                                                                                                                                                                           | —                                                                                      | —                              | row 7 "Measure" is the predictable weakest row and has no exercise                                                                         |

Day 2 agent time in total: Toast ≈ 21 min, TagChip ≈ 14, StatCard ≈ 13, Avatar ≈ 12, against
≈ 300 min of blocks 01–04.

## What this adds up to

1. **Every exercise reaches its result.** Nothing is too hard or blocked for the agent. No
   exercise overran; the risk is on the other side.
2. **The agent finishes in 3–7 % of every slot.** Whether the slots are too long depends on
   human time, which this run did not measure — but the exercises that fill time are the
   ones where the human has to look or decide, not the ones that wait for the agent.
3. **Exercises that carry are the ones where green is not right:** the by-eye comparison of
   the Settings Card, the plan read before generation, sorting a list. They produced
   material in every run without planting.
4. **Exercises that wait for the agent to fail did not fire:** Team directory steering
   (2/2), the Day 2 self-healing loop (4/4), the `alt=""` trap (3/3), the three
   `docs-show` categories (4/4), dark check 3 (4/4). With the atelier MCP and the rules in
   the start prompt, Sonnet 5.5 does not make these mistakes any more. A weaker model may;
   that is not tested.
5. **The seat itself produces one reliable discovery nobody planned:** its ESLint rule wants
   the selector prefix `app`, the course convention is `atl-`. Four runs, two renamed the
   selector to `app-…`, two wrote `eslint-disable-next-line`. Either a defect to fix or the
   best "the agent silenced a gate" example of the course.

## Material defects found on the way (verified in the files)

- No participant prompt in `course/` for the pink test, for Day 1 Block 04, and for the
  dark check; the Team directory stretch is only in the trainer documents.
- Default lint on `Inputs/AtlButton` is 19 today (18 contrast, 1 auto-layout), not
  59 / 18 / 41: the original has 48 text nodes and none without a text style. Stale in the
  run-of-show, trainer notes, dry-run kit, golden prompts, `/schulung` and the deck.
- `Library Tokens` has 143 variables, `workshop/briefs/README.md:47` and
  `tasks/schulung-trainer-notes.md:319` say 84.
- Golden prompt §3.2 check 3 claims disabled is `opacity: var(--ui-opacity-disabled)` in
  "every other component"; `libs/styles/src/button/atl-button.css` uses dedicated neutral
  tokens (ADR-0159).
- `course/day1-settings-card.md:18` says token names from `boundVariables` "map 1-to-1";
  the tool returns variable ids, and `border-width/default` is `--ui-border-width`.
- "The node I have selected" (`course/figma-linter-prompt.md`, the readiness checklist):
  `figma_get_selection` came back empty in 3/3 runs when the selection was made before the
  session started.
- `course/handoff-example.md` builds "AtlToast", the library's own export with another
  API; the Avatar brief yields a second `AtlAvatar` whose axis is `variant` where the
  library says `shape`.
- `workshop/handouts/ds-scorecard.md:29` carries an internal note ("an exercise of its own
  comes with cohort 2") in a participant handout.
- `course/day2-prompts.md:116` writes `check.out` into the workspace root; nothing ignores
  or removes it.
- The seat's template story cites ADR-0121, which is not on the seat.
- Approval load: the seat allow-list is Bash-only, so every distinct MCP tool and every
  write is an approval; a generation step adds 6–15 Bash approvals.
- Bridge: "not connected" at the first Figma call of a new session in 3 of 4 Day 2 runs
  (inflated by the harness, real as a first-call risk).

## Verified vs. assumed

Verified: every time, count and exit code above (transcripts, gate logs, screenshots in the
session scratchpad); the stale numbers and sentences (read in the files); the original
Figma file untouched (fingerprint).

Assumed: all human time; that a participant's interactive session behaves like the headless
one; that the result holds for a second run of each Day 2 brief; the scorecard verdict; the
cause of 59 → 19 (file change or tool version, not determined).

Not run: lint and rename steps for TagChip and StatCard inside the agent run (Bridge down;
the lint was re-run by hand afterwards), parity for Avatar, the design-PNG comparison for
TagChip and StatCard, the 20-minute manual Figma row, anything on Copilot.

Open findings are in `tasks/reviews.md` as R-264 to R-275.
