# Content review of the course material: 2-day course (2026-10-10)

Scope: the **teaching content** in `docs/src/pages`, the agenda (`schulung.astro`), the sidebar
track (`docs/src/data/workshop-track.ts`), the kata briefs (`workshop/briefs/`), and the trainer
files in `tasks/schulung-*`. The component library itself is out of scope.

Sources:

- five read-only review passes, one each for agenda, setup/tooling pages, core-loop pages,
  design pages, and a comparison with the reference course
- the "AI & Design Systems" transcripts in `~/Downloads/ai-design-systems-transcripts`
  (framing files 001–007, 023, 035, 229)
- the existing gap analysis in `plan/research/ai-ds-course-gap-2026-10-08/`
- three NotebookLM notebooks, queried read-only: `f153635d` design workflows,
  `3c118ff9` "Designsysteme für KI-Nutzung vorbereiten", `74125dfd` "Designsysteme
  Schulungsmarkt"

**Status: draft for owner review. Nothing on the site was changed.** The agenda proposal in §3
is not on any page.

---

## 1. Verdict in six lines

1. **There is no single end-to-end agenda.** The course runs on three structures that disagree
   with each other: the `/schulung` agenda, the 6-step sidebar track, and the kata. The agenda
   links to exactly one page (`/workshop`). A participant who follows the sidebar skips every
   conceptual block.
2. **The best teaching content is buried.** The readiness checklist, pink test, parity-report
   reading, self-healing loop and a11y judgement calls exist, but they sit at the bottom of long
   pages that are half maintainer material: ADRs, gate internals, Storybook 10.6 tool gating,
   Worker deployment.
3. **The practice path teaches a shorter loop than the theory.** Tutorial and kata never write a
   contract, never run `check:contracts` or `storybook-test`, and set "0 discrepancies" as the
   pass bar. Day 2 then expects all of that without a worked example.
4. **Setup is incomplete for what the course actually does.** No page covers the Playwright
   install, Storybook on 6006, the trust dialog, or how to check that the MCP server is
   connected. Several pages contradict the scaffold: `@latest` vs. the pinned `@1.40.0`, and the
   CLAUDE.md template differs from the one the scaffold writes.
5. **ADR-0165 (CDS instead of Atelier) affects about 18 pages and the agenda at the exercise
   level.** Examples: AtlCard and Node 936-2954, the starter frames in the Atelier file, the
   framework choice, and the hosted Storybooks per framework.
6. **Didactics compared with the reference course.** The material lacks a "why" per block,
   recaps, a glossary up front, and above all a **transfer to the participant's own design
   system** inside the class time.

---

## 2. Is there a consistent agenda? Current state

### 2.1 Three structures side by side

| Structure                                 | Order                                                                         | Problem                                                                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/schulung` (German)                      | Setup → Figma → Storybook → MCP → Tutorial → (Kata as buffer)                 | Plain-text bullets, no page links (only `/workshop`, `schulung.astro:270,311,317`)                                                                             |
| Sidebar track (`workshop-track.ts:37-49`) | Overview → Setup → Figma access → Design to code → Tutorial → First component | /figma, /storybook, /mcp, /tokens, /a11y-* are not on it; /schulung sits in the "instructors" group off the track                                              |
| Kata                                      | 7 steps, 15 min                                                               | Agenda says "sechs" (`schulung.astro:117`), kata page says "seven" (`first-component.astro:92`); it is optional ("Puffer") and also the homework catch-up path |

### 2.2 Blocks as they stand (times from `schulung.astro`, net 410 min per day, arithmetic checks out)

| Block | Time       | Backing material                    | Verdict                                                                                                                                      |
| ----- | ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| D1-00 | 09:00 · 30 | none (live demo)                    | thin; the cross-framework demo stops making sense with CDS                                                                                   |
| D1-01 | 09:30 · 75 | /workshop, /figma-token             | content ok; timebox optimistic (8 bullets, Figma auth, Bridge); Playwright/6006 missing                                                      |
| D1-02 | 11:00 · 75 | /figma (not linked)                 | **thin**: no exercise, no deliverable                                                                                                        |
| D1-03 | 13:15 · 75 | /storybook                          | **wrong goal**: 6 of 7 bullets are Storybook release trivia; no "write a story / play / test"                                                |
| D1-04 | 14:45 · 75 | /mcp, /claude-design, /agent-skills | **overloaded**: 8 bullets, 12 min Claude Design demo, Angular/Vue aside                                                                      |
| D1-05 | 16:10 · 65 | /tutorial, /first-component         | material ok; first prompt-to-code only at 16:10                                                                                              |
| D1-06 | 17:15 · 15 | briefs                              | ok                                                                                                                                           |
| D2-00 | 09:00 · 30 | briefs, /agent-skills               | ok; five skills, no stated way to get them                                                                                                   |
| D2-01 | 09:30 · 90 | briefs, starter frames              | tight for Figma beginners; starter frames exist only in the Atelier file                                                                     |
| D2-02 | 11:15 · 75 | /design-to-code, golden prompts     | **conflict**: `libs/<fw>` monorepo paths in a scaffold course; "three red gates" bullet (`:184`) contradicts the verify section (`:383-390`) |
| D2-03 | 13:30 · 90 | `tasks/schulung-golden-prompts.md`  | trainer-only file, not served to participants (`:197`)                                                                                       |
| D2-04 | 15:15 · 75 | /a11y-workflow (not linked)         | the parity part is the hardest in the course and has no slack                                                                                |
| D2-05 | 16:40 · 50 | none                                | ok up to about 8 participants (cohort size unknown)                                                                                          |

There is no real buffer. The "10 min Puffer" (`:306`) is the micro-break. The timing tracker in
the dry-run kit is still empty, so every time in the table is an estimate.

---

## 3. Proposal: one consistent agenda (draft, for review)

Principle, following the reference course (001–007): **motivate, first success, concept,
practice, verify, transfer, recap**. Every block gets one fixed shape: _why_ (one sentence),
_pages_ (links), _deliverable_ (done when …), _stretch task_, and a _2-min recap_.

It keeps the current time slots, so the arithmetic still gives 410 min net per day. It assumes
ADR-0165: CDS, Angular only. **`<Kata-Ziel>` is a placeholder** because the CDS kata target is
still open (P4).

### Day 1: understand the loop and run it once

| Time       | Block                                    | Why                                                                           | Pages                                                              | Done when                                                                                                                     |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 09:00 · 30 | Kickoff and thesis                       | "AI scales what you already have": guardrails first                           | `/`, glossary (B12), guardrail demo with and without DS (A5)       | everyone can name the loop (Inspect → Contract → Code → Verify)                                                               |
| 09:30 · 75 | Verify the setup (installed as homework) | without a green setup, Day 2 is blind                                         | `/workshop`, `/figma-token`, `/troubleshooting`                    | preflight green, `/mcp` lists every server, Storybook 6006 runs, Playwright installed; a **rescue path** for anyone still red |
| 11:00 · 75 | **Mini-loop: first success**             | early proof that the loop holds                                               | `/tutorial` on `<Kata-Ziel>`                                       | component runs, parity report is there and **read** (not just "green")                                                        |
| 13:15 · 75 | Figma for code: is the file ready?       | AI only gets as good as the input it reads                                    | readiness checklist (extract it from /figma), pink test (/tokens)  | checklist filled for one CDS master **and** one master from your own DS (transfer)                                            |
| 14:45 · 75 | Guardrails: stories as claims and MCP    | "every story is a test"; the docs come from the MCP server, not from guessing | new participant section in /storybook, participant section in /mcp | one story plus `play` written, seen red once and then green; `docs-show` called                                               |
| 16:10 · 65 | Kata against the clock                   | repeat the loop without guidance                                              | `/first-component` (with offline gates and the new pass bar)       | kata green, every parity finding labelled                                                                                     |
| 17:15 · 15 | Recap and exit ticket                    | lock in what was learned, prepare Day 2                                       | briefs                                                             | brief chosen; homework: duplicate the file, sketch the component                                                              |

The Claude Design demo becomes optional or a trainer appendix. Participants cannot reproduce
it, because it needs a separate login.

### Day 2: your own component through the loop

| Time       | Block                                         | Why                                                        | Pages                                                                            | Done when                                                                   |
| ---------- | --------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 09:00 · 30 | Recap (active recall), brief, skills          | reactivate Day 1                                           | briefs, skills page (with **how to get them**)                                   | everyone knows their target and their skills are installed                  |
| 09:30 · 90 | Design in Figma and the handoff document      | the handoff is the prompt's input                          | briefs, **template and filled example** (new)                                    | master plus a filled handoff document                                       |
| 11:15 · 75 | Contract, component, stories                  | the contract records the mismatches you chose deliberately | **worked contract with failing/passing output** (new), scaffold commands only    | `check:contracts` green offline                                             |
| 13:30 · 90 | Iterate: prompt quality and self-healing loop | a single prompt is not the result                          | design-to-code#self-healing, prompt rubric (published)                           | stories green, prompt revised at least once and the reason stated           |
| 15:15 · 75 | Verify: a11y, states, parity                  | "a quiet report is not a clean component"                  | /accessibility (judgement calls), design-to-code#parity-report, a11y-in-the-loop | `storybook-test` with axe green, parity triaged (code / Figma / contract)   |
| 16:40 · 50 | Show & tell and **transfer "My DS"**          | the participant's own system is the real goal              | A1 self-check (design-to-code#ready), 3 guiding principles of your own           | everyone leaves with a next step for their own DS; follow-up channel set up |

---

## 4. Distribution: what belongs where

Every page falls into one of three categories. Today most pages mix two or three of them.

| Page                    | Participant core                                                                           | Move out (maintainer or trainer)                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| figma (1570 lines)      | readiness checklist L905–1087, consistency prompt L1168, code-only technique L1352         | Atelier tour L58–1000, gate table and spec scan L1196–1349, audit counts                              |
| tokens (1354)           | token architecture diagram, "which approach fits" L1112, pink test L1143                   | hand-typed value catalogue L7–312 (generate it or link it), Atelier pipeline L1004–1109               |
| design-principles (704) | principles 1–7                                                                             | release history and deprecation L582–612; transcript numbers participants cannot open                 |
| claude-design (1488)    | the "fence" and the four identities, review of AI output, governance (**move to the top**) | ADR-0041–0057 evidence, current-state sentences ("currently DRIFT"), React-only notes                 |
| storybook (1321)        | "What a green test proves" (~L1049)                                                        | almost everything else: 10.4/10.6 tool gating, CLI dispatcher, automigrate                            |
| mcp (729)               | what each server does and how to check it (**missing**)                                    | Worker/wrangler, Netlify demo, ADRs; "publish your own DS MCP" goes to its own how-to (transferable!) |
| a11y-workflow (1531)    | rewrite as "a11y in the loop"                                                              | 2026-04-26 audit, lane 3, `index.ts` legacy gates                                                     |
| design-to-code (1053)   | the loop, parity report, self-healing                                                      | readiness audit L162–281 to its own page; ADR-0145 "owed" details                                     |
| runbook, skills/*       | two entries (restart the plugin, `pkill`); "when does the skill trigger"                   | `setupStablePluginDir()`, reference tables, test scenarios                                            |

**Orphans:** 8 of the 13 setup/tooling pages and all 4 design pages are reachable only through
the sidebar. Neither the agenda nor the track points to them.

**Duplicates:**

- the `inverted → knockout` story appears three times (figma L1145, tokens L983,
  design-principles L516)
- the readiness check appears twice (figma L921, design-to-code#ready)
- the auth and token-persistence advice appears twice (workshop, troubleshooting), and the two
  versions already disagree on `--console`

---

## 5. Where the material needs more depth (by priority)

**High**: participants get stuck without these.

1. **Worked contract.** No page and no brief contains `figmaNodeId` (verified by grep). Wanted:
   a 20-line example with one `figmaOnly` and one `axisMap` + `reason`, the failing and the
   passing `check:contracts` output, and a legend for the finding codes (`[AXIS]`, `[BOOLEAN]`,
   `[NO-MASTER]` …). Today the codes are explained only in figma.astro.
2. **Offline gates in the practice path.** Tutorial and kata never run `check:contracts` or
   `storybook-test` (grep returns nothing), although AGENTS.md makes them mandatory and runs
   them first.
3. **Write a story, add a `play`, read a failure.** No page teaches it, yet D1-03 and D2-04
   depend on it. One example would cover it: an axe violation traced from id to element to fix.
4. **Handoff document as a filled example.** Today only the template path exists. Link it from
   the briefs and from kata step 1.
5. **Setup completeness.** Missing: `npx playwright install chromium` (no hit anywhere in the
   docs), Storybook 6006, the trust dialog, `/mcp` with the expected output, `claude auth login
--console`, and what the scaffold ships in `.claude/` (`/verify`, component-review agent,
   atelier-component skill, hook).
6. **Skills delivery.** The agenda (`:152`) names five skills. Three of them are repo-only, and
   no page says how a participant in their own workspace gets them.

**Medium**: needed for the participant's own design system (transfer).

7. Token architecture you can copy: role vs. value naming, state suffixes, light/dark
   mapping rules including a contrast check. The knockout example deserves more than one
   paragraph.
8. Figma: variable scopes and modes, component properties and slots and how the agent sees
   them, **how to fix a master that fails the checklist** (not only how to detect the fault).
9. Claude Design: "from artboard to bound master" as a short checklist for designers.
10. A recovery path per kata/tutorial step: Bridge not connected, wrong node id, made-up prop
    (fix: check with `docs-show`).
11. A bridge exercise between "compose" (tutorial/kata) and "build new" (Day 2), for example
    "add a variant to an existing component, with contract and story".
12. design-principles: one "check your own system" exercise, for example the consistency
    prompt from figma L1168 run against your own library.

---

## 6. Correctness and consistency (quick fixes, mostly S)

| #   | Location                                                                                                                             | Problem                                                                                                                      | Verified |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | `schulung.astro:184` vs `:383-390`                                                                                                   | "Drei Gates werden erwartungsgemäß rot" vs. "der frühere Hinweis … entfällt"                                                 | yes      |
| 2   | `schulung.astro:182-183`                                                                                                             | `libs/<fw>/…` and `libs/design-contracts/bin` paths in a scaffold course (`:181` itself says `workshop-<fw>/src/contracts/`) | yes      |
| 3   | `tutorial.astro:101`, `first-component.astro:74` vs `design-to-code.astro:58`                                                        | two parity prompts: "Fix any discrepancies" vs. "say whether code, master or contract … fix only the code ones"              | yes      |
| 4   | `first-component.astro:350,401`                                                                                                      | pass bar "0 discrepancies", which contradicts "a quiet report is not a clean component"                                      | yes      |
| 5   | `schulung.astro:117` vs `first-component.astro:92`                                                                                   | six vs. seven kata steps                                                                                                     | yes      |
| 6   | `figma-token.astro:163,342,749`, `troubleshooting:79`                                                                                | `figma-console-mcp@latest` vs. the pin `@1.40.0` (`.mcp.json:35`, scaffold)                                                  | yes      |
| 7   | `figma-token.astro:749`                                                                                                              | `${FIGMA_ACCESS_TOKEN}` without the `:-` default the scaffold uses                                                           | agent    |
| 8   | `mcp.astro:86`                                                                                                                       | ".mcp.json wires only the three hosted endpoints", which is wrong (figma-console, nx, uianatomy …)                           | yes      |
| 9   | `claude-md.astro:31-150`                                                                                                             | template ≠ the scaffold's generated CLAUDE.md; contains ADR references; React tab is the default                             | agent    |
| 10  | `tokens.astro:1327`                                                                                                                  | `@import '@atelier-ui/react/styles/tokens.css'` in an Angular-first course                                                   | yes      |
| 11  | `schulung.astro:197`                                                                                                                 | participants are pointed at `tasks/schulung-golden-prompts.md`, which is not served                                          | agent    |
| 12  | `schulung.astro:254`                                                                                                                 | "wählt sein eigenes Framework (Angular / React / Vue)", which contradicts Angular-only (ADR-0165)                            | yes      |
| 13  | `agent-skills.astro:394`                                                                                                             | uianatomy "22 tools" vs. 29 in AGENTS.md                                                                                     | agent    |
| 14  | `design-principles` (H1 "LLM-optimized API design") vs `schulung.astro:198` (`plan/design-principles.md` = surface/motion/dark mode) | same name, two different documents                                                                                           | agent    |
| 15  | `design-principles.astro:84` vs `figma.astro:1332`                                                                                   | "No exceptions" vs. the scan's `outline`/`outlined` and `danger`/`error`                                                     | agent    |
| 16  | `figma.astro:136,895` vs `:1051`                                                                                                     | "same name, no translation" vs. `codeSyntax.WEB` empty on 284 of 284 variables                                               | agent    |
| 17  | `prompts.astro`                                                                                                                      | every prompt says "fetch llms-full.txt first", not the MCP / `docs-show`; React tab is the default                           | agent    |
| 18  | `troubleshooting.astro:90`                                                                                                           | `lsof … \| xargs kill` over all bridge ports with no warning (kills unrelated processes too)                                 | agent    |
| 19  | `claude-md.astro:292` vs `troubleshooting.astro:53`                                                                                  | `/doctor` vs. `claude doctor`                                                                                                | agent    |
| 20  | `schulung.astro:59` vs `workshop.astro:222`                                                                                          | preflight prompt in German vs. English                                                                                       | agent    |

"agent" means the review pass reported the line and I did not re-read it myself.

---

## 7. ADR-0165 (CDS): what has to change in the course

- `schulung.astro`:
  - `:29`, `:115`, `:117`: AtlCard, AtlInput, AtlToggle, AtlButton, Node `936-2954`
  - `:43`: the cross-framework demo
  - `:70`, `:162`, `:395`: the Atelier file
  - `:163`: the starter frames
  - `:83-87`, `:96`, `:99`: the hosted Storybooks/MCP per framework and the Angular/Vue aside
  - `:56`, `:314-325`: `create-atelier-ui-workspace` becomes the CDS scaffold (P3)
  - `:182-184`: `libs/design-contracts/bin` becomes `@conciso/design-contracts`
- Pages with Atl references: tutorial (20), figma (14), a11y-workflow (9), first-component (8),
  design-to-code (5), claude-design (5), storybook (3). Also the golden prompts, the dry-run kit
  and the four briefs (starter frame, "84 variables", `--ui-*`).
- Survives as is: the hero lede and the main learning goal (framework-neutral). The framework
  choice does not survive.
- ADR-0165 itself names its weakest point: whether a good kata target exists in the CDS. **The
  agenda in §3 depends on that answer.**

---

## 8. Didactics compared with the reference course and NotebookLM

The reference course follows one arc: concept, then setup, then the "check engine light" on
your own DS, then apply, then guardrails, then operationalize, then recap.

| Gap in Atelier                                           | Reference                                            | Suggestion                                                           |
| -------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| "Why" only at kickoff                                    | every chapter opens with a 1-min why (001–006)       | one "Du brauchst das, weil …" sentence per block                     |
| no glossary up front (B12 is done but not in the agenda) | 229: LLM = brain, agent = hands, MCP = USB port      | glossary slide in the kickoff                                        |
| first prompt-to-code only at 16:10                       | first success early                                  | move the mini-loop to before lunch (§3)                              |
| almost no recaps                                         | recap after every sub-part, 007 as the closing recap | 2-min recap per block, closing recap with 3–5 principles of your own |
| **no transfer to your own DS in class**                  | ch3 (own DS) and ch6 (pilot)                         | readiness on your own master (D1), "My DS" in the closing block (D2) |
| no stretch tasks                                         | "crawl, walk, run" (035)                             | 1–2 stretch tasks per hands-on block                                 |
| no follow-up                                             | Slack, Jam sessions (006)                            | channel plus one follow-up date                                      |

NotebookLM findings (notebook answers; I did not check them against the primary sources):

- **`f153635d`**: sequence the course as setup, then tokens, components, patterns, docs. For
  verification, use side-by-side parity, token audits and a11y scans. For transfer, run rules
  generation on the participant's own repo and audit their real Figma files.
- **`3c118ff9`**: preconditions are Auto Layout, semantic variables, explicit variants, clean
  layer names, annotations for behaviour and a11y, and **Code Connect as the "accuracy
  multiplier"**. Atelier's contract covers part of this differently. Decide whether Code
  Connect should at least be named as the alternative.
- **`74125dfd`**: the most common complaints about DS training are theory filler, no personal
  feedback, outdated tool content, and optional tasks nobody reviews. That supports cutting the
  release trivia in D1-03 and D1-04.

Gap-analysis triage: only B1 and C1–C12 are still open. None of them belongs in the core
agenda. At most C9 (layer naming, one sentence in D2-01) and C11 (CLAUDE.md, 5 min in the
closing block).

---

## 9. Decisions for the owner

1. **Order**: rework the content now, or together with the CDS switch? My recommendation:
   only the quick fixes in §6 now (most of them survive the switch). The structural rework in
   §3–5 should go together with the CDS swap, because those pages get rewritten anyway.
2. **Agenda structure in §3**: accept it as the target? In particular the mini-loop before
   lunch, the readiness block on your own master, and the transfer block on Day 2.
3. **Single source for the agenda**: should the track (`workshop-track.ts`) mirror the agenda,
   or should each agenda block link its pages (a `pages` field per block)? Recommendation: the
   links per block; the track stays the self-serve path.
4. **Maintainer content**: where does it go? (a `/maintainers` area on the site, or `plan/`)
5. **Claude Design demo**: core or optional?
6. **Language**: agenda German, pages English. Keep it that way? If yes, state it once instead
   of the repeated "(German)" notes.
7. **Skills**: which of the five reach participants, and how?
8. **Cohort size**: this decides whether show & tell fits in 50 min.

---

## 10. Verified vs. assumed, and the weakest point

**Verified** (read or grepped myself):

- §6 rows 1–6, 8, 10 and 12
- the agenda links only `/workshop`
- no `figmaNodeId` in the docs or briefs
- no page mentions a Playwright install
- the audience line in the hero ("Entwickler mit solider Frontend-Basis", plus the framework
  choice)

**From the review passes, not re-checked line by line**: every other line number, the page
character judgements ("maintainer-internal"), and the didactic comparison with the transcripts.

**Assumed**: every timebox (nothing has been rehearsed, and the dry-run tracker is empty), the
cohort size, and that the scaffold commands work as described.

**Weakest point of this review:** no exercise was walked through by hand. "Thin" and "too
deep" are reading judgements, not observations from a run. The §3 agenda is a design proposal;
until the CDS kata target is decided, its exercise blocks are placeholders. A dry run of the
tutorial and the kata on the CDS is what would actually confirm or overturn the judgements
here.
