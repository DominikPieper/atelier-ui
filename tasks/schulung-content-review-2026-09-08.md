# Training content review — the whole teaching surface, 2026-09-08

Fourth pass on the training material, and the first that covers the **whole** teaching
surface rather than one artefact: `schulung-2tage-agenda.md`, the docs site's
participant pages, `workshop/briefs/`, `talk/`, and the `plan/` documents the curriculum
tells participants and agents to read. The question asked was the owner's: where are the
gaps, what is not well formulated, and — especially — does the joint between **Figma,
Claude Design and the code** hold together.

Distinct from `tasks/review-plausibility-2026-09-08.md`, which audited what the repo
*claims* about itself. This one asks whether the material *teaches*. Findings that
duplicate that review are not repeated; where a finding touches the same file it is a
new instance and says so.

## Method, and the seat that was empty

Four Sonnet readers on separate briefs (course spine · hands-on path · the
Figma/Claude-Design/code seam · conceptual pages), plus own verification of every
finding below that would change what someone does next.

**The second-model Gegenprobe ran late.** Codex hit its usage limit on 2026-09-08 (reset
00:19) and the agy/Gemini fallback was quota-exhausted with a broken `model` override, so
§ A–E below were written by framed readers only. The Codex seat ran at 00:25 on
2026-09-09 against the corrected tree; its result is the **Gegenprobe** section near the
end, and the G-findings there are part of this review, not an appendix to it.

**Verification legend.** `measured` = a live run in this session (a tool call, a gate's
exit code, a parsed artefact). `verified` = re-checked against the repo by hand.
`reported` = one reader's finding, plausible and specific, not independently re-checked.

## Verdict

The curriculum's spine is sound and visibly iterated: the Figma → spec → code → verify
loop is taught and practised, the briefs are genuinely good teaching documents, and the
Day-1 → Day-2 arc (roundtrip on an existing component → build your own) works.

Three things are wrong at a level that costs workshop time:

1. **A mandatory Day-2 tool does not work at all** — `test-run` fails on all three
   frameworks, React included (§ A1).
2. **The material is one Storybook release behind reality in the trainer's own
   document**, and the correction that reached `/schulung` was only half-applied
   (§ A2). Two thirds of the cohort is taught a second-class loop that no longer exists.
3. **The two skills that implement the Figma ↔ Claude Design ↔ code seam shipped
   yesterday and the teaching material does not know they exist** (§ B1). One page
   actively tells the room the tooling is absent, and the written handoff document that
   is *gating step 0* of the `design-to-code` skill appears nowhere on the English
   learner path (§ B5).

On the owner's specific suspicion — the Figma/Claude-Design/code joint — the answer is
split. The *reasoning* is taught better than expected: `claude-design.astro`'s "fence"
section argues the source-of-truth position mechanically, not by assertion, and is the
strongest single passage on the site. What is missing is everything that shipped after it
was written.

Underneath that, one systemic problem: **`plan/big-picture.md`, which the curriculum
tells participants to paste into the agent's prompt context, is written in the
pre-rename `Llm*` vocabulary** (§ C1). Its counterpart `plan/figma.md` has the same
disease. These are the two files the course points at as ground truth for prompting.

---

## A — Measured blockers

### A1 — `test-run` is broken in all three frameworks, React included · measured

Day 2 Block 03 puts the React test loop on the local addon MCP
(`schulung.astro:193`: *"Test-Loop React: dev + test Toolset über localhost:4401/mcp
(stories-preview, test-run mit a11y)"*), and Day 1 Block 04 teaches `test-run` as part
of the toolset model. The call fails:

```
tools/call test-run → {"content":[{"type":"text","text":"Error: Failed to start Vitest"}],"isError":true}
```

Storybook's own log gives the reason:

```
storybook/test: No projects matched the filter
"storybook:/Users/dominikpieper/Projects/atelier/libs/react/.storybook".
```

**Root cause.** `@storybook/addon-vitest` 10.6 derives the project filter as
`"storybook:" + process.env.STORYBOOK_CONFIG_DIR` — an absolute path
(`node_modules/@storybook/addon-vitest/dist/node/vitest.js:225`). The repo's configs
declare `name: 'storybook:react'` / `'storybook:angular'`
(`libs/react/vitest.storybook.config.ts:17`, Angular's equivalent), so the filter never
matches. Separately, `libs/vue/vitest.storybook.config.ts` is **not listed** in
`vitest.config.mjs#projects` at all.

Measured on React (4401) and Angular (4400), same error both times. Almost certainly a
10.6-migration regression — the naming convention changed under the addon.

`nx test <lib>` is unaffected; only the MCP tool is dead.

**Fix direction:** let the addon set the project name (drop the hand-written `name`), or
set it to the absolute config-dir form the addon computes; add Vue's storybook config to
`vitest.config.mjs#projects`. Then re-run the call before the next cohort — the
curriculum makes it mandatory, so a red here stops the block.

### A2 — Angular and Vue get the full local tool surface; the material says they do not · measured

`tools/list` against a locally running Storybook returns the **same eight tools** for
Angular (4400) and Vue (4402) as for React:

`docs-list` · `docs-show` · `docs-show-story` · `stories-preview` ·
`get-storybook-story-instructions` · `stories-changed` · `stories-find-by-component` ·
`test-run`

All three `.storybook/main.ts` files carry an identical addon set (`addon-mcp`,
`addon-vitest`, `addon-a11y`, `addon-designs`, `addon-docs`), so nothing gates the
`dev`/`test` toolsets per framework. `AGENTS.md:66` already states this correctly.

The teaching material states the opposite in two places:

- `docs/src/pages/schulung.astro:175` — *"Angular/Vue bekommen dieses Toolset nicht, ihr
  Loop bleibt `nx test <lib>` + Browser"*, and `:194` repeats the split.
- `schulung-2tage-agenda.md:31` and `:58` — the whole Day-1 Block-04 blackboard model and
  the Day-2 Block-03 test-loop mapping, written against *"installiert ist 10.5.10"* and
  *"preview/test offiziell React, Vue/Angular experimentell"*. Installed is **10.6.0**
  (`package.json:178`).

Effect: two thirds of the cohort is routed away from a loop they can have, and the
trainer's own prep document teaches a superseded architecture. Note the interaction with
A1 — once `test-run` is fixed, the correct statement is "all three frameworks, same
tools"; until it is fixed, the honest statement is "`test-run` is broken for everyone".

**Fix direction:** rewrite the Block-04 toolset beat and the Block-03 loop mapping once,
for all three frameworks; stop restating the Storybook version in the agenda and point at
`package.json` instead (the anti-pattern `AGENTS.md` already names for live numbers).

---

## B — The Figma ↔ Claude Design ↔ code seam

### B1 — The two skills that *are* this seam are invisible to the teaching material · verified

`skills/design-to-code` and `skills/artboard-bridge` landed 2026-09-07/08. Between them
they implement exactly the joint the owner suspected was thin:

- `design-to-code` runs the Figma → spec → code → verify loop from a **written handoff
  document**, and ships `references/handoff-document.md` — the checklist template with a
  worked example.
- `artboard-bridge` has **Intake** (read a `.dc.html` sheet, its findings and comments,
  write the ADR-0096 handoff document stamped *"from Claude Design, unverified against
  Figma"*) and **Publish** (a gate-verified component → a `.dc.html` sheet).

`grep` for `artboard-bridge` across `docs/src`, `schulung-2tage-agenda.md`, `workshop/`
and `talk/` → **zero hits**. `docs/src/pages/agent-skills.astro` names
`figma-workspace-architect` and `atelier-design` only (and not `uianatomy-mcp`, which the
curriculum demos on Day 2 — see C4).

Three consequences, in descending severity:

1. **`schulung.astro:101` tells the room a false thing.** *"Schritt 5 (Handoff) bleibt an
   diesem Punkt Idee, nicht Vorführung: … die ausgearbeitete Fassung ist spezifiziert,
   aber ihr Tooling existiert nicht."* The tooling exists — `artboard-bridge` Publish is
   the outbound handoff ADR-0032 specified. What is true today is narrower and better
   teaching: Publish has run once (iteration 2, against scratch project
   `44481d29…`) and **correctly refused** — AtlBadge was DRIFT — while the
   skill-less baseline published unverified code. Its write path (P1–P7) is still
   unexercised, it is blocked repo-wide while all 37 parity records are DRIFT, and
   per-seat access is a separate open question (ADR-0106). "Ran, refused, and here is
   why it cannot be demonstrated for a room today" is a far better lesson than "does not
   exist" — the refusal *is* the fence the page spends two sections arguing for.
2. **The curriculum's Block-01 → Block-02 handoff has no artefact, and one now exists.**
   `schulung.astro:166` prescribes the handoff checklist in a single bullet with no
   medium, no location and no example; `skills/design-to-code/references/handoff-document.md`
   is that document, with a worked example, and ADR-0096's 2026-09-07 correction already
   settles which fields a skill may prefill (provenance and scope) and which stay
   author-written (behaviour, exclusions, reuse-vs-new).
3. **The curriculum's skills story is a release behind.** Day 2 Block 00 introduces "what
   a skill is" using three skills; there are five, and the two missing ones are the two
   that would carry Day 2's own workflow.

**Fix direction:** this is the single highest-value content change available. Point Day 2
Block 01's handoff bullet at `references/handoff-document.md`; reword `:101` to name the
skill and the real blocker; add both skills to `/agent-skills`.

### B2 — Stale absolutes about the seam, in the page that owns it · verified

`docs/src/pages/claude-design.astro` is the best-reasoned page on the site about the
Figma/Claude-Design relationship — the four gate identities, the "no arrow between canvas
and loop" diagram, the import-confirmed/export-unverified honesty at `:106-108`, and the
derived `{gateCount}` (the fix from the 09-05 pass held). Three absolutes in it are now
false, all for the same reason as B1:

- `:194` — *"no machine-readable handoff exists in either direction"* (already
  `plausibility A8`; repeated here because it is the seam's load-bearing sentence).
- `:431` — *"No script in this repo opens one"* (a `.dc.html`). Literally still true —
  it is a skill over MCP, not a script — but the point the sentence makes is no longer
  the state of the world.
- `:188` — the same class of absolute.

**Fix direction:** keep the page's actual argument (an artboard is not a source of truth
and carries none of the four gate identities — that survives intact) and replace the
absolutes with what changed.

### B3 — `figma_check_design_parity` has no "report mode", and the briefs' closing check cannot be run where they put it · verified

`workshop/briefs/README.md:63-84`, "Done when" item 8, says the parity check *"runs in
report mode"*. The live tool schema has no report or mode parameter (`nodeId`,
`codeSpec`, `canonicalSource`, `enrich`, `fileUrl`), and **`codeSpec` is required**.
"Report mode" is this repo's unrelated `check:parity:report` npm script (ADR-0082) — a
code-vs-snapshot diff, not an MCP call.

Compounding: items 5 (generated spec's prop names), 6 (story `tags: ['autodocs']`) and 8
all require a spec/story/code that does not exist at the end of the Figma-only block each
brief scopes itself to. A participant — or an agent — handed only the five brief files
cannot reach three of the eight acceptance criteria.

**Fix direction:** split "Done when" into the Figma-block bar (1–4, 7) and the full-day
bar (5, 6, 8), and say where the second half is reached. Fix the "report mode" sentence.

### B4 — What the seam still does not teach · verified by absence

Transitions a real project needs, and their coverage:

| Transition | State |
|---|---|
| Figma master → spec | taught (`/design-to-code`, `/tutorial`, Day 2 B01→B02) |
| spec → framework code | taught (Day 2 B03, `plan/big-picture.md` — but see C1) |
| code → Storybook | taught (`/storybook`, Day 1 B03) |
| code → Figma parity check | best-taught joint on the site; practised three times |
| Figma → Claude Design | **mentioned only** — `claude-design.astro:106-108` records the Import direction as first-party and confirmed, and stops. No worked path. |
| Claude Design artboard → code | **skill exists, never taught** (`artboard-bridge` Intake, B1) |
| code → Claude Design artboard | **skill exists, taught as nonexistent** (`artboard-bridge` Publish, B1) |
| canvas → Figma → code | correctly taught as **forbidden**, with the reason (`:111-113`) |
| designer-in-Figma ↔ designer-in-Claude-Design | **absent** — no material addresses two designers on two surfaces |

The last row is the honest remaining hole: nothing in the repo says what a team does when
one designer works in Figma and another explores in Claude Design. That is a real
question a participant will ask on Day 1 Block 04, and there is no answer to give.

### B5 — The handoff document is gating step 0 of the skill and appears nowhere on the English learner path · verified

`skills/design-to-code/SKILL.md:40,52` makes the written handoff document the gating step
0 of Build mode — *"The document is the input, not a by-product"*. `grep -rln -i handoff`
across `docs/src/` returns six files, and **none of them is `design-to-code.astro`,
`tutorial.astro` or `first-component.astro`**. The English learner path goes from Inspect
straight to Spec; its four-box "loop at a glance" has no equivalent checkpoint. The only
place the concept reaches a participant is `/schulung`, in German, in one bullet
(§ C4).

A reader following `design-to-code.astro` alone prompts straight from inspection to
generation — precisely the anti-pattern ADR-0096 exists to prevent.

**Fix direction:** name it as a step (or sub-step under Inspect) on `design-to-code.astro`,
linking ADR-0096 and `references/handoff-document.md`. This is the same fix as B1's
point 2, from the English side.

### B6 — The two skills share one handoff artefact, and the artefact does not support one of the two shapes · verified

`skills/design-to-code/references/handoff-document.md:11-13` — the template's `Source.`
field is Figma-only: *"Figma file `<key…>`, node `<id>`, page Components, section
`<category>`. Snapshot: Figma lastModified `<stamp>`, repo `<sha>`."*

`artboard-bridge`'s Intake procedure fills **that same template** with Claude Design
provenance, and its own passing fixture requires it:
`skills/artboard-bridge/tests/intake-sheet-with-master/expected.md:22-25` — *"Handoff
document written: provenance (project id, file, etag, `open_url`) … stamped 'from Claude
Design, unverified against Figma'"*. The template has no field for any of those five
values.

Two skills share one artefact by reference; the artefact has no slot for what one of them
must write. Cheap to fix now, expensive after the first Intake run produces a document
nobody can place.

**Fix direction:** add a Claude-Design provenance variant to `handoff-document.md`
(project id · file · etag · `open_url` · the unverified stamp), or state where the stamp
goes.

### B7 — "Handoff" names three different things; "artboard" and "sheet" name one · verified

**Handoff** is used for ADR-0096's *inbound, agent-facing written checklist*, for
`claude-design.astro`'s *outbound, human-facing Step-5 canvas link* (`:181`), and
generically at `tokens.astro:149` (*"the Component tier exists … as a handoff and teaching
aid"*). Given B5, a reader who meets the word on `/claude-design` gets no signal that a
second, code-facing meaning exists.

**Artboard / sheet** are the same `.dc.html` file, with inverted emphasis across the two
documents a reader would cross-reference — `claude-design.astro` 43×/20×,
`artboard-bridge/SKILL.md` 19×/41× — and are never explicitly equated. Soft drift, not a
contradiction (`claude-design.astro:500` uses both in one sentence without confusion), but
one equivalence sentence would close it.

### B8 — Two seam absolutes that are true only on a narrow reading · verified

- `claude-design.astro:106-109` — *"Importing Figma links into the canvas is confirmed;
  exporting out of the canvas is not."* Reads as "nothing can be extracted from a Claude
  Design project". `artboard-bridge` Intake routinely reads files, comments and text out of
  one (`list_files`, `read_file`, `list_comments`). Defensible on a "Figma-format export"
  reading; the sentence does not say so. Qualify it.
- `claude-design.astro:111-113` — *"The chain canvas → Figma → code is forbidden in this
  repo … No diagram on this page draws that arrow, deliberately."* True for direct frame
  import. But `figma-workspace-architect/references/build-from-code-contract.md` — the
  fallback `artboard-bridge`'s own routing table names when no master exists — describes a
  canvas-informed → properly built master → code path. One clause separating "importing the
  artboard file" (forbidden) from "using an artboard's decisions to inform a built master"
  (supported).

---

## C — The course spine

### C1 — The two files the curriculum injects into prompts are written in a vocabulary the code abandoned · verified

`schulung.astro:192`: *"`plan/big-picture.md` (API-Regeln) + `plan/design-principles.md`
(Surface/Motion/Dark Mode) im Prompt-Kontext"*.

`plan/big-picture.md` contains **50** occurrences of `Llm*` (`LlmButton`, `LlmToggle`,
`LlmCard`, …) and the path `libs/llm-components-react`, which does not exist.
`libs/spec/src/index.ts` contains **zero**. Same disease in `plan/figma.md` — **33**
`Llm*` hits and *"27 component sets"* (`:20,30-33`), cited by the agenda at `:27` and
`:125` as the Day-1 Block-02 prep document. `plan/figma.md`'s staleness banner
(`:42-48`) covers only the Variable Collections table, not the component tables — and not
the node-id table, which `skills/design-to-code/SKILL.md` calls out by name in its own
edge cases (*"the node table in `plan/figma.md` has been stale before … `55:141` … the
master is `55:139`"*). A skill warning its agent about a document the curriculum hands to
participants unwarned is the whole problem in one line.

This is worse than ordinary doc rot: the curriculum instructs participants to hand
`big-picture.md` to the agent as ground truth for naming, and it teaches the wrong names.
`plan/roadmap.md` self-flags the same staleness class with a read-first banner;
`big-picture.md`, the one actually injected, has none. `big-picture.md` also has no Vue
section (Angular core plus a React appendix) while the curriculum hands it to all three.

**Fix direction:** the `Atl*` rename pass on both files is the real fix. A currency banner
is the cheap stopgap, and it is not enough for a file that goes into a prompt.

### C2 — "Draft rights" is a stated prerequisite that nothing verifies until 90 minutes into Day 2 · verified

`schulung-2tage-agenda.md:25,79` and `schulung.astro:57` make a Figma account with draft
rights a Day-1 prerequisite, confirmed by *"`npm run preflight` grün"*. Preflight checks
runtime, the Claude CLI, the Bridge plugin/ports/token and MCP reachability — `grep` for
"Draft" across the preflight mock on `/workshop` and across `/troubleshooting` returns
zero. The first real test is `File → Duplicate to your drafts` at the start of Day 2
Block 01, the most time-boxed 🔴 block in the course, a full day after everything read
green.

**Fix direction:** an explicit manual self-check in the pre-workshop homework ("actually
duplicate the file, confirm it worked") plus a `/troubleshooting` entry for the failure.

### C3 — Artefacts the curriculum depends on that do not exist · verified

The agenda's own Material-Lücken table lists these as trainer prep. None exist today:

| Promised | State |
|---|---|
| `solved-toast` / `solved-tagchip` / `solved-statcard` / `solved-avatar` branches | `git branch -a` → none |
| Trainer cheat sheet with Golden-Prompts | no file anywhere in the repo |
| Pre-workshop mail / setup PDF | none |
| Slide deck for the lecture blocks | none |
| Brief as a printable 2-page PDF | none |

Two of these are load-bearing rather than nice-to-have: `schulung.astro:191` instructs
*"Golden-Prompts verlangen `--ui-*` Custom Properties"* as a Day-2 Block-03 step, and the
`solved-*` branches are the recovery path when a participant prompts their component into
the ground. `prompts.astro`'s existing prompts are whole-page-generation templates, not
token-fidelity micro-prompts, so they do not substitute.

**Fix direction:** build the four branches and the cheat sheet before the first cohort;
they are the two that a live room notices missing. The deck and the PDFs can wait.

### C4 — Smaller spine defects · verified / reported

- **`agent-skills.astro` does not mention `uianatomy-mcp`**, which the agenda cites at
  `:53,131` as the page backing the Day-2 Block-00 "what is a skill" moment demonstrated
  *with* that skill. (verified by grep)
- **Day 2 Block 02's `claude mcp add` step has no troubleshooting entry and no
  `/troubleshooting` link**, although both 🔴 blocks do link it and
  `tasks/schulung-dry-run-kit.md:190-193` names this exact failure mode — in the
  trainer-only document. (verified)
- **The handoff document has no stated medium or location** (`schulung.astro:166`), and
  **the participant's own spec has no example path** (`:178`) although three of six
  diagnostic gates hinge on placing it right. Both are one sentence each. (verified)
- **The dry-run kit has never been run** — `tasks/schulung-dry-run-kit.md` §3 and §5 are
  empty. Two 🔴 blocks, ~820 scheduled minutes, effectively no slack, and the timing is
  the authors' own estimate: Block 04's cell says so outright (*"kein Dry-Run … die erste
  Kohorte mitstoppen"*). (verified)
- **`index.astro` never mentions `/schulung`** — a cohort participant exploring before the
  pre-workshop mail lands on the self-serve scaffold funnel. `workshop.astro:108-128`
  catches it one click later, so it is a detour, not a dead end. (verified)
- **The Claude Design "Drei Richtungen" demo is Day 1's most elaborate teaching moment,
  in its tightest block, and never returns.** Participants cannot run it (different
  credential class), half the concept is explicitly not demonstrable, and Claude Design
  does not appear again on Day 2. Not a defect — a tradeoff worth naming, and the first
  candidate if Block 04's time pressure needs relief. (reported; and note B1 changes what
  the "not demonstrable" half should say)

---

## D — The hands-on path

The four briefs are the strongest teaching artefacts in the repo. Ranked: `toast.md`
(single canonical uianatomy source, 9 a11y items each tagged blocker/major with correct
WCAG citations, clean state machine) ≈ `avatar.md` (the image→initials→icon fallback
chain is the clearest single idea in the set) > `statcard.md` (two cleanly divided
sources) > `tagchip.md` (three interleaved sources — the richest lesson about
composition, the heaviest parse for a 90-minute novice).

| # | Sev | Where | Finding |
|---|---|---|---|
| D1 | high | `workshop/briefs/README.md:63-84` | See B3 — "report mode" does not exist; three of eight acceptance criteria are unreachable inside the block the briefs scope themselves to. |
| D2 | med | `workshop/briefs/README.md:47-48` | *"`Library Tokens` carries 78 variables — 50 colour, 10 spacing, 5 radius, 12 typography, 1 opacity"*. **Measured** against `tools/figma/snapshot.json#uiTokens`: **84**. colour 50, spacing 10, radius 5, opacity 1 all match; the brief silently drops the `sizing` bucket (`control-height/*` + `row-height/*` = 6). Harmless for these four components, but the file's own stance is "trust the derived number". Derive it at build time the way `docs/src/lib/figma-snapshot.ts` already does. |
| D3 | med | `docs/src/pages/prompts.astro:36` (all 8 cards) | Every prompt opens *"Fetch the Atelier UI API reference first: https://atelier.pieper.io/llms-full.txt"*, while the page's own "How to use" copy (`:127,:135`) invites pasting into "your LLM of choice (Claude, ChatGPT, Gemini, …)" — a plain chat UI without browsing silently ignores the instruction. State the prerequisite, give a manual-paste fallback. |
| D4 | low-med | `first-component.astro:280-291`, `tutorial.astro` close | The kata and tutorial are fully scripted; the briefs are the opposite. That jump is intentional, but neither page's "Done" block links to `workshop/briefs/` — a docs-site reader cannot discover the next rung exists. One link. |
| D5 | low | `prompts.astro:41` | Asks for `AtlCodeBlock` with both `language="typescript"` and `filename="component.ts"`; `libs/react/src/lib/code-block/atl-code-block.tsx:8-11,27` documents `language` as ignored when `filename` is set. Half the instruction is inert. |
| D6 | low | `tutorial.astro:544` | *"These paths are a scaffolded workspace's."* — elliptical possessive with no following noun; reads as truncated. |

---

## E — Conceptual and reference pages

### E1 — Four "design principles" documents, none cross-linked · verified

`README.md:130-138` (4 items) ≠ `docs/src/pages/design-principles.astro` (5 LLM-API
principles, and it **omits composition-over-configuration** even though `patterns.astro`
calls that a core rule) ≠ `plan/big-picture.md:15-416` (10 numbered principles) ≠
`plan/design-principles.md` (8 rules about motion, surface and depth — a different topic
under the same name, never rendered on the site).

A participant asking "what are Atelier's design principles" gets a different answer per
file. **Fix direction:** make `big-picture.md` canonical once C1 is done, make the short
versions explicit subsets that link to it, and rename `plan/design-principles.md` to end
the name collision.

### E2 — README teaches two false things about the architecture · verified

- `README.md:70-78` lists `stories-preview` / `test-run` /
  `get-storybook-story-instructions` in the **hosted** endpoint table, availability
  *"React, Vue"*, and closes *"Angular MCP currently focuses on documentation and prop
  discovery; previews and testing are React/Vue only."* Wrong on both axes: the hosted
  surface serves `docs-*` only, and locally all three frameworks get all eight tools
  (measured, § A2).
- `README.md:97-103` says **31 components** and lists a category `Feedback` that does not
  exist (actual: `Layout`), while omitting the shipped `AI`/`Chat` category.
  `docs/src/data/components.ts` has 28. Third distinct number for a value with a
  generated source (`plausibility A2` and `A6` are the other two).

  **Corrected 2026-09-09.** The category half of that finding is wrong as stated, and the
  error is mine — I published it as verified. `Feedback` is a real category: it is what
  Storybook's own sidebar uses (`storySort.order` in all three `.storybook/preview.*`
  lists `'Inputs', 'Display', 'Navigation', 'Overlay', 'Feedback'`, and the story
  `title:` prefixes match). `docs/src/data/components.ts` calls the same grouping
  `Layout`. So the two sources genuinely disagree and neither is simply "the actual
  name" — surfaced by the ADR-0116 work, which hit the split from the `plan/figma.md`
  side and correctly declined to pick a side from outside `docs/src/**`. The component
  count half of the finding stands unchanged. Tracked as an open item.

### E3 — Assumed but never established · verified by absence

Concepts the material leans on without ever defining, in the pages a participant reads:
**what a design token is** conceptually; **what MCP is and why it beats copy-paste**
(`design-principles.astro` principle 5 says "the MCP server provides this at runtime"
and never says what MCP is); **why a spec layer exists at all** (README says what it is,
not why it matters for generation); and **what "drift" means** — a load-bearing term
across every gate, never defined on any participant-facing page.

### E4 — Topics an experienced participant will expect and not find · reported

Cost/token economy of agent runs · review discipline for agent output as a general
lesson (the pattern exists, applied narrowly, in `a11y-workflow.astro`'s triangulation
loop) · versioning and release of a multi-framework library (surprising, given API parity
is the headline) · **what to do with a Figma file that has no Variables** (the architect
skill assumes token rigour throughout; the common legacy case has no path) · testing
strategy for generated code as its own topic · what to do when the agent is confidently
wrong.

The fourth is the one that matters most for the seam: every participant returning to
their own company hits it in week one.

### E5 — Smaller · verified / reported

- `docs/src/data/components.ts` — `aiUsage.commonHallucinations` is wired end to end
  through `ComponentDetail.tsx:635-662` and populated for **3 of 28** components. This is
  exactly the "what does the agent get wrong" content E4 says is missing, 89 % unbuilt.
  Finish it or remove it; half-built reads as coverage that is not there. (verified)
- `docs/src/pages/design-principles.astro:39-41` — *"the inference cost is near zero and
  hallucination risk drops to near zero"*: unfalsifiable and unsourced, three lines away
  from `plan/ai-readiness.md:16`, which makes an analogous claim and cites a benchmark.
  (verified)
- `design-principles.astro:92` — *"enums … compile away and disappear from type
  information"*. Only `const enum` erases; a plain `enum` is a runtime object and appears
  in the emitted `.d.ts`. A TS-literate participant catches this instantly. (verified)
- `patterns.astro:56` — *"Composition wins three things an LLM cannot"*: nothing stops an
  LLM emitting flat props; the real argument is about consumer ergonomics. (reported)
- `claude-md.astro:54-58, 98-102, 137-141` — token names and values hand-typed as string
  literals in a template meant to be copied verbatim into a user's own project, where the
  rest of the site reads generated values at build time. The "token names match Figma
  1-to-1" overclaim (`plausibility A9`) is present in all three blocks, not just the one
  already flagged. (verified)
- `talk/storybook-mcp-talk.md` — coherent 30-minute arc, but never distinguishes the
  hosted from the local surface: it demos `test-run` / `stories-preview` /
  `get-storybook-story-instructions` and then tells the audience to install
  `@storybook/mcp`, which grants none of them. Anchored to Storybook 9 against a 10.6.0
  pin; Vue never mentioned. (reported)
- `plan/ai-readiness.md` is the best-reasoned rationale document in the repo and is
  linked from nowhere a participant reaches. (reported)

---

## What held up

- The Day-1 → Day-2 arc, and Day 1 Block 05's fast/slow-finisher structure.
- `tutorial.astro` and `first-component.astro`: mutually consistent, correct on the
  clone-vs-scaffold split throughout. Every port and path in them re-verified against the
  real project configs (docs 4300, Storybook 4400/4401/4402, scaffolded apps 4200) and
  against `libs/create-workspace/.../preset.ts`.
- All five Figma node ids the exercises depend on (`703:341/348/352/355`, `936-2954`)
  present and consistent in `tools/figma/snapshot.json`.
- `storybook.astro` — precise and versioned, and already correct at 10.6.0 where the
  agenda is not.
- `figma-token.astro` and `troubleshooting.astro` — good coverage of the single
  highest-risk dependency chain in the course (Desktop Bridge vs. REST token), with the
  primary/optional framing right.
- `accessibility.astro` (stance and reference) vs `a11y-workflow.astro` (process): clean
  separation, no restated content. The three-source triangulation with the AtlProgress
  worked example is the best single page on the site.
- The 09-05 pass's fixes are genuinely in place: the spec's home, the three-vs-six gate
  distinction, the `claude mcp add --scope local` route, and `claude-design.astro`'s
  derived `{gateCount}` (37 today, and it moves on its own).
- No hallucinated component props found anywhere in `prompts.astro`, `install.astro` or
  the briefs.
- `claude-design.astro`'s "fence" section (§2): the four gate identities, the five
  `check:figma` severities, and a parity-record walkthrough that explains *mechanically*
  why an imported frame cannot be checked (*"It would not fail — it would compare
  nothing"*). Argument, not assertion.
- The token-mapping story is consistent between `figma.astro` and `tokens.astro`, both
  pointing at ADR-0018, with the one Component-tier exception documented.
- The artboard-palette generation and gating story agrees across three independent
  sources (`claude-design.astro`, `artboard-bridge/references/palette-mapping.md`,
  ADR-0106); the 40→48 value difference is ADR-0071 landing in between, not an error.
- ADR correction discipline: ADR-0032 and ADR-0106 both carry dated in-place "Corrected"
  paragraphs rather than silent rewrites.
- Governance material is specific and consistent between the docs page and the skill
  (DSB/ISB named by role).

## Fixed in this pass (2026-09-08)

Not committed. Both § A blockers closed; § B and § C are open.

**A1 — `test-run`.** Root cause turned out to be neither hypothesis in § A1. The addon's
`VitestManager.startVitest()` walks up from the `.storybook` directory and picks the first
`vitest.workspace.*` / `vitest.config.*` / `vite.config.*` file whose **source text
literally contains** `storybookTest` or `@storybook/addon-vitest`
(`node_modules/@storybook/addon-vitest/dist/node/vitest.js:216`), and roots Vitest there.
`libs/<fw>/vite.config.mts` matches the filename pattern and fails the content check, so
the walk-up stopped at a single unnamed project; the root `vitest.config.mjs` failed the
content check too, listing its projects as path strings. Angular's missing `test.name` was
a red herring — `storybookTest()` overwrites `test.name` on every attached project through
its own `workspace-name-override` plugin, which is why React and Vue failed identically
despite having one.

Fixed in `vitest.config.mjs`: Vue's two config files registered in `projects:` (they
existed and were wired nowhere), plus a comment documenting the mechanism whose necessary
side effect satisfies the content check. Recorded as **ADR-0112**, with the two rejected
alternatives (renaming the per-library configs — collides with `@nx/vitest`'s
target-inference glob; inlining `storybookTest()` in the root config — larger diff, same
result).

Verified live, twice and independently: `tools/call test-run` returns real passing results
on Angular, React and Vue, and the Vue run was re-confirmed from this session with the
Vitest project resolving to `storybook:/…/libs/vue/.storybook`. `nx test react/angular/vue`
unaffected (450 / 601 / 338). `check:all` exit 0.

The fix's own weak point — the comment is prose, a future cleanup could delete it as
decoration, and nothing in `check:all` boots Storybook — is now gated.
`check:vitest-discovery` asserts the sniff literal is still present and that every
`libs/*/vitest.storybook.config.ts` on disk is registered in the root `projects:` array,
with the framework list read from the filesystem. Exercised in both directions before
acceptance (clean 0; literal stripped 1 `[NO-SNIFF-LITERAL]`; Vue's registration removed 1
`[UNREGISTERED-PROJECT]`; restored 0). ADR-0112 carries a dated correction retiring its own
"no gate to catch it" sentence.

What the gate does **not** cover is stated in its own header and in that correction: it is
a static text check. If the addon's heuristic changes upstream, the gate stays green and
`test-run` breaks again. Its registration check is also a bare substring search rather than
a parse of the `projects:` array — the same "prove the string is there" convention
`check-manifests.js` uses, and satisfiable by a stray comment quoting the path.

**A2 — the 10.6 sweep.** `schulung-2tage-agenda.md` (Day 1 Blocks 3 and 4, Day 2 Blocks 2
and 3, the Material-Lücken row), `docs/src/pages/schulung.astro` (the Block-02 connection
checkpoint, the Block-03 test-loop split) and `README.md` (hosted vs local-dev tables) now
describe one tool surface for all three frameworks, with `nx test <lib> --watch` reframed
as an equal alternative rather than the Angular/Vue consolation prize. Version literals in
the agenda are gone; it points at `package.json`.

Two errors were found in passing and corrected: the agenda claimed
`experimentalReactComponentMeta` had replaced `react-docgen` for React (this repo keeps
`react-docgen`; only Angular and Vue got the analogous `experimentalDocgenServer`), and it
cited `addon-mcp@0.7.0` against an actual `10.6.0` pin. The `10.4` references were
deliberately left — they are historical anchors, phrased the way `storybook.astro` already
phrases them.

`nx build docs` exit 0, `check:all` exit 0, rendered HTML checked for escaping.

## Gegenprobe — Codex, 2026-09-09

Run at 00:25 once the quota reset, with the artefact and the question and **no** framing
from the pass above — no findings, no vocabulary, no joints named. Codex read the
*corrected* tree (§ A1 and § A2 already fixed), so this is also a fresh-eyes check on
yesterday's edits: it flagged nothing in them.

Fourteen findings. Split below; every item marked **new** that would change what someone
does next was re-verified here against the files before being written down.

### Confirms the framed pass

- **Claude Design vs `artboard-bridge`** — `claude-design.astro:194` "no machine-readable
  handoff exists in either direction" and `:249` "its tooling does not exist in this repo"
  against `artboard-bridge` Intake (`:31`) and Publish (`:104-160`). Reached from the
  opposite direction (it read the skill first) and landed on § B1/B2 exactly. Codex adds a
  distinction worth keeping in the rewrite: the chapter conflates *no unattended repo
  gate*, *no data transfer* and *no cohort-wide access* — three different limitations.
- **Parity overstates what it proves**, § D1/B3 and `plausibility A9`, with two new
  locations: `tutorial.astro:242` "Single source of truth · no drift" and `:497`. Codex's
  framing is the useful part — the qualification exists and is good
  (`parity-codespec.md:3`), it is just absent from *the first place a participant is asked
  to trust the result*.
- `mcp.astro:87,107` (= `plausibility A1`), the 6006 scaffold-Storybook contradiction
  (= `A7`), the `figma.astro:304` token-name and `claude-design.astro:272,351` overclaims
  (= `A9`, `A3`).

### New, verified, and it attacks this pass's own recommendation

**G1 (critical) — the curriculum and the `design-to-code` skill disagree about where the
participant's spec goes, and § B1/B5 recommends wiring them together without noticing.**

`docs/src/pages/schulung.astro:178` — *"Eigene Spec als eigene Datei neben der Komponente,
**nicht in den geteilten Master**"*. The skill's own handoff template
(`skills/design-to-code/references/handoff-document.md:36`) — *"**Target files.**
`libs/<fw>/src/lib/<name>/…` ; **spec block in `libs/spec/src/index.ts`**"* — and
`SKILL.md:106` reads the block there as ground truth. The agenda documents exactly what
that costs: three *additional* red gates (`check:spec`, `check:variants` `[UNMAPPED]`,
`check:metadata` `[MISSING-REGISTRY]`), measured in the 09-05 pass.

Second half, same shape: the skill's completion path runs `npm run parity:record`
unconditionally (`SKILL.md:167`), while `schulung.astro:351` explains the participant's
component is not in `tools/figma/snapshot.json` at all.

This is the most valuable thing the unframed seat produced, because it is a defect *in the
fix § B1 and § B5 propose*. Wiring the curriculum to `references/handoff-document.md` as
written would hand every participant the instruction the curriculum spends a bullet
warning them off. The skill needs a workshop branch — own spec file, no `parity:record`
against a node the snapshot does not hold — before that wiring is safe.

**G2 (high) — "interaction states are not variants" is contradicted by the acceptance bar,
by a brief, and by the architect skill that accompanies the same block.**

`workshop/briefs/README.md` — *"**Interaction states are not variants.** hover / focus /
active / disabled are CSS pseudo-classes and attributes, not entries in the variant
matrix."* Acceptance item 1, same file: *"The Figma component set carries ≥ 2 variants ×
**2 states**"*. `workshop/briefs/tagchip.md:71` puts `idle` and `hover` in scope as states.
And `figma-workspace-architect/references/decision-heuristics.md:86` — under *"Don't use a
Mode for:"* — *"States like hover/disabled — those are **Variant Properties**"*, with
`component-design.md:61` agreeing: *"Don't use Boolean Properties to encode mutually
exclusive states (Default / Hover / Disabled). That's a Variant."*

A participant building a `state=idle|hover` axis is following the architect skill and
violating the brief; avoiding it leaves them without a way to satisfy the "2 states"
acceptance item. Both documents are in the room during Day 2 Block 01.

**G3 (high) — a brief's blocker-severity a11y obligation depends on behaviour the same
brief declares out of scope.**

`tagchip.md:92` — *"one transition worth drawing even though it is **out of scope to
build**: removal"* — against `:110`, *"**Chips are removable by keyboard**, not only by
pointer. *(blocker)*"*, and `README.md:80`, which makes the acceptance bar *"the
blocker-severity mistakes it names are not present"*.

**Correction to Codex on its second example:** it pairs this with Toast's stacking
(`toast.md:73` out of scope vs `:126` "Three visible toasts; queue the rest"). Verified —
but that one is tagged *(major)*, not *(blocker)*, so it does not collide with the
acceptance bar the way TagChip's does. The pattern is real; the Toast half is weaker than
stated.

**G4 (high) — four documents name a different token-editing authority, and the homepage
claims a sync that is manual.**

`index.astro:81` *"Single source of truth for tokens and component frames. Variables sync
to `tokens.css`."* — `plan/figma.md:190-193` prescribes the sync by hand (*"Copy the new
value to `libs/angular/…`; Mirror to `libs/react/…`"* — and **omits Vue**) —
`code-sync.md:191` says *"currently kept in sync manually … changes happen on whichever
side the contributor is in"* — `artboard-bridge/references/palette-mapping.md:11` names a
*fourth* file, `libs/create-workspace/…/files/styles/tokens.css`, as *"the token source of
truth"*.

A participant changing one colour cannot tell which file to edit or what propagates. This
needs an ownership map — visual authority, token-value authority, API authority, generated
projections — not four documents each calling their own surface the source of truth.

**G5 (high) — the kata's copy-paste prompt targets an app the whole cohort does not have.**

`first-component.astro:26,32,38` set the target file to `workshop-{angular,react,vue}/…`;
`:160` says *"Copy it verbatim"*. The clone caveat exists and is adjacent (`:195-198`), so
this is not an undocumented trap — but the cohort is 100 % clone
(`schulung-2tage-agenda.md:14`), so the **default** prompt is wrong for every participant
in the room, and the corrective prose does not supply the story file the replacement path
needs. Weaker than Codex's "critical"; still a default that is wrong for everyone.

**G6 (high) — `plan/design-principles.md` and `plan/figma.md` contradict the
`atelier-design` skill, and § C1 only caught the naming half.**

`plan/design-principles.md:5` — *"Use `scale(0.97)` for active states"* — against
`atelier-design/references/brand-guide.md:102` — *"**No shrink**, no inset shadow."*
`plan/figma.md:61` locks *"concrete `Inter` weights"*; `atelier-design/SKILL.md:18`
specifies Instrument Sans / Instrument Serif / JetBrains Mono.

§ C1 found these two files stale in *naming*. They are also stale in *motion* and
*typeface*, and the curriculum puts `design-principles.md` into the agent's prompt context
(`schulung.astro:192`) while the `atelier-design` skill accompanies the same block — so the
agent receives both instructions at once.

**G7 (medium) — a privacy claim in the talk that is false as stated.**

`talk/storybook-mcp-talk.md:77` — *"**Local-First:** Dein Source Code verlässt niemals
deinen Rechner."* — in a bullet list about stdio transport, in a talk about coding with an
LLM. The transport is local; the code still goes to the model. Nobody caught this, this
pass included. It is the one finding here that is a claim about privacy rather than about
teaching, and it is made to an audience.

**G8 (medium) — `schulung.astro` states two different Day-1 deliverables.**

`:29` still gives the day's goal as *"eine existierende Atelier-Komponente per Prompt
verändert"*, while `:112` now says the block composes a Settings Card, *"keine Änderung an
einer bestehenden Komponenten-API"*. The 09-05 pass's M2 fix landed on the block and not on
the day goal, in the same file.

**G9 (medium) — the agenda's success check conflates generator idempotence with a clean
tree.** `schulung-2tage-agenda.md:94` still equates *"`npm run sync:generated` läuft ohne
Diff durch"* with *"`git status --short` danach leer"* — a participant's newly authored,
uncommitted files also appear there. The 09-05 pass fixed exactly this in
`schulung.astro` (its B3) and left the agenda copy. Same one-file-fixed pattern as G8.

**G10 (medium) — the CLI credential is a stated prerequisite with no participant-facing
path.** `schulung.astro:56` requires *"Claude Code CLI eingeloggt mit eigenem API-Key"*;
`workshop.astro:28` installs the CLI, runs `claude --version` and moves on to the Figma
token. Same class as § C2 (draft rights), different credential: stated, unverified until it
fails.

### Reported, not verified here

- **The prop-table dependency** (Codex #8): spec-and-story is taught before implementation,
  but a prop table is extracted from a component that does not exist yet. The pedagogical
  question is real; the file evidence Codex cites (`storybook.astro:122`) is about the
  hosted manifest, not about docgen ordering, so the contradiction is not established.
  Worth an owner decision — typed stub, minimal render, or full implementation first —
  rather than a fix.
- **No participant-facing manual Figma authoring exercise** (Codex #4): the walkthrough
  teaches inspection (`figma.astro:302`), the architect teaches automated construction
  (`build-workflow.md:81`), and Day 2 Block 01 budgets *"~45m manuelles Design im
  Figma-UI"* for an audience declared to have *"wenig Erfahrung mit Figma"*. Sharpens § C's
  timing risk rather than adding a new defect.
- **"Every gate is keyed on one of exactly four identities"** vs `check:box-sizing`: the
  line Codex cites is a findings record, not a gate-identity list. `plausibility A9`
  already flags the sentence; this does not strengthen it.

### What Codex called solid

Desktop Bridge setup and diagnosis (`figma-token.astro:182`, `troubleshooting.astro:63`);
the token tiers and the deliberate absence of a component-tier CSS twin
(`tokens.astro:149`); the behaviour sections of the briefs (Toast's *"resumes — it does not
restart"*, Avatar's fallback algorithm); the handoff document's split between mechanical
provenance and author-written decisions; `parity-codespec.md`'s honesty about what a parity
record does not store; the palette-gate demonstration; and the three-source a11y example
(*"Figma said it was perfect; axe said it was broken; the spec told us why"*).

## Fixed in the Gegenprobe pass (2026-09-09)

Not committed. **G1, G2, G3, G4, G6 and G7 closed**; G5, G8, G9, G10 and all of § B and
§ C remain open. `npm run check:all` exit 0, `npx nx build docs` exit 0,
`check:adr-refs` exit 0 at 115 ADRs.

**G1 → ADR-0113.** `design-to-code` Build mode gains a repo-vs-workshop branch keyed on a
signal the handoff document already collects: the **Source** line names the file the node
lives in, and a duplicate in someone's drafts never reaches `tools/figma/snapshot.json`.
The branch touches two of nine steps — spec placement and the closing check — and nothing
else. A third `### Workshop mode` heading was rejected because `test-skill.mjs` derives
valid fixture modes from exactly that heading pattern. Fixture `build-from-handoff-react`
was already the workshop case in its prose while asserting the old behaviour; corrected,
and a repo-case twin added so `parity:record` stays covered (7 fixtures, `test-skill.mjs`
exit 0, re-verified independently). `schulung.astro:178` and `agenda:115` now describe
skill behaviour instead of warning the room about the skill.

**G2 + G3 → ADR-0114.** The briefs' absolute *"interaction states are not variants"* is
replaced by the two-surface rule: Figma has exactly one primitive for a mutually exclusive
option, so a master that must *draw* a state has no choice but an axis — and Atelier's own
masters use one routinely — while no `Atl*Variant` union in `libs/spec/src/index.ts` ever
holds a state. The `variant-explosion-from-states` warning survives as what it actually is:
against *crossing* the axis, not against having one. `AtlButton`'s master marks the
boundary itself — every property line reads "→ maps to AtlButtonSpec.X" except `state`,
which has no arrow. a11y items in all four briefs now carry **(this block)** /
**(full component)**, so a blocker can no longer depend on behaviour the same brief puts
out of scope. Token census corrected 78 → 84 (the dropped `sizing` bucket).

Two consequences surfaced only once that rule existed, and were closed after an owner
decision: acceptance item 1 still demanded "≥ 2 variants × 2 states" — unsatisfiable for
the very components the briefs use — and two scope lines named `idle`/`hover` for
components that may not draw an interaction axis. StatCard now draws
`delta-up` / `delta-down`, which turns its own colour-alone blocker from an assertion into
a greyscale comparison of two real frames; TagChip draws no state axis at all, because its
interactive element is the remove button, and its interaction states go into the master
description. Recorded as a dated correction inside ADR-0114.

**G4 → ADR-0115.** "Source of truth" for tokens is five axes, not one file, established
from the scripts rather than from the prose: visual decisions in the Figma masters, token
*values* in `libs/create-workspace/…/files/styles/tokens.css`, API in `libs/spec`,
generated projections gated by `check:tokens` / `check:artboard-palette`, CSS usage
discipline by `check:css-tokens` / `check:token-tiers`. The homepage claimed a
Figma → `tokens.css` sync that runs the other way; corrected. `plan/figma.md`'s workflow
now starts at the canonical file and runs `sync:tokens`, which also retires its
missing-Vue defect — propagation is generated (four targets, Vue and the `atelier-design`
skill asset included), not hand-copied.

One instruction of mine turned out to be wrong and the agent overrode it, correctly and
visibly: `code-sync.md` was briefed as "already correct, cross-reference only", but its
repo notes predate ADR-0030 — they named the superseded `UI Tokens` collection and called
the sync bidirectional by convention, where ADR-0030 § 1 says *"Code is the source of
truth … Editing the collection by hand is drift by definition."* Corrected rather than
cross-referenced, and called out inside ADR-0115's Decision.

**G6.** `plan/design-principles.md`'s press rule was not merely citing a stale value —
both halves were false: no component scales on `:active` and none lifts on `:hover`,
across all three libs. Rewritten to what the code does (a colour/border token swap), with
the measurement dated inline. One live exception is now named explicitly so no agent
"fixes" it: the Chat popup's FAB grows on hover, identically in all three frameworks —
deliberate and parity-consistent, not drift. `plan/figma.md` gained a whole-document
staleness banner naming its stale component names, node-id tables, counts and font
families, and pointing at the live sources for each; the full `Llm*` → `Atl*` rewrite
stays a separate tracked job.

**G7.** `talk/storybook-mcp-talk.md:77` no longer claims *"Dein Source Code verlässt
niemals deinen Rechner."* It now separates transport from context: MCP runs locally, the
code still goes to the model.

## Second fix round (2026-09-09)

Not committed. **§ B closed, § C closed, G5, G8, G9, G10 closed.** `check:all` exit 0,
`nx build docs` exit 0, `check:adr-refs` exit 0 at 117 ADRs.

**§ C → ADR-0116, "cite the source, not the value".** `plan/big-picture.md` — the file the
curriculum injects into an agent's prompt context — is on the current vocabulary: every
`Llm*` renamed against `libs/spec/src/index.ts` (count now 0), the dead
`libs/llm-components-react` path gone, Vue added throughout with each row derived from
`libs/vue` source rather than by analogy from React.

The part that matters more than the rename: **what the spec does not define was cut, not
replaced.** `AtlToggle`'s `variant` prop and `AtlDialog`'s `closeOnEscape` were fictional
— re-verified here against `AtlToggleSpec` (`checked` / `onCheckedChange` only) and
`AtlDialogSpec` (`open` / `onOpenChange` / `closeOnBackdrop` / `size`). Literal token
values went too, since the brand moved blue → teal and the radius scale changed; the token
*names* stayed. In a file that becomes generated code, a plausible-looking wrong example is
the whole risk, and the brief made cutting the correct answer.

The ADR's rule is per-sentence, not per-document: architecture, conventions, behaviour and
worked examples stay as verified prose, because a principle without an example is unusable
on a first pattern-matching read; counts, versions, inventories and generated values get
repointed at their live source even when correct today — "correct today" being exactly the
property that already failed here. `plan/figma.md`'s twice-drifted node-id tables are now
a pointer to `tools/figma/snapshot.json`, and its whole-document staleness banner has
shrunk to a dated correction note.

**§ B → ADR-0117, "the silence was not the decision".** Both new skills are named in
participant-facing material, with the allowlist's own reason for carrying no
`.well-known` link — a card that cannot be clicked through is fine precisely because it
says why. `uianatomy-mcp` added too, which the agenda already cited this page as backing.
The handoff document is named on the English learner path for the first time
(`design-to-code.astro`, Step 1), closing § B5.

`claude-design.astro`'s absolutes were **narrowed, not dropped** — the page's fence
argument survives intact, which was the constraint:

- `:188` *"**nothing** downstream can read it, name it, or diff against it"* → *"**no
  gate** downstream…"*. One word; the claim becomes true and the argument is unchanged.
- The diagram caption drops "no machine-readable handoff exists in either direction" for
  *"no gate compares an artboard against anything. What crosses now is skill-mediated, not
  machine-readable."*
- Step 5 no longer says the tooling does not exist. It says Publish ran once and
  **correctly refused** — the parity record was DRIFT, so it named the commits and wrote
  nothing, *"the same behaviour this page's fence argues for"*, where the skill-less
  baseline published unverified code. The negation became the page's best illustration of
  its own thesis.
- `:106-109` narrowed to Figma-*native* export; `:111-113` gained the clause separating a
  forbidden direct artboard import from the supported canvas-informs-a-built-master path;
  the artboard/sheet equivalence and the two senses of "handoff" (§ B7) are stated.

Detail pages for the two new skills were deliberately **not** built: the two existing ones
carry build-time drift gates against their skill's `references/`, and matching that is
separate work. Recorded in ADR-0117 as deferred, not declined.

**G5.** The kata now presents scaffold and clone as two equally weighted labelled blocks
per framework rather than scaffold-plus-footnote, and the clone path is complete for the
first time — component path, story file, and `nx storybook <fw>` with the right port.
The story goes in as a loose `libs/<fw>/src/lib/settings-card.stories.*`, which
`check-story-descriptions.js` does not walk (it recurses into directories only), so the
exercise does not drag the participant into the shared spec — the same trap G1 fixed from
the other side. Verified against the existing `cookbook.stories.*` precedent, not executed.

**G8 / G9 / G10.** `schulung.astro:29`'s Day-1 goal now matches `:112` (Settings Card
composition, not an API change). `agenda:94` separates generator idempotence from a clean
working tree. And the CLI credential finally has a path: `preflight.mjs` was read in full
and only does `which('claude')` + `claude --version` — it never sends a model request —
so `workshop.astro` now states that limit where the green-preflight claim is made, adds
`claude auth login --console` and `claude -p` as the proof of model access, and
`/troubleshooting` gained a matching entry. Both CLI commands re-verified here against the
installed CLI's own `--help`. I applied the matching two bullets to `schulung.astro:56`
myself, since that file was owned by another agent at the time.

## Weakest points of this review

- ~~**No second model.**~~ Retired 2026-09-09 — the Codex Gegenprobe ran and is recorded
  above. It earned the seat again: ten new findings, one of which (G1) is a defect in the
  fix this pass recommends. The lesson repeats for the fourth time — the framed readers
  converged on the joints I pointed them at, and the value came from the reader who was
  pointed at nothing.
- **Nothing was rehearsed.** A1 and A2 are live measurements, but no Figma session ran,
  no Bridge call was made, and no block was timed. Every timing and load finding (C3, the
  dry-run gap) is a structural argument built on the material's own admissions.
- **A1's fix is untested.** The root cause is measured; the proposed fix is not — nothing
  in this session changed a config and re-ran the tool.
- **Part of B1 is a decision, not an oversight, and this review must not blur that.**
  Both new skills sitting outside `/.well-known/agent-skills/` is deliberate and recorded
  (`UNDISTRIBUTED_SKILLS` in `tools/scripts/lib/allowlists.js`, `check:skill-discovery`
  exits 0 saying so; `plausibility C10`). What B1 argues is the separate, *human-facing*
  question C10 named and left open: the curriculum and `/agent-skills` are silent about
  work that changes what the curriculum teaches. That is an editorial call for the owner,
  not drift for an agent to fix unasked.
- **B4's coverage table is the most subjective thing here.** "Mentioned only" versus
  "taught" is a judgement call, and a defender could argue the Figma → Claude Design row
  is deliberately thin because the direction is first-party and needs no teaching.
- Roughly a third of § D and § E is single-reader `reported`.
