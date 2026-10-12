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
concurrent-seat load on the hosted MCP endpoints, a room full of simultaneous
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
(`nx serve workshop-<fw>`), the contract in `workshop-<fw>/src/contracts/`, and
the scaffold's own gates (`check:contracts`, `check:stories`, …). The Atelier
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

| Item                                  | Why it's blocked                                                                                                                                                                                                                                                                                                                         | What to do instead                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Design demo (trainer appendix) | **Not a block step.** `/schulung` has it as an optional trainer appendix (`#appendix-claude-design`), trainer machine only: `claude.ai/design` needs a different login than the cohort API key. The page says to slot it into Day 1 Block 04 "if time allows, or skip it" (owner decision 2026-10-10). Participants cannot reproduce it. | Leave it out of the rehearsal's checklist and timing. If you want to see it, run it as a separate trainer exercise after the timed run, not inside Day 1 Block 04.                                                                                                                                                         |
| Figma Desktop Bridge                  | Not automatic. Every `figma_*` MCP call (Day 2 Block 01/02/04) depends on the bridge plugin imported in the Figma desktop app (Plugins → Development → Import plugin from manifest…, `/schulung` Day 1 Block 01). `/schulung` says the bridge gates Day 2.                                                                               | Before relying on _any_ `figma_*` tool: Figma Desktop open, your duplicate open, bridge plugin running, then ask Claude to check Figma status and confirm it is connected. Re-check after any Figma restart. How the connected state is read: not specified on /schulung (see `/troubleshooting`: "bridge not connected"). |
| `solved-*` recovery branches          | None exist. Whether they make sense for scaffold-based participants is an open owner question.                                                                                                                                                                                                                                           | Recovery path: see R-005 / R-042, not decided. For the rehearsal itself, protect your own progress the ordinary way (local commit or `git stash` before anything risky) — a rehearsal convenience, not something to teach a cohort.                                                                                        |
| Figma access token                    | `/schulung` Day 1 Block 01: the token is technically optional (REST reads only) and a cohort-policy decision.                                                                                                                                                                                                                            | Decide before the run whether you rehearse with or without it, and write the choice into §5. Which one a cohort gets: not specified on /schulung.                                                                                                                                                                          |

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

---

## 3. Timing tracker

Fill in as you go. Planned times are the schedule on `/schulung`; nothing
about them has been measured before this run. Break rows are the gaps between
the page's block times. The page gives the break format as "60 min lunch · 2×
15 min coffee breaks · 10 min buffer" per day; which gap is which is not
labelled on /schulung (the 10-minute gap before the last two blocks is the
buffer by arithmetic only).

### Day 1 (planned net 6 h 50 min)

| Block                                     | Planned          | Actual start | Actual end | Delta | Note |
| ----------------------------------------- | ---------------- | ------------ | ---------- | ----- | ---- |
| 00 Kickoff and thesis                     | 09:00–09:30 (30) |              |            |       |      |
| 01 Verify the setup 🔴                    | 09:30–10:45 (75) |              |            |       |      |
| — gap —                                   | 10:45–11:00      |              |            |       |      |
| 02 Mini-loop: first success               | 11:00–12:15 (75) |              |            |       |      |
| — gap —                                   | 12:15–13:15      |              |            |       |      |
| 03 Figma for code: is the file ready?     | 13:15–14:30 (75) |              |            |       |      |
| — gap —                                   | 14:30–14:45      |              |            |       |      |
| 04 Guardrails: stories as claims, and MCP | 14:45–16:00 (75) |              |            |       |      |
| — gap —                                   | 16:00–16:10      |              |            |       |      |
| 05 Kata against the clock                 | 16:10–17:15 (65) |              |            |       |      |
| 06 Recap and exit ticket                  | 17:15–17:30 (15) |              |            |       |      |

### Day 2 (planned net 6 h 50 min)

| Block                                                | Planned          | Actual start | Actual end | Delta | Note |
| ---------------------------------------------------- | ---------------- | ------------ | ---------- | ----- | ---- |
| 00 Recap (active recall), brief, skills              | 09:00–09:30 (30) |              |            |       |      |
| 01 Design in Figma and the handoff document 🔴       | 09:30–11:00 (90) |              |            |       |      |
| — gap —                                              | 11:00–11:15      |              |            |       |      |
| 02 Contract, component, stories                      | 11:15–12:30 (75) |              |            |       |      |
| — gap —                                              | 12:30–13:30      |              |            |       |      |
| 03 Iterate: prompt quality and the self-healing loop | 13:30–15:00 (90) |              |            |       |      |
| — gap —                                              | 15:00–15:15      |              |            |       |      |
| 04 Verify: a11y, states, parity                      | 15:15–16:30 (75) |              |            |       |      |
| — gap —                                              | 16:30–16:40      |              |            |       |      |
| 05 Show & tell and transfer to "My DS"               | 16:40–17:30 (50) |              |            |       |      |

---

## 4. The path — checkpoints, expected signal, false-positive traps

Commands run in the scaffolded workspace (ADR-0137), a shell in its root,
Claude Code CLI logged in with your own API key. Every block's **Done when** is
quoted from `/schulung` (`Block.done`); log pass/fail against it in §5.

**Time-recovery cuts:** `/schulung` names none. Its only flexibility is the
Claude Design appendix ("slot it into Day 1 Block 04 if time allows, or skip
it") and the per-block stretch tasks, which are for fast finishers, not cuts.
Any cut order for a block that runs long: not specified on /schulung. Do not
invent one live; record the overrun and which bullet ate the time.

### Day 1

**Before 09:00 (once):** the pre-workshop setup is mandatory homework
(`/schulung`, "Format per day"): Node ≥ 22.12 LTS, Claude Code CLI, Figma
account with draft rights plus the imported Desktop Bridge plugin,
`npm run preflight` green. Do it before the clock starts and note how long it
took; Block 01 only _verifies_ it.

**Block 00 — Kickoff and thesis** (talk + live demo).
_Done when:_ everyone can name the loop: Inspect → Contract → Code → Verify.
No gate. Time it. Includes a 5-minute live demo (change an Atelier component by
prompt); whether the live demo ran in the rehearsal workspace or needs the
Atelier clone: not specified on /schulung — record what you used.

**Block 01 — Verify the setup (installed as homework) 🔴**
_Done when:_ preflight is green, `/mcp` lists every server, Storybook runs,
Playwright Chromium is installed, and anyone still red has a rescue path.

- Node ≥ 22.12 active (preflight accepts 22.12 or newer); own workspace
  created with `npx create-atelier-ui-workspace`, one framework chosen (Angular).
- Run `npm run preflight`. Expect a clean run. The page says it checks
  Node/npm, that the CLI exists (`which claude` + `claude --version`), the
  Figma bridge, MCP reachability and ports, and that it does **not** check that
  the API key is valid: it sends no model request.
- **STOP.** A green preflight proves exactly that list, nothing more. Record
  whether the summary read as "everything is ready" to a first-time reader.
- Confirm model access separately: `claude auth login --console` (or
  `ANTHROPIC_API_KEY` set), then `claude -p "Reply with exactly: PREFLIGHT-OK"`.
  A reply instead of an auth error means access is real. The page's own
  sentence: _"An installed CLI, a connected MCP and usable model access are
  three different things."_ Record whether a green `preflight` alone gave the
  false impression that this was already covered.
- Read `.mcp.json` together; run `/mcp` in Claude Code and compare against the
  file. Server names the page uses elsewhere: `storybook-<framework>`,
  `nx-mcp`, `figma-console`, `uianatomy` (Block 04). The exact server list of
  the scaffold's `.mcp.json`: not specified on /schulung — write down what you
  actually see.
- Storybook runs (`npm run storybook`, `localhost:6006`, ADR-0137); Playwright
  Chromium installed.
- **Abort criterion for this 🔴 block:** the page names the rescue path only as
  `/troubleshooting` ("when something fails") and its Done-when clause "anyone
  still red has a rescue path". A time threshold (for example "15 minutes
  before the end") and the pairing rule: not specified on /schulung. Record
  whether you needed a rescue and what it was.

**Block 02 — Mini-loop: first success** (hands-on, everyone in sync).
_Done when:_ the Settings Card runs, and the parity report is present and has
been read, not just "green".

- Follow `/tutorial`: Figma → MCP → token-exact code in 4 steps; compose the
  Settings Card from `AtlCard` / `AtlInput` / `AtlToggle` / `AtlButton` in the
  cohort framework **by prompting, not typing**. Note whether "prompt, don't
  type" needed active enforcement or happened naturally.
- Per the page's trainer note, the tutorial's verify step runs only
  `npm run check:contracts` and `npm run check:stories` (offline gates against
  the scaffolded workspace). Expect both exit 0. Participants do not author a
  contract here; that arrives on Day 2.
- **STOP — read the parity report line by line** before calling it done. Log
  what it compared and what it did not (the block's recap question). A green
  report you did not read is the failure case this block exists to catch.
- Whether the tutorial's `figma_check_design_parity` call needs the connected
  bridge: not specified on /schulung for this block (it is stated for Day 2
  Block 04) — record what you hit.

**Block 03 — Figma for code: is the file ready?** (guided tour + checklist).
_Done when:_ the readiness checklist is filled in for one master of the Atelier
file and for one master from your own design system.

- Open the Atelier file; tour variables (primitives → semantic → component),
  component sets/variants/properties/auto layout, modes, Inventory vs.
  Components page. Run the **pink test** on a master (`/tokens#pink-test`) and
  say what it showed. Checklist: `/readiness`; naming: `/tokens#naming`.
- No gate. If the rehearsal seat lacks Figma draft rights (File → Duplicate to
  your drafts unavailable), that is a finding: it blocks Day 2 Block 01
  outright. The "master from your own design system" needs one; a stand-in for
  a solo rehearsal: not specified on /schulung.

**Block 04 — Guardrails: stories as claims, and MCP** (hands-on demo).
_Done when:_ one story plus a `play` function written, seen red once and then
green, and `docs-show` called.

- Hosted Storybook: look up Button with `docs-show`. Expect the docs back
  **shaped for the cohort framework** (Angular: two-way `[(checked)]`-style
  bindings and split inputs/outputs, ADR-0097); a React-shaped reply (JSX,
  `children`, `on*Change`) is a real regression, say so.
- Two Storybook details the page says are explained nowhere else: the Design
  tab (addon-designs, `parameters.design`) and the contract section at the
  bottom of every Docs tab (`contractDocsPage`, ADR-0121 S5b). Confirm both are
  visible in the workspace's Storybook; if the scaffold lacks one, record it.
- Negative demo: same question in a browser chat without MCP — expect a
  hallucination (illustrative only, nothing to run). Then with MCP — a correct
  answer.
- Live exercise: ask Claude for Button props, print token values, preview in
  chat. Ask the MCP server for a prop that does not exist (page stretch) and
  expect "not documented", not an invention.
- **STOP — the red-then-green story.** Write one story with a `play` function
  for a variant, watch it **fail**, fix it, watch it pass. If it never failed,
  the story claims nothing (green means failure here): record it.
- The Claude Design demo is the optional appendix, not a step here (§1).

**Block 05 — Kata against the clock** (hands-on, no guidance).
_Done when:_ the kata is green and every parity finding is labelled.

- `/first-component`: the 15-minute kata, the same Settings Card frame
  (node `936-2954`) as a second round, seven copy-paste steps, ending with
  `figma_check_design_parity`. Prompts for this block: `tasks/schulung-golden-prompts.md`
  §1 (its block heading predates the current names; the prompt is for the Day 1
  kata/walkthrough).
- The component lives under `workshop-<fw>/src/` and is viewed with
  `nx serve workshop-<fw>` (the kata page's step 4), app on `localhost:4200`.
- Label every parity finding: code, Figma, or contract. Log how many minutes
  the kata actually took against its 15-minute claim, and what the other 50 of
  the block's 65 minutes were for: not specified on /schulung.

**Block 06 — Recap and exit ticket** (discussion).
_Done when:_ a brief is chosen. Homework: duplicate the Figma file and sketch
the component.

- Choose one of the four briefs (Toast / TagChip / StatCard / Avatar), found in
  `workshop/briefs/`. Catch-up homework for anyone who did not finish the kata:
  play `/first-component` through alone.
- Exit ticket: one sentence on what you will check first next time before
  trusting AI output. No gate. Time it.

### Day 2

**Block 00 — Recap (active recall), brief, skills** (talk).
_Done when:_ everyone knows their target component and their skills are
installed.

- **STOP — check the skills are really installed.** The page lists exactly
  what the scaffold installs: `atelier-component` (the workspace's own skill,
  carries the rest of the day from Block 02 on), `uianatomy-mcp`,
  `figma-workspace-architect` (only in workspaces generated with Figma), and
  the four Storybook skills (ADR-0167). Look in the workspace's `.claude/`
  folder and confirm each is present; `design-to-code`, `atelier-design` and
  `artboard-bridge` are repo/trainer-only and must **not** be there. A skill
  you assume is installed but is not is the failure this block covers; also
  record whether you could tell that a skill had triggered.
- Day 1 recap as active recall (participants answer, trainer does not lecture);
  present the brief (anatomy, axes, states, a11y requirements); show the
  uianatomy MCP and use it to introduce skills.
- No gate otherwise. Time it.

**Block 01 — Design in Figma and the handoff document 🔴**
_Done when:_ a master plus a filled handoff document.

- Duplicate the Atelier file into your own drafts — never mutate the original.
  Copy and rename the starter frame from the Workshop Templates page (Toast /
  Starter, StatCard / Starter, TagChip / Starter or Avatar / Starter, plus
  Variant Matrix / Scaffold).
- ~45 min manual design in the Figma UI, ~45 min MCP structuring (component
  properties, a11y audits). Target: ≥ 2 variants × 2 states, properties,
  correct `--ui-*` tokens, a dark-mode variant; the exact matrix is in the
  brief. Skill: `figma-workspace-architect` ("used here for the first time").
  Record which brief you built and whether it was clear enough to draw from.
- **STOP — the handoff document.** Before opening Claude for Block 02, write
  it. The page's list: draft URL + node id, chosen variants/states, token
  bindings, reuse vs. rebuild, the behaviour from the brief, explicit
  exclusions, target files, acceptance criteria — "a checklist, not a
  template". Worked example: `/design-to-code#handoff-example` ("Filled handoff
  document"). Participants do **not** get the `design-to-code` skill, so do not
  rely on it to prefill anything. Record how long writing took and which line
  you had to decide yourself (the block's recap question).
- **Abort criterion for this 🔴 block:** not specified on /schulung. The
  carried-over proposal (finish with whatever scope was built, write the
  handoff from that) is a trainer decision, undecided, not an agreed rule.
  Record whether the block overran and what ran long (the ~45/~45 split is
  unverified).

**Block 02 — Contract, component, stories**
_Done when:_ `check:contracts` is green offline.

- Start `npm run storybook` in parallel, then connect the local MCP:
  `claude mcp add --transport http storybook-local http://localhost:<port>/mcp`
  (use the port Storybook prints; expect 6006). Deliberately **local** scope
  (the default): `git status --short .mcp.json` stays empty before and after.
  Reconnect the client and expect the dev/test tools
  (`get-storybook-story-instructions`, `stories-preview`, `test-run`) to be
  listed, identical for all three frameworks since Storybook 10.6.0.
- **STOP** if any of those three is missing: that means "not configured", not
  "server down" (the page's own wording). `get-storybook-story-instructions`
  is mandatory before every `*.stories.*` edit.
- Prompt from the **handoff document**, not the picture alone. Claude produces
  the contract (typed through `ComponentContract` from
  `workshop-<fw>/src/contracts/types.ts`, imported relatively), the component
  with its test, and the stories **in one step**: one story per variant value
  and Boolean state, a `play` for every behaviour line of the document. The
  `atelier-component` skill treats it as one step.
- **STOP — the contract's home.** Confirm the contract landed in
  `workshop-<fw>/src/contracts/` in your own workspace. There is no shared
  master it could land in by accident, and no separate `Atl*Spec` interface
  file (ADR-0121). If something else happened, that is a finding.
- Snapshot: with the bridge connected, `npm run figma:snapshot` (first replace
  the `<YOUR_FIGMA_FILE_KEY>` placeholder in the script in `package.json` with
  your duplicate's key if not already set). Writes `tools/figma/snapshot.json`
  (pre-filled only with the AtlButton example).
- Run `npm run check:contracts`. **Green means failure** if the snapshot was
  not refreshed: your component is then missing from `tools/figma/snapshot.json`
  and the check reports `[NO-MASTER]` as a warning, not a failure. Read the
  output for `[NO-MASTER]` and `[COVERAGE]`, not only the exit code. Check
  `npm run check:contracts -- --emit <folder>` writes the codeSpec fragment
  (componentAPI, metadata, tokens) Block 04 needs.
- The scaffold's gates are the participant's own: **red means red, not "red by
  design"** (`/schulung`, Success verification). No gate is expected to fail
  for a reason you cannot fix; record any that does. The old clone-era "three
  expectedly red gates" no longer apply and must not be used as a comparison.

**Block 03 — Iterate: prompt quality and the self-healing loop**
_Done when:_ stories are green, and the prompt was revised at least once with
the reason stated.

- Golden prompts (token fidelity, `--ui-*` custom properties, the three
  correction prompts): `tasks/schulung-golden-prompts.md` §2 (the trainer hands
  them out on site; they are not in the participant workspace). Note which
  correction prompt got used and on which failure.
- Test loop in all frameworks: local addon MCP, `stories-preview` + `test-run`
  with a11y. The page says `nx test <lib> --watch` covers **only the unit
  half**; the equivalent of `test-run` is `nx storybook-test <fw>` (every story
  in Chromium, play assertions, axe). In the workspace the scaffold's script
  for that is `npm run check:stories`. A green unit run is not a green story run.
- Paste error messages back to Claude instead of debugging yourself; time it
  and note friction. Record the prompt revision and the reason for it (the
  block's Done-when requires it).

**Block 04 — Verify: a11y, states, parity**
_Done when:_ `storybook-test` with axe is green, and every parity finding is
triaged (code / Figma / contract).

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
- **STOP — assembling the codeSpec and the parity call.** codeSpec per the
  page: `check:contracts --emit libs/<fw>/src/lib/<name>/codespec` yields
  componentAPI, metadata, tokens, nothing more; for accessibility, copy the
  story root's `outerHTML` from DevTools and pass it as `html` with
  `mapToCodeSpec: true` to `figma_scan_code_accessibility`. (Check the
  `--emit` path against the scaffold's layout: the page's path starts with
  `libs/<fw>/`; whether the scaffold uses that tree is not specified on
  /schulung — record the path you really used.)
- Call `figma_check_design_parity` **once, on purpose**, against an incomplete
  codeSpec: falsify one spacing value deliberately. The page's claim: only with
  complete fields must the report flag the deviation; fields not passed are
  **not compared**, and a thin codeSpec (componentAPI + metadata + tokens +
  accessibility) is the normal case. Optional second call: same wrong value,
  `spacing` supplied vs. omitted (ready-to-paste: `tasks/schulung-golden-prompts.md`
  §3.3). If the omitted-field call does **not** come back clean, that
  overturns a claim; record a blocker.
- Without a connected bridge the loop ends after `check:contracts` +
  `storybook-test` (no snapshot, `[NO-MASTER]`, no parity call): the page calls
  that a **degraded run, not "just carry on"**. If you hit that, log the run as
  degraded.
- Triage every parity finding: code, Figma or contract. Log which one you
  almost mislabelled (the recap question). Finding codes:
  `/design-to-code#finding-codes`.

**Block 05 — Show & tell and transfer to "My DS"**
_Done when:_ everyone leaves with a next step for their own design system, and
a follow-up channel is set up.

- Up to 8 participants, 50 minutes: about 5 minutes each, including questions.
  Show your component, one prompt that worked and one that failed. **Time it**:
  8 × 5 min = 40 min leaves 10 for the trainer synthesis and the transfer
  step; log whether the block holds at the cohort size, a solo run can only
  simulate this.
- Trainer synthesis: prompt patterns that worked, anti-patterns, when Claude
  fails, how to deal with drift.
- **Transfer step:** run the self-check from `/design-principles#check-your-own`
  on your own design system and pick one next step. For the rehearsal, name a
  stand-in system and note it; the page assumes participants bring their own.
- A follow-up channel is part of the Done-when; how it is set up: not
  specified on /schulung. Record what you would use.
- Exit round: one sentence each — the first thing you will do in your own
  design system next week.

**End of Day 2 — Success verification.** Walk all **8** items of the "Success
verification" section on `/schulung` in order against your own component. Log
each as pass/fail/ambiguous in §5, quoting the actual command or tool output
you saw, not a paraphrase. Items, in the page's order: (1) component set in
your own Figma draft with variants, properties, dark-mode variant; (2)
`/verify` or the five checks one by one (`check:format`, `check:stylelint`,
`check:contracts`, `check:unit`, `check:stories`), each exit 0; (3)
`npm run storybook` running and showing the component (canvas + Docs tab); (4)
test loop green (`test-run` or `npm run check:stories`; `check:unit` is no
substitute); (5) `figma_audit_component_accessibility` without critical
findings **and** the Storybook a11y tab without axe findings; (6) dark mode
switches through the token override; (7) `figma_check_design_parity` on your
own node (bridge required) — green proves something only for the sections
passed; (8) `check:contracts` with your own flags exits 0, and
`nx storybook-test <fw>` is green. Run each gate as `cmd > /tmp/x.log 2>&1; echo $?`
and read the exit code, not the tail of the output.

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
whether a cohort-sized concurrent load on the hosted MCP endpoints behaves
differently than a solo session; whether a genuinely first-time Figma user's
timing on Day 2 Block 01 matches this run's, since this kit is still run by
someone who already knows the repo; whether Day 2 Block 05 holds at 8
participants.)

---

## 7. Verification status of this kit

- The block names, times, Done-when clauses, the 8 success-verification items
  and the skills list were compared against `docs/src/pages/schulung.astro` on
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
- A cohort-scale test (concurrent seats, hosted-MCP rate limits, a Figma plan
  tier check) — needs a cohort, not a solo rehearsal; tracked separately in
  `tasks/todo.md`'s trainer-kit checklist (see also R-049).
- Fixing anything this run finds. That's the findings table's job.
- The Claude Design appendix and the `solved-*` recovery path (§1).
