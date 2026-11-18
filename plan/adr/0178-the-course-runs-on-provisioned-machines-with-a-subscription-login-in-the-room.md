---
status: accepted
date: 2026-11-12
sources:
  - owner decisions, 2026-11-12 (course walkthrough, this session)
  - plan/adr/0175-day-1-block-05-screen-from-storybook.md (this ADR corrects its slot and timebox, 65 → 80 min)
  - plan/adr/0137-the-scaffold-becomes-the-environment-the-cohort-works-in.md (the environment stays; who creates it changes)
  - tasks/todo.md, "Course walkthrough (started 2026-11-12)" (the machine-time spike and the hosted-endpoint load probe)
  - tasks/reviews.md R-213, R-218, R-225, R-234
---

# ADR-0178: The course runs on provisioned Conciso machines with a subscription login in the room, and Day 1 is re-timed around that

## Status

Accepted. Recorded at decision time. The Day 1 frame carries the owner's "looks good for now": it
is the frame the R-040 rehearsal measures, not a frame the rehearsal has confirmed.

## Context

Until 2026-11-12 the two-day course assumed that every participant brings their own laptop and
arrives with the setup done: Node, the Claude Code CLI with an API key, a Figma account with
draft rights, the Desktop Bridge plugin, a scaffolded workspace, and `npm run preflight` green.
That was mandatory homework, checked by a mail three working days before Day 1 (R-213), and Day 1
Block 01 spent 75 minutes verifying it, with an 18-minute rescue slot and the lunch break as the
fix for red seats. A seat whose API budget ran out paired with a neighbour (R-218, rule R12).

The walkthrough of the risk blocks on 2026-11-12 changed the premises:

- **Conciso has Claude subscriptions for trainings and its own training machines.** The owner
  decided that all participants work on those machines and that the subscription login happens
  on Day 1 in the room.
- **Figma.** The Atelier file is publicly viewable, and the owner's first reading was that
  participants only read it. The material says otherwise: Day 1 Block 03 edits a copy of a master
  in the participant's duplicate, Day 2 Block 01 designs a component set in it, and
  `figma:snapshot` reads the duplicate's file key. The owner resolved it by provisioning: each
  machine gets Figma Desktop logged in with a Conciso account, the file duplicated once, and the
  Desktop Bridge imported.
- **Block 05 was measured, not estimated.** R-225 (second-model review, 2026-10-20) judged the
  65-minute timebox of "A screen from Storybook" infeasible. One headless run on the trainer
  machine against a fresh scaffold (`create-atelier-ui-workspace@0.4.10`) took 195 s for the build
  (`docs-list` once, `docs-show` six times, no hand-built element), 20 s for the four gates from a
  cold Nx cache, and 39 s for the receipts prompt. The hosted endpoint answered 96 of 96 requests
  from eight parallel clients (0.10 s average). So the machine needs about five minutes; the
  block's time is human time (approving, reading, judging), which the run did not measure.
- **The same run exposed a documentation gap.** On the Angular endpoint `docs-show` shows the
  sub-component tags (`atl-thead`, `atl-option`) but never the class names to import (`AtlThead`,
  `AtlTbody`, `AtlTr`, `AtlTh`, `AtlTd`, `AtlOption`) nor the package name; story snippets import
  from `./atl-table`. The agent took the names from the package's type exports. That breaks the
  exercise's premise ("the Storybook MCP is the only source") in a way no participant can avoid.

## Decision

1. **Provisioned machines.** Every participant works on a Conciso training machine. Nothing is
   installed at home; the setup homework and the preflight mail are gone from the course. What the
   course assumes of a machine when the participant sits down: Node ≥ 22.12; the Claude Code CLI
   installed and not logged in; one workspace from `create-atelier-ui-workspace --framework
angular --figma`, installed, with `npx playwright install chromium` run inside it (the
   scaffold's Playwright wants its own Chromium build); a git identity; Figma Desktop logged in
   with a Conciso account, the Atelier file duplicated once, its file key in the workspace's
   `package.json`, the Desktop Bridge imported. Provisioning itself, and how a seat is handed its
   training account, are the owner's organisation and are not specified here.
2. **Model access is a subscription login in the room.** Block 01 runs `claude auth login` (the
   CLI's default, the browser login of the seat's training subscription) and then
   `claude -p "Reply with exactly: PREFLIGHT-OK"`. API keys, `--console` and API budgets leave the
   course material. Rule R12 becomes "usage limit reached: pair with a neighbour".
3. **Day 1 frame.** Block 01 shrinks from 75 to 45 minutes and changes its job from "verify
   homework" to "log in, verify, learn the Claude Code basics"; the basics move from a slot for
   green seats to a row for everyone. The freed 30 minutes go to Block 02 (+15, the first hands-on
   use of an agent for people who have just met it) and Block 05 (+15). Lunch moves to 12:00.

   | Slot     | Time        | Min |
   | -------- | ----------- | --- |
   | Block 00 | 09:00–09:30 | 30  |
   | Block 01 | 09:30–10:15 | 45  |
   | Coffee   | 10:15–10:30 |     |
   | Block 02 | 10:30–12:00 | 90  |
   | Lunch    | 12:00–13:00 |     |
   | Block 03 | 13:00–14:15 | 75  |
   | Coffee   | 14:15–14:30 |     |
   | Block 04 | 14:30–15:45 | 75  |
   | Buffer   | 15:45–15:55 |     |
   | Block 05 | 15:55–17:15 | 80  |
   | Block 06 | 17:15–17:30 | 15  |

   Net stays 410 minutes. Day 2 is unchanged.

4. **Block 05 is 80 minutes and weighted towards judging.** Brief 5, build 30 (was 40), gates and
   receipts 15 (was 10), debrief 25 (was 7), recap 5. The hard stop for building moves to 16:30.
5. **The import-name gap is taught in cohort 1, not fixed.** `/screen-from-storybook` lists it as
   a fifth known gap, the only-source premise gets a one-sentence exception (import names come
   from the installed package's type exports, and the receipts say so), and the debrief asks where
   the agent got `AtlThead` from. The manifest fix is filed as R-234 for after the cohort.
6. **No homework that needs a machine** (default of the reconcile; the owner's verdict is open
   until the Block 06 walkthrough). The machines stay in the room, so Day 1's homework is the
   brief, a paper sketch if wanted, and the readiness form for the participant's own design
   system. The kata and the bridge exercise stay optional for people with their own machine and
   their own Claude access.

Rejected:

- **Keep bring-your-own-laptop and the homework.** It was the course's largest known risk: an
  unverified setup on eight unknown machines, one trainer, the lunch break as the repair shop.
  Conciso already owns the machines and the subscriptions.
- **Log in before Day 1, as part of provisioning.** The owner chose the room. It costs ten
  minutes and shows participants the one step they will repeat on their own machine.
- **Read-only Figma without accounts.** Not possible with the curriculum as written; removing the
  write steps would remove Day 1 Block 03's exercise and Day 2 Block 01.
- **Give all 30 freed minutes to Block 05.** That was the recommendation before the spike
  finished. The measurement showed the block is not short of build time, and Block 02 is where a
  first-time user of an agent needs slack.
- **Fix the manifest before the cohort** so `docs-show` names the imports. It is the better
  end state, but it changes docgen output for all three frameworks two weeks before the first
  cohort, and the gap is exactly the kind of finding the block exists to produce: participants'
  own Storybooks will have it too.

## Consequences

- The highest setup risk moves from the room to provisioning, where it can be checked days
  ahead by someone who has the machine in front of them. The course material no longer says how;
  if provisioning slips, Block 01's 45 minutes do not absorb it.
- ADR-0137 stands: the environment is still one scaffolded workspace per seat. What changes is
  who runs the scaffold, so participants no longer see where the workspace comes from, and how
  they take it home after Day 2 is an open owner question.
- `/workshop` and `/troubleshooting` keep the self-setup path, because the optional homework and
  everyone outside the course still need it; they no longer present it as a course requirement.
- Block 01 has no rescue slot. A red seat pairs and waits for the coffee break at 10:15, 30
  minutes earlier than before, and Block 02 starts with whoever is green.
- Block 05's build phase is ten minutes shorter on the strength of one headless run without
  permission prompts. If the rehearsal shows that people need the old 40 minutes, the debrief is
  where the time comes back from, and that would undo the point of the reweighting. R-225 stays
  open until R-040 has logged real times.
- The exercise's only-source premise now has a named exception. A rule with an exception is
  weaker than a rule; the receipts audit is what keeps it honest, and R-234 removes the exception.
- The customer agenda's "what to bring" shrinks and its Day 1 times change. It is
  outward-facing and is changed only with the owner's confirmation.
- Day 2 still contains sentences written for the old premises (homework check, "the duplicate
  from Day 1 Block 01"). They are reconciled in the Day 2 walkthrough, not here.

**Corrected 2026-11-17** (ADR-0179): the two points this record left open are closed. Participants
take the workspace home as it stands on the course machine; how it leaves the machine is
organisational and the owner's. The Day 2 sentences written for the old premises are reconciled
(the prepared duplicate, no draft-rights fallback, no `/figma-token` link in Day 2 Block 01, no
homework check). ADR-0179 also changes what "done" means in a block: Block 05's "gates and
receipts" row keeps its 15 minutes, but the checks are no longer the block's definition of done.
