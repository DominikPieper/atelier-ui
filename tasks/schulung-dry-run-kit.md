# Schulung Dry-Run Kit

_Retargeted onto /schulung on 2026-10-11 (R-037–R-039)._

**Purpose:** make the one still-open near-term item — _"one rehearsal of the
participant path on a non-author machine, timed"_ (R-040 in
`tasks/reviews.md`) — a one-day job with a result comparable to the three existing reviews,
instead of an improvisation. Everything the curriculum _teaches_ lives at
`/schulung` (`docs/src/pages/schulung.astro`); this document does not repeat it.
The 2026-09 root agenda is a frozen copy now
(`tasks/archive/schulung-2tage-agenda-2026-09.md`) and is not a source for this
kit. What this kit adds: the checklist of things that must **happen**, each with
what "worked" looks like, where a green result actually means failure, the
points where the run must stop and write something down, and a place to log the
result in the same shape as `tasks/archive/reviews/schulung-review-2026-08-28.md`,
`-09-02.md` and `-09-05.md`.

**Rule for "not specified":** every block name, time and claim below traces to
`/schulung` or an ADR. Where the page gives no basis, this kit says **"not
specified on /schulung"** instead of inventing one.

**Who this is for:** one person, alone, timing themselves, on a machine that
is not the author's — closest available stand-in for a cohort participant.
Not a cohort. Not a second review of the prose. Stated plainly, so the result
doesn't get read as more than it is: **one runner is not a cohort** —
concurrent-seat load on Figma and on the Claude subscription (a seat no longer talks to
the hosted Storybook endpoints, ADR-0182), a room full of simultaneous
Figma Bridge connections, and the variance between laptops (a cohort has up to
8 participants) are structurally untestable by one person on one machine. And
**whoever runs this kit already knows the repo** — even a rehearsal run by
someone other than the material's author is not a genuinely first-time
participant's experience of Day 2 Block 01, where not knowing Figma at all is
the condition the block is designed around. Both limits stand no matter how
clean the run is; see §6.

**The environment under test:** the participant's, not ours. One Angular
workspace generated with `npx create-atelier-ui-workspace` (ADR-0137): Storybook
on `localhost:6006` (`npm run storybook`), the app on `localhost:4200`
(`nx serve workshop-<fw>`), and the scaffold's own checks (`npm run lint`,
`npm run build`, `npm run check:stylelint`, `npm run check:stories`, …; the "ladder" of
ADR-0180). The Atelier
clone with ports 4400–4402 is for work on Atelier itself and is **not** the
rehearsal environment. Run the rehearsal in Angular (the default framework).

**Out of scope (owner, 2026-10-12):** the Claude Code login and the Figma Desktop
Bridge setup. They stay with the person running the rehearsal, as pre-work; start
the clock on a machine that is already logged in with the Bridge connected, and do
not time or log those steps.

**Rule for the run:** don't fix what you hit. Record it in §5, use the
documented workaround if one exists, and keep moving. A rehearsal that stops
to patch every rough edge never reaches the end of Day 2, and the timing data
becomes useless the moment the clock stops for a fix.

---

## 1. Known-blocked or undecided — read this before you start, don't chase any of it

| Item                                  | Why it's blocked                                                                                                                                                                                                                                                                                                                                                                                          | What to do instead                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Design demo (trainer appendix) | **Not a block step.** `/schulung` has it as an optional trainer appendix (`#appendix-claude-design`), trainer machine only: `claude.ai/design` needs a different login than the cohort's training subscription. The page says to run it in the Day 1 buffer 15:45–15:55, cut to 10 minutes, or skip it (owner decision 2026-10-14; earlier: Block 04 "if time allows"). Participants cannot reproduce it. | Leave it out of the rehearsal's checklist and timing. If you want to see it, run it as a separate trainer exercise after the timed run, not inside Day 1 Block 04 or its buffer.                                                                                                                                           |
| Figma Desktop Bridge                  | Not automatic. Every `figma_*` MCP call (Day 1 Block 03 linter, Day 2 Block 01/04) depends on the bridge plugin imported in the Figma desktop app (Plugins → Development → Import plugin from manifest…, `/schulung` Day 1 Block 01). `/schulung` says the bridge gates Day 2.                                                                                                                            | Before relying on _any_ `figma_*` tool: Figma Desktop open, your duplicate open, bridge plugin running, then ask Claude to check Figma status and confirm it is connected. Re-check after any Figma restart. How the connected state is read: not specified on /schulung (see `/troubleshooting`: "bridge not connected"). |
| `solved-*` recovery branches          | None, by decision (R-042, 2026-10-13): every step on `/first-component` and every gate step on `/screen-from-storybook` carries an "If this step fails" block with one recovery prompt or command instead.                                                                                                                                                                                                | Recovery path: see R-005 / R-042, not decided. For the rehearsal itself, protect your own progress the ordinary way (local commit or `git stash` before anything risky) — a rehearsal convenience, not something to teach a cohort.                                                                                        |
| Figma access token                    | `/schulung` Day 1 Block 01: the token is technically optional (REST reads only) and a cohort-policy decision.                                                                                                                                                                                                                                                                                             | Decide before the run whether you rehearse with or without it, and write the choice into §5. Which one a cohort gets: not specified on /schulung.                                                                                                                                                                          |

---

## 2. How to use this kit

1. Start a timer at 09:00 (or whenever you actually start — record the real clock time, not the plan's).
2. Work the path in §4 in order. Each block lists the page's **Done when**, the
   checkpoints with the signal that means each one worked, and — where one
   exists — a signal that looks fine but isn't.
3. At every **STOP** marker, do exactly that: stop, look at the output, write
   one line in §5 before moving on. These are the points a fresh runner is most
   likely to diverge from what the material assumes.
4. Fill in §3 (timing) block by block as you go, not from memory afterward.
5. When Day 2 ends, walk the **8** items of the "Success verification" section
   on `/schulung` once more as a checklist and log each as pass/fail/ambiguous
   in §5.
6. Finish by writing §6 (weakest point of this run) yourself, the way the
   three prior reviews each end with one.

**Print list (before the run).** In addition to what the trainer notes list as paper: one
copy per participant of the three handouts `workshop/handouts/ds-scorecard.md`,
`workshop/handouts/figma-readiness-checklist.md` and
`workshop/handouts/storybook-readiness-checklist.md`, and the ladder card (the printed
`/cheat-sheet`). Print them the way the cohort gets them and note whether each fits one page.
`npm run trainer:print` is run once, later, by the owner; this kit does not run it.

---

## 3. Timing tracker

Fill in as you go. Planned times are the schedule on `/schulung`; nothing
about them has been measured before this run. Break rows are the gaps between
the page's block times. The page gives the break format as "60 min lunch · 2×
15 min coffee breaks · 10 min buffer" per day; which gap is which is not
labelled on /schulung (the 10-minute gap before the last two blocks is the
buffer by arithmetic only).

### Day 1 (planned net 6 h 50 min)

| Block                                         | Planned          | Actual start | Actual end | Delta | Note |
| --------------------------------------------- | ---------------- | ------------ | ---------- | ----- | ---- |
| 00 Kickoff and thesis                         | 09:00–09:30 (30) |              |            |       |      |
| 01 Verify the setup 🔴                        | 09:30–10:15 (45) |              |            |       |      |
| — gap —                                       | 10:15–10:30      |              |            |       |      |
| 02 Mini-loop: first success                   | 10:30–12:00 (90) |              |            |       |      |
| — gap —                                       | 12:00–13:00      |              |            |       |      |
| 03 Figma for code: is the file ready?         | 13:00–14:15 (75) |              |            |       |      |
| — gap —                                       | 14:15–14:30      |              |            |       |      |
| 04 Guardrails: stories as claims, and MCP     | 14:30–15:45 (75) |              |            |       |      |
| — gap —                                       | 15:45–15:55      |              |            |       |      |
| 05 A screen from Storybook, against the clock | 15:55–17:15 (80) |              |            |       |      |
| 06 Recap and exit ticket                      | 17:15–17:30 (15) |              |            |       |      |

### Day 2 (planned net 6 h 50 min)

| Block                                                | Planned          | Actual start | Actual end | Delta | Note |
| ---------------------------------------------------- | ---------------- | ------------ | ---------- | ----- | ---- |
| 00 Recap (active recall), brief, skills              | 09:00–09:30 (30) |              |            |       |      |
| 01 Design in Figma and the handoff document 🔴       | 09:30–11:00 (90) |              |            |       |      |
| — gap —                                              | 11:00–11:15      |              |            |       |      |
| 02 Component and stories from the handoff            | 11:15–12:30 (75) |              |            |       |      |
| — gap —                                              | 12:30–13:30      |              |            |       |      |
| 03 Iterate: prompt quality and the self-healing loop | 13:30–14:45 (75) |              |            |       |      |
| — gap —                                              | 14:45–15:00      |              |            |       |      |
| 04 Verify: a11y, states, parity                      | 15:00–16:15 (75) |              |            |       |      |
| — gap —                                              | 16:15–16:25      |              |            |       |      |
| 05 Show & tell and transfer to "My DS"               | 16:25–17:30 (65) |              |            |       |      |

---

## 4. The path — checkpoints, expected signal, false-positive traps

Commands run in the scaffolded workspace (ADR-0137), a shell in its root,
Claude Code CLI logged in with `claude auth login` (a Claude subscription). Every block's **Done when** is
quoted from `/schulung` (`Block.done`); log pass/fail against it in §5.

**Time-recovery cuts:** `/schulung` names none. Its only flexibility is the
Claude Design appendix (Day 1 buffer 15:45–15:55, 10 minutes, or skip it) and the per-block stretch tasks, which are for fast finishers, not cuts.
Any cut order for a block that runs long: not specified on /schulung. Do not
invent one live; record the overrun and which bullet ate the time.

**Rehearsal checks added by ADR-0180 (each is an UNVERIFIED point; log the result in §5).**
They sit at the block that runs them and are numbered here so none gets lost:

1. Day 1 Block 02: do the planted-break prompts (agent runs lint and build, the `<img>`
   without `alt` and the click `<div>`, the repair, the removal) run as participant prompts
   within the 20 minutes of the ladder row?
2. Day 1 Block 03: the three-rule `figma_lint_design` run (`hardcoded-color`, `default-name`,
   `detached-component`) on `Inputs/AtlButton` in the duplicate: how many findings does it
   return? (The default run measured 59, 18 of them "critical" contrast findings, 40 about
   text styles.)
3. Day 1 Block 03: are 5 minutes enough for the remaining readiness checklist rows?
4. Day 2 Block 00: after `/clear`, do the two Definition-of-Done answers differ as described
   (the second no longer names `npm run check:stories`)?
5. Day 2 Block 02: does `docs-show` on a fresh component work over the running local MCP,
   and does the entry refresh after a JSDoc edit without a restart? (Measured only through
   the CLI route `storybook tools ... docs show`, 2026-11-18.)
6. Day 1 Block 02 and Day 1 Block 05: when a failing command prints no error text (R-248),
   does "read the full log" in the prompt make the agent find the cause?
7. Day 2 Block 05: a FigmaLint run without an API key (owner): what does it do? The transfer
   slide bullet "A designer without an agent: a lint plugin in Figma (FigmaLint)" stays
   conditional on it.
8. End of Day 2: does `/verify` exit 0 on the participant's own component in a Figma
   workspace where nobody ran `figma:snapshot` and no contract file exists? `/verify` runs six
   checks (`check:format`, `check:stylelint`, `lint`, `build`, `check:unit`,
   `check:stories`) and no `check:contracts` since the scaffold release of 2026-11; not run
   on a seat. If the run says otherwise, the closing proof line of Day 2 needs a different
   command before cohort 1.
9. Day 2 Block 00 (added 2026-11-18, ADR-0181): does the answer to "Which skills do you have in this workspace, and when would you load each? Only list them."
   list the skills that are in `.claude/skills/` on the seat, with `atelier-component` among
   them, and does demo D-7 fit in 5 minutes? Also note whether the four Storybook skills
   landed on the provisioned machines.

### Day 1

**Before 09:00 (once):** on the course the machines are provisioned by Conciso
(owner decision 2026-11-12, ADR-0178): nothing is installed at home and nothing is
mailed. For the rehearsal, set your machine up the same way: Node ≥ 22.12 LTS, Claude
Code CLI, Figma Desktop with the prepared duplicate and the imported Desktop Bridge
plugin. Do it before the clock starts and note how long it took; Block 01 only
_verifies_ it, and the login happens inside Block 01.

**Block 00 — Kickoff and thesis** (talk + live demo).
_Done when:_ everyone can name the loop: Inspect → Contract → Generate → Verify.
No gate. Time it. Includes a 5-minute live demo (change an Atelier component by
prompt); whether the live demo ran in the rehearsal workspace or needs the
Atelier clone: not specified on /schulung — record what you used.
Since 2026-10-13 the block also carries a two-minute glossary pass
(`/workshop#glossary`) and the 5-minute guardrail demo (`/prompts#guardrails`),
still inside 30 minutes; the owner chose not to shorten the live demo for them.
Time the three parts separately so an overrun shows where it comes from. Since 2026-11-17
there is a 3-minute row for the ladder slide and the scorecard slide (09:19–09:22; the
scorecard handout is given out here) and D-1 names ladder stage 3 (`npm run check:stylelint`)
with what it does not see; the thesis is 7 minutes.

**Block 01 — Verify the setup 🔴** (09:30–10:15, 45 min)
_Done when:_ the model-access command answers, `preflight` is green, `/mcp` lists
every server, Storybook runs, the Figma bridge is connected, the first commit exists, and
anyone still red has a rescue path.

- Node ≥ 22.12 active (preflight accepts 22.12 or newer); own workspace
  created with `npx create-atelier-ui-workspace`, one framework chosen (Angular).
- Run `npm run preflight`. Expect a clean run. The page says it checks
  Node/npm, that the CLI exists (`which claude` + `claude --version`), the
  Figma bridge, MCP reachability and ports, and that it does **not** check that
  the login works: it sends no model request.
- **STOP.** A green preflight proves exactly that list, nothing more. Record
  whether the summary read as "everything is ready" to a first-time reader.
- Confirm model access separately (it comes first in the block, 09:33): `claude auth login`
  (subscription login in the browser), then `claude -p "Reply with exactly: PREFLIGHT-OK"`.
  A reply instead of an auth error means access is real. The page's own
  sentence: _"An installed CLI, a connected MCP and usable model access are
  three different things."_ Record whether a green `preflight` alone gave the
  false impression that this was already covered.
- Read `.mcp.json` together; run `/mcp` in Claude Code and compare against the
  file. The scaffold's `.mcp.json` for Angular lists five: `atelier`, `storybook-local`,
  `nx-mcp`, `angular-cli`, `figma-console` (`/schulung` Block 04 names them; `uianatomy`
  left the scaffold on 2026-11-18, ADR-0181, so a sixth entry means the machine was
  provisioned from an older release: log it). `storybook-local` is connected only while
  Storybook runs; if it was started after the session, `/mcp` → reconnect. Write down what
  `/mcp` actually shows.
- Storybook runs (`npm run storybook`, `localhost:6006`, ADR-0137); Playwright
  Chromium installed.
- Everybody, 10:02–10:12 (no rescue slot any more): ten minutes of Claude Code basics at the
  projector (`/prompts#claude-code-basics`), then the first commit
  (`git commit -m "scaffold: preflight green"`; the scaffold's `git init` staged
  everything and committed nothing). Record whether `git log` shows one commit.
- Figma: open the prepared duplicate in Figma Desktop and start the Desktop Bridge plugin
  (09:50); Claude reports the bridge connected. Nobody duplicates in the room.
- **Abort criterion for this 🔴 block:** `/troubleshooting#still-red` (R-041):
  name which of the three parts is missing (CLI, MCP, model access), a 30-minute time
  box, then pairing; a broken workspace is not repaired, the trainer fixes the machine;
  nobody starts Day 2 red. Record whether you needed a rescue
  and what it was. A red seat pairs with a neighbour; the trainer takes it at the
  coffee break 10:15–10:30 or at lunch.

**Block 02 — Mini-loop: first success** (hands-on, everyone in sync).
_Done when:_ the Settings Card runs, the agent ran lint and build and reported both exit
codes, and every difference to the Figma frame is sorted: code or Figma.

- Follow `/tutorial`: Figma → MCP → token-exact code in 4 steps; compose the
  Settings Card from `AtlCard` / `AtlInput` / `AtlToggle` / `AtlButton` in the
  cohort framework **by prompting, not typing**. Note whether "prompt, don't
  type" needed active enforcement or happened naturally.
- **STOP — ladder stage 2, the agent checks itself (11:25–11:45, 20 minutes,
  `tasks/schulung-golden-prompts.md` §1a).** Three prompts: the agent runs `npm run lint`
  and `npm run build` and reports each exit code; break it on purpose (an `<img
src="/avatar.png">` without `alt` and a `<div (click)="save()">Save</div>` in the Settings
  Card, nothing fixed, lint exit code and rule ids reported); repair from the lint output,
  run both again, then remove image and div and run both once more. Read the repair: did
  the agent write `alt=""`? (Green is not right.) Checkpoints: a non-zero lint exit code and
  a rule id seen (D1B02-C3); lint and build exit 0 after the repair (D1B02-C4). Fallback if
  the agent stalls: type the command yourself. Rehearsal checks 1 and 6 (list above):
  log whether the three prompts fit 20 minutes as participant prompts, and whether "read
  the full log" works when the failing command prints no error text. There is no
  `check:contracts` and no `check:stories` in this block; `check:contracts` is not part of the
  participant path (ADR-0180).
- **STOP — comparison with Figma (11:45–11:55, 10 minutes).** Run the parity prompt from
  `/tutorial` and read the list line by line before calling it done. Log what it compared
  and what it did not. A report you did not read is the failure case this block exists to
  catch. Label every difference **code or Figma** (two labels only; "kept on purpose"
  arrives on Day 2). A difference that fits neither is parked ("not code, not Figma, we name
  it on Day 2") and not "fixed" in code; log any and how the room handled it (D1B02-C5).
- Whether the tutorial's `figma_check_design_parity` call needs the connected
  bridge: not specified on /schulung for this block (it is stated for Day 2
  Block 04) — record what you hit.

**Block 03 — Figma for code: is the file ready?** (guided tour + checklist).
_Done when:_ the readiness checklist is filled in for one master of the Atelier file, the
Figma linter's findings on that master are sorted, and on a copy of a master in the prepared
duplicate on your machine one fill is bound to a Library Tokens variable, one variant value is
added and one frame uses Auto Layout. The checklist for your own file is a handout.

- Open the Atelier file; tour variables (primitives → semantic → component),
  component sets/variants/properties/auto layout, modes, Inventory vs.
  Components page. Run the **pink test** on a master (`/tokens#pink-test`) and
  say what it showed. Naming: `/tokens#naming`.
- **STOP — ladder stage 0, the Figma linter (13:45–13:55, 10 minutes, golden prompts §1c).**
  Trainer shows the default run on `Inputs/AtlButton` (node `129:20`) first (59 findings,
  18 "critical" contrast findings on the hidden `_disabled-overlay` label, 40 about text
  styles); then the agent runs `figma_lint_design` with the three rules `hardcoded-color`,
  `default-name`, `detached-component` on the same master in the duplicate, read-only, and you
  sort each line real / false alarm. Rehearsal check 2: log how many findings the
  three-rule run returns.
- Readiness checklist (`/readiness`) for one Atelier master, the remaining rows (13:55–14:00).
  Rehearsal check 3: log whether 5 minutes were enough.
- Micro-exercise (10 min) on a copy of a master in the duplicate: bind one fill to a
  Library Tokens variable, add one variant value, put one frame on Auto Layout, run
  the pink test on the copy. Signal: the copy's fill is bound and the pink test shows
  it (D1B03-C5).
- No gate. If the rehearsal seat cannot open and write into the prepared duplicate,
  that is a finding: it blocks Day 2 Block 01
  outright. The own-design-system checklist is a handout; a stand-in for a solo rehearsal: not
  specified on /schulung.

**Block 04 — Guardrails: stories as claims, and MCP** (hands-on demo).
_Done when:_ one story plus a `play` function written, seen red once and then
green, and `docs-show` called.

- `atelier`: look up Button with `docs-show`. Expect the docs back
  **shaped for the cohort framework** (Angular: two-way `[(checked)]`-style
  bindings and split inputs/outputs, ADR-0097); a React-shaped reply (JSX,
  `children`, `on*Change`) is a real regression, say so.
- One Storybook detail the page still explains: the Design tab (addon-designs,
  `parameters.design`, D-3, 7 minutes). The Docs tab's contract section is no longer taught.
  The scaffold's own stories carry no `parameters.design`: look at it on the library
  Storybook mounted at `localhost:6006/atelier/` (fallback: the hosted
  `atelier.pieper.io/storybook-angular/`), not in the workspace's own stories. NOT YET
  VERIFIED (rehearsal): the Design tab inside the mounted build.
- Negative demo (D-4, 13 minutes): same question in a browser chat without MCP — expect a
  hallucination (illustrative only, nothing to run). Then the compiler stage (ladder stage 1):
  paste the invented usage into the workspace, the agent runs `npm run build`; log whether an
  invented value gives `TS2322` with the allowed values, a bound invented input gives `NG8002`,
  and the same name as a static attribute (`shadow="lg"`) builds clean. Then with MCP, in the
  workspace through `atelier` — a correct answer.
- Live exercise: ask Claude for Button props, print token values, preview in
  chat. Ask the MCP server for a prop that does not exist (page stretch) and
  expect "not documented", not an invention.
- **STOP — the red-then-green story** (ladder stage 4). Prompt one story with a `play` function
  for a variant (template story as context); the agent calls
  `get-storybook-story-instructions` first and runs `test-run` through `storybook-local`, so
  it sees the red itself; watch the same red in the play panel, fix it by prompt, watch it
  pass. NOT YET VERIFIED (rehearsal): `test-run` through `storybook-local` on a seat. If it never failed,
  the story claims nothing (green means failure here): record it.
- The Claude Design demo is the optional appendix, not a step here (§1).

**Block 05 — A screen from Storybook, against the clock** (hands-on, no guidance).
_Done when:_ a Team directory screen runs and behaves as the brief says, and every prop
in it has a source in `docs-show` (or was removed).

- `/screen-from-storybook`: one screen (search field, role select, invite button, table
  with a status badge per row, pagination), `atelier` as the only source of
  information, four rules, no steps, no Figma. Prompts for this block:
  `tasks/schulung-golden-prompts.md` §1b (the starter prompt itself is live on the page).
- The screen lives under `workshop-<fw>/src/` with its styles in a plain `.css` file,
  and is viewed with `npm start` (app on `localhost:4200`).
- Closing checks, run by the agent (golden prompts §1b closing prompt), the exit codes it
  reports logged: `npm run lint`, `npm run check:stylelint`, `npm run check:format`, on
  Angular also `npm run build`. Then the receipts prompt. Rehearsal check 6 applies here too. Log what the checks did not see: a colour outside the `.css` file, the accessibility of
  the running app.
- Log how long the build really took against the 30 build minutes the block allows (a
  headless run on 2026-11-12 needed 195 s for the build, 20 s for the four checks from a cold
  cache and 39 s for the receipts prompt; what a participant needs to approve, read and
  judge is unmeasured), how many of the six components the agent
  got right on the first try, the first prop or element it invented, and where the agent got the import
  names (`AtlThead`, `AtlOption`) from, since `docs-show` never names them.

**Block 06 — Recap and exit ticket** (discussion).
_Done when:_ a brief is chosen. No machine homework: the course machines stay in
the room; sketch the component on paper if you like.

- Choose one of the four briefs (Toast / TagChip / StatCard / Avatar), found in
  `workshop/briefs/`. The kata `/first-component` and the bridge exercise
  `/first-component#bridge` (a `density` variant on the Settings Card: component,
  story per value, then lint, build and `check:stories` run by the agent) are optional and need your own machine and Claude
  access. An unfinished Block 05 screen stays in the workspace for Day 2.
- Exit ticket: one sentence on what you will check first next time before
  trusting AI output. No gate. Time it.

### Day 2

**Block 00 — Recap (active recall), brief, skills** (talk).
_Done when:_ everyone knows their target component, has changed one line of the rules file
and has seen the agent read it.

- **STOP — check the skills are really installed.** The page lists exactly
  what the scaffold installs: `atelier-component` (the workspace's own skill,
  carries the rest of the day from Block 02 on),
  `figma-workspace-architect` (only in workspaces generated with Figma), and
  the four Storybook skills (ADR-0167). Look in the workspace's `.claude/`
  folder and confirm each is present; `design-to-code`, `atelier-design` and
  `artboard-bridge` are repo/trainer-only and must **not** be there. A skill
  you assume is installed but is not is the failure this block covers; also
  record whether you could tell that a skill had triggered.
- Day 1 recap as active recall (participants answer, trainer does not lecture);
  present the brief (anatomy, axes, states, a11y requirements); D-7 (5 minutes): open
  `.claude/skills/atelier-component/SKILL.md`, then ask "Which skills do you have in this workspace, and when would you load each? Only list them."
  Signal: the answer names `atelier-component` (D2B00-C2). Rehearsal check 9: log whether
  the answer lists the skills on the seat and whether 5 minutes were enough.
- **STOP — what the agent reads here, and change one line (09:18–09:28, 10 minutes).**
  Projector, 3 minutes: the four things an agent gets here (rules file, skill, MCP server,
  hook), then `CLAUDE.md` → "Definition of Done" and `.claude/settings.json` →
  `hooks.PostToolUse` → `.claude/hooks/format-edited.sh`. Exercise, 7 minutes: ask which commands the Definition of
  Done lists; delete the `npm run check:stories` line from the list and save; `/clear`, ask
  again; put the line back. Signal: the second answer no longer names `check:stories`, and
  the line is back in `CLAUDE.md` (D2B00-C3). Rehearsal
  check 4: log whether the two answers differ as described.
- No check otherwise. Time it.

**Block 01 — Design in Figma and the handoff document 🔴**
_Done when:_ a master plus a filled handoff document, including its deliberate differences.

- Open the prepared duplicate of the Atelier file on the machine, the one copy used on
  both days (a second one has a new file key that no longer matches `package.json`);
  never mutate the original.
  Copy and rename the starter frame from the Workshop Templates page (Toast /
  Starter, StatCard / Starter, TagChip / Starter or Avatar / Starter, plus
  Variant Matrix / Scaffold).
- 5 min open the duplicate + starter frame, ~40 min manual design in the Figma UI,
  ~20 min MCP structuring (component properties, a11y audits), 5 min ladder stage 0 (the
  Figma linter, the same prompt as Day 1 Block 03, on your own component set: fix the real
  findings, note the false alarms), 5 min LLM-friendly API rules (before the handoff: it fixes
  the prop names), ~12 min handoff, 3 min recap. Target: ≥ 2 variants × 2 states, properties,
  correct `--ui-*` tokens, a dark-mode variant; the exact matrix is in the
  brief. Skill: `figma-workspace-architect` ("used here for the first time").
  Record which brief you built and whether it was clear enough to draw from.
- **STOP — the handoff document.** Before opening Claude for Block 02, write
  it. The page's list: file URL + node id, chosen variants/states, token
  bindings, reuse vs. rebuild, the behaviour from the brief, explicit
  exclusions, target files, acceptance criteria, and a ninth item, **Deliberate
  differences** (what the code will do differently from the design on purpose, and why) —
  "a checklist, not a template". Worked example: `/design-to-code#handoff-example` ("Filled handoff
  document"). Participants do **not** get the `design-to-code` skill, so do not
  rely on it to prefill anything. Record how long writing took and which line
  you had to decide yourself (the block's recap question).
- **Abort criterion for this 🔴 block:** not specified on /schulung. The
  carried-over proposal (finish with whatever scope was built, write the
  handoff from that) is a trainer decision, undecided, not an agreed rule.
  Record whether the block overran and what ran long (the 5/40/20/5/5/12/3 split is
  unverified).

**Block 02 — Component and stories from the handoff**
_Done when:_ the component from your handoff document runs in Storybook with one story per
variant value, and `docs-show` describes it: a description for the component and a line per
property.

- 11:15–11:17: start `npm run storybook` if it is not running; `/mcp` shows `storybook-local`
  connected; expect the dev/test tools (`get-storybook-story-instructions`,
  `stories-preview`, `test-run`) to be listed, identical for all three frameworks since
  Storybook 10.6.0. No `claude mcp add` step, nobody types a server in.
- **STOP** if any of those three is missing: Storybook is not running on :6006 (or was
  started after the session). Start it, `/mcp` → reconnect. `get-storybook-story-instructions`
  is mandatory before every `*.stories.*` edit.
- Prompt from the **handoff document** (golden prompts §2.1, no contract; nothing about a
  contract file on the projector), not the picture alone, including its deliberate
  differences as they are. One step: the component with its test, and the stories, one story
  per variant value and Boolean state, a `play` for every behaviour line of the document.
  Then look at the result: open every story in the running Storybook (or `stories-preview`),
  compare by eye with the Figma master, hand what is wrong back to Claude by prompt
  (48-minute row, 11:17–12:05). Record how many seats had a rendering story at 12:05 (rule
  R9 at 30 percent: the `docs-show` row then becomes a trainer demo on one green seat).
- **STOP — what the agent can read about your component (12:05–12:20, 15 minutes).** Part 1,
  10 minutes (golden prompts §2.5): `docs-list`, then `docs-show` on your own component
  through `storybook-local`; list what an agent would have to guess (no component
  description, a property without a description, a value set shown as a bare alias); Claude
  adds the JSDoc; call `docs-show` again and compare. Part 2, 5 minutes: the running stories
  next to the Figma component, every variant and state, differences written down as a list.
  Rehearsal check 5: log whether the call works over the running local MCP and whether the
  entry refreshes after a JSDoc edit without a restart. Fallback without the MCP:
  `npx storybook tools --config-dir workshop-<fw>/.storybook --json docs show --input '{"id":"<id>"}'`
  (measured 2026-11-18 on the 0.4.10 Angular scaffold: a new component with a story appears
  in `docs list`; `docs show` prints Inputs, Outputs and the JSDoc line where one exists).
- No `figma:snapshot`, no `check:contracts`, no finding codes in this block. The
  `atelier-component` skill no longer has a contract step (scaffold release of 2026-11); if
  the agent on your seat writes a contract file anyway, log what it did and leave the file
  alone.
- The scaffold's checks are the participant's own: **red means red, not "red by
  design"** (`/schulung`, Success verification). No check is expected to fail
  for a reason you cannot fix; record any that does. The old clone-era "three
  expectedly red gates" no longer apply and must not be used as a comparison.

**Block 03 — Iterate: prompt quality and the self-healing loop**
_Done when:_ stories are green, and the prompt was revised at least once with
the reason stated.

- Golden prompts (token fidelity, `--ui-*` custom properties, the three
  correction prompts): `tasks/schulung-golden-prompts.md` §2.2–2.4 (the trainer
  hands them out on site; they are not in the participant workspace; §2.1, the
  generation prompt, belongs to Block 02). Note which
  correction prompt got used and on which failure.
- Test loop in all frameworks (ladder stage 4: the agent runs `test-run`, gets the failure,
  repairs): local addon MCP, `stories-preview` + `test-run`
  with a11y. The page says `npm test` (`check:unit`) covers **only the unit
  half**; the equivalent of `test-run` is `npm run check:stories` (every story
  in Chromium, play assertions, axe). A green unit run is not a green story run.
- Paste error messages back to Claude instead of debugging yourself; time it
  and note friction. Record the prompt revision and the reason for it (the
  block's Done-when requires it).
- Commit when the stories are green; after two failed fixes stop, re-diagnose and revert
  with `git reset --hard HEAD && git clean -fd -- workshop-<fw>/src` instead of a third patch. Note whether
  the seat had a commit to fall back to (commits after Day 1 Blocks 02, 04, 05 and
  Day 2 Block 02, R-226), and whether the `clean` removed the agent's new files and
  nothing else.

**Block 04 — Verify: a11y, states, parity**
_Done when:_ the component works by keyboard and has no open accessibility finding,
dark mode switches through tokens, and every difference to Figma is sorted (code / Figma /
kept on purpose; "kept on purpose" points at the handoff document's "Deliberate
differences" section and is new today, Day 1 used code and Figma).

- Three-step a11y check: `figma_audit_component_accessibility` (needs the
  bridge), the Storybook a11y panel (axe-core), a keyboard walkthrough. Golden
  prompts: `tasks/schulung-golden-prompts.md` §3.1.
- **Dark mode (ADR-0142):** use the **theme control in the Storybook toolbar**
  (`withThemeByDataAttribute` from addon-themes, sets `data-theme` on `html`,
  exactly the selector `tokens.css` switches on). The **backgrounds** control
  is canvas colour, not a theme; confusing the two was the bug ADR-0142
  removed. **Green means failure:** axe runs only in light mode in
  `check:stories`, so a green `storybook-test` says nothing about dark mode —
  the toggle is a manual preview, not test coverage. Walk the dark state by eye
  and log what you saw. Golden prompt for the dark-mode token audit:
  `tasks/schulung-golden-prompts.md` §3.2.
- **STOP — the parity report (15:45–15:53, 8 minutes).** Run the parity prompt on your own
  component (same shape as Day 1, node id from the handoff document; golden prompts §3.3
  rewritten as that prompt). No `codeSpec` assembly, no `check:contracts -- --emit` as a
  participant step. Without a connected bridge there is no parity call (a **degraded run,
  not "just carry on"**): sort the Block 02 list and log the run as degraded.
- **Trainer-machine preparation for D-8 (not a participant step):** the double call (§3.5)
  and the codeSpec assembly (§3.4) are trainer-only now, shown on the trainer
  machine only, about 3 minutes inside the parity row: a field you do not pass is not
  compared, so a quiet report is not a clean component. If you rehearse them, label the
  notes "trainer machine, D-8": call 1 adds a hand-written `spacing` section with a
  deliberately wrong value and must flag it; call 2 omits it. Run once on 2026-10-14
  against AtlButton (R-047): call 2 shows no spacing row and the score rises 48 → 72; the
  four-plus-spacing variant has not been run live (R-227). Per `libs/design-contracts/README.md`,
  `check:contracts --emit <folder>` writes `<folder>/<fw>/<Name>.codespec.json`. This is
  preparation for the demo, not a path any participant walks.
- Sort every difference (20-minute row, 15:53–16:13): the parity list plus the list from
  Block 02, one label each: code (hand it back to Claude, fixed inside this row), Figma (a
  note for the designer; the master is not changed now) or kept on purpose (it must be in the
  handoff document's "Deliberate differences"; if it is not there, write it there and say
  why, or it is code or Figma). "Kept on purpose" is the new third label. Log which one you
  almost mislabelled (the recap question; the classic one is "fixing" in code what was kept
  on purpose) and whether the time held.

**Block 05 — Show & tell and transfer to "My DS"**
_Done when:_ everyone leaves with a next step for their own design system, and
a follow-up channel is set up.

- Up to 8 participants, 65 minutes: strictly 3 minutes each.
  Show your component, one prompt that worked and one that failed. **Time it**:
  8 × 3 min = 24 min leaves 41 for the trainer synthesis (8), the workspace
  anatomy (15), the transfer step (12) and the exit round (3); log whether the block holds at the cohort size, a solo run can only
  simulate this.
- Trainer synthesis: prompt patterns that worked, anti-patterns, when Claude
  fails, how to deal with drift.
- **Workspace anatomy (15 min):** `.mcp.json` (two roles: in your own repo the library half is
  your library's manifest or package, the local half is the addon MCP of the Storybook you
  already run), `CLAUDE.md`,
  `.claude/skills/`, `.claude/settings.json` (permissions and the format hook),
  `.claude/commands/verify.md` (the one proof command), `.claude/agents/component-review.md`
  (a review agent the workspace ships), `tools/design-contracts/` + `contracts.config.json`
  (a one-sentence trainer mention), `.storybook/main.ts` addons, the `package.json` scripts. Then the order to copy them into your own repo, most
  portable first, as on `/build-your-own` (Storybook MCP, rules file with the check
  commands, TypeScript + ESLint + stylelint, story tests with axe, proof command and
  hooks, skills, the contract check last and optional). Add the one sentence: you take the workspace home as it
  is on the course machine, and the trainer tells you how (`TODO(owner)`: how it leaves
  the machine). Record whether 15 minutes held.
- **Transfer step (12 min):** the scorecard (`workshop/handouts/ds-scorecard.md`) is the
  frame: mark the seven rows for your own design system (yes / partly / no), pick the weakest
  row, then start the checklist that matches it (the Figma or the Storybook checklist; both
  are handouts; `/readiness`, `/storybook-readiness#self-check`,
  `/design-principles#check-your-own` hold the how) and pick one finding; the fix is the
  written next step, not room work. Rehearsal check 7 (owner): a FigmaLint run without an API
  key, for the conditional transfer-slide bullet. For the rehearsal, name a
  stand-in system and note it; the page assumes participants bring their own.
- A follow-up channel is part of the Done-when; how it is set up: not
  specified on /schulung. Record what you would use.
- Exit round: one sentence each — the first thing you will do in your own
  design system next week.

**End of Day 2 — Success verification.** Walk the outcomes and the proof line of
the "Success verification" section on `/schulung` in order against your own
component (re-read the page: another change set edits it). Log each as pass/fail/ambiguous
in §5, quoting the actual command or tool output you saw, not a paraphrase. Success is the
component with its stories, and every difference to
Figma sorted (code / Figma / kept on purpose); there is no contract file and no
`check:contracts` to show. Items, in outline: (1) component set in your duplicate of the
Atelier file with variants, properties, dark-mode variant; (2) `npm run storybook` running
and showing the component, one story per variant value; (3)
works by keyboard, and neither `figma_audit_component_accessibility` nor the Storybook a11y
tab reports an open finding; (4) dark mode switches through the token override; (5) every
difference to Figma (the parity list and the Block 02 list) is sorted and none is left
unexplained, a quiet parity report not being a clean component (bridge required for the
parity part); proof line: `/verify` runs through, the checks it lists, each exit 0. Run each
check as `cmd > /tmp/x.log 2>&1; echo $?` and read the exit code, not the tail of the
output.

---

## 5. Findings

Same severity vocabulary as the prior reviews, so this run's output slots in
next to theirs:

- **Blocker** — following the material as written, the run cannot reach the
  block's checkpoint.
- **Major** — wrong, misleading, or missing in a way that cost ≥15 min or
  needed an undocumented workaround.
- **Minor** — wrong but cheap and local.

Fill in one row per thing you hit — including things that worked exactly as
documented; a clean row is data too, and lets a future reader tell "checked,
fine" apart from "never reached."

| #   | Severity | Location | Evidence | Smallest fix | Verified / assumed |
| --- | -------- | -------- | -------- | ------------ | ------------------ |
|     |          |          |          |              |                    |

---

## 6. Weakest point of this run

Write this last, the way each prior review does: name the one thing this
rehearsal still didn't settle, and why. (Candidates already known going in:
whether a cohort-sized concurrent load on Figma and the Claude subscription behaves
differently than a solo session (the hosted Storybook endpoints are no longer in a seat's
path, ADR-0182); whether a genuinely first-time Figma user's
timing on Day 2 Block 01 matches this run's, since this kit is still run by
someone who already knows the repo; whether Day 2 Block 05 holds at 8
participants.)

---

## 7. Verification status of this kit

- The block names, times, Done-when clauses, the success-verification items (eight
  until 2026-11-17, five outcomes plus a proof line since) and the skills list were compared against `docs/src/pages/schulung.astro` on
  2026-10-11 when the kit was retargeted (R-037–R-039). That is a reading of the
  page, not a run.
- The earlier 2026-09-06 live checks (clone-era `nx storybook react`, `:4401`,
  `claude mcp add` against it, the six-gate spec-placement table, `solved-*`
  branch listing) were for the old clone path and were **removed**; none of
  them is re-verified for the scaffold. Everything marked as expected above for
  the scaffold (ports, script names, file locations) comes from `/schulung`,
  ADR-0137 and ADR-0142 and has **not** been executed by this kit.
- The kit has never been run (`tasks/todo.md`). Running it is the next task;
  fixing what it finds is the one after.

---

## 8. What this kit deliberately leaves out

- The curriculum content itself — every block's _teaching_ material stays on
  `/schulung`; duplicating it here would drift the moment it changes, which is
  the exact failure mode the 2026-10 review work was about.
- A cohort-scale test (concurrent seats, a Figma plan tier check, the Claude subscription's
  usage limits; the hosted Storybook endpoints are no longer in a seat's path, ADR-0182) — needs a cohort, not a solo rehearsal; tracked separately in
  `tasks/todo.md`'s trainer-kit checklist (see also R-049).
- Fixing anything this run finds. That's the findings table's job.
- The Claude Design appendix and the `solved-*` recovery path (§1).
