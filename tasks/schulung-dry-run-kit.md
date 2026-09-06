# Schulung Dry-Run Kit

**Purpose:** make the one still-open near-term item — *"one rehearsal of the
participant path on a non-author machine, timed"* (`tasks/todo.md`, Near-term
work) — a one-day job with a result comparable to the three existing reviews,
instead of an improvisation. Everything the curriculum *teaches* lives at
`/schulung` and `schulung-2tage-agenda.md`; this document does not repeat it.
What it adds: the checklist of things that must **happen**, each with what
"worked" looks like, where a green result actually means failure, the points
where the run must stop and write something down, and a place to log the
result in the same shape as `tasks/schulung-review-2026-08-28.md`,
`-09-02.md` and `-09-05.md`.

**Who this is for:** one person, alone, timing themselves, on a machine that
is not the author's — closest available stand-in for a cohort participant.
Not a cohort. Not a second review of the prose.

**Rule for the run:** don't fix what you hit. Record it in §5, use the
documented workaround if one exists, and keep moving. A rehearsal that stops
to patch every rough edge never reaches the end of Day 2, and the timing data
becomes useless the moment the clock stops for a fix.

---

## 1. Known-blocked — read this before you start, don't chase any of it

| Item | Why it's blocked | What to do instead |
|---|---|---|
| Claude Design step 0 (Trainer-Demo "Drei Richtungen", Day 1 Block 04) | `claude.ai/design` needs a **different login** than the cohort's Claude Code API key; per-seat save/collaboration behavior for this product has never been verified. | Skip the Claude Design part of the demo entirely in a solo rehearsal. The fence mechanics underneath it (`check:artboard-palette`) do **not** depend on Claude Design access and are safe to rehearse — see §4, Day 1 Block 04. |
| Claude Design step 5 ("Handoff") | Specified in prose (`/claude-design`, schulung.astro Day 1 Block 04) but has no artefact, no worked example, and no tooling in this repo — it is blocked on the same unverified per-seat test as step 0. Do not confuse this with the *participant's own* handoff document (Day 2 Block 01→02, ADR-0096) — that one is real, built, and part of the path below. | Nothing to run. If you want to confirm the state hasn't changed: `grep -rn "Schritt 5\|Step 5" docs/src/pages/schulung.astro docs/src/pages/claude-design.astro` — still prose-only is the expected, unchanged result. |
| Figma Desktop Bridge | Not automatic. Every `figma_*` MCP call (Day 1 Block 02/04, Day 2 Block 01/04) depends on it being started by hand in the Figma Desktop app. | Before relying on *any* `figma_*` tool: open Figma Desktop, open the Atelier UI file (or your Day-2 duplicate), run **Plugins → Development → Figma Desktop Bridge**, then ask Claude to check Figma status (`figma_get_status` with `probe: true`) and confirm `setup.valid: true` before continuing. Re-run this check after any Figma restart. |
| `solved-*` backup branches (`solved-toast`/`solved-tagchip`/`solved-statcard`/`solved-avatar`) | Referenced in the agenda as the participant's escape hatch for a broken component; they do not exist yet (`git branch -a` — confirmed empty 2026-09-06). Building them is a separate open item (`tasks/todo.md`, "Schulung M12"). | For the rehearsal itself, protect your own progress the ordinary way (a local commit or `git stash` before anything risky) — that is a rehearsal convenience, not something to teach a cohort. |

---

## 2. How to use this kit

1. Start a timer at 09:00 (or whenever you actually start — record the real clock time, not the plan's).
2. Work the path in §4 in order. Each row names a command or action, the
   signal that means it actually worked, and — where one exists — a signal
   that looks fine but isn't.
3. At every **STOP** marker, do exactly that: stop, look at the output, write
   one line in §5 before moving on. These are not optional pauses; they are
   the points the three prior reviews found a fresh runner is most likely to
   diverge from what the material assumes.
4. Fill in §3 (timing) block by block as you go, not from memory afterward.
5. When Day 2 ends, walk the Erfolgs-Verifizierung's 7 items (schulung.astro,
   bottom section) once more as a checklist and log each as pass/fail/ambiguous
   in §5.
6. Finish by writing §6 (weakest point of this run) yourself, the way the
   three prior reviews each end with one.

---

## 3. Timing tracker

Fill in as you go. Planned times are the schedule on `/schulung`; nothing
about them has been measured before this run.

### Day 1 (planned net 6 h 50 min)

| Block | Planned | Actual start | Actual end | Delta | Note |
|---|---|---|---|---|---|
| 00 Kickoff | 09:00–09:30 (30) | | | | |
| 01 Setup & Preflight 🔴 | 09:30–10:45 (75) | | | | |
| — break — | 10:45–11:00 | | | | |
| 02 Figma für Entwickler | 11:00–12:15 (75) | | | | |
| — lunch — | 12:15–13:15 | | | | |
| 03 Storybook | 13:15–14:30 (75) | | | | |
| — break — | 14:30–14:45 | | | | |
| 04 MCP & Claude Code | 14:45–16:00 (75) | | | | |
| — micro-break — | 16:00–16:10 | | | | |
| 05 Walkthrough | 16:10–17:15 (65) | | | | |
| 06 Wrap-up | 17:15–17:30 (15) | | | | |

### Day 2 (planned net 6 h 50 min)

| Block | Planned | Actual start | Actual end | Delta | Note |
|---|---|---|---|---|---|
| 00 Recap & Brief | 09:00–09:30 (30) | | | | |
| 01 Design in Figma 🔴 | 09:30–11:00 (90) | | | | |
| — break — | 11:00–11:15 | | | | |
| 02 Spec & Story | 11:15–12:30 (75) | | | | |
| — lunch — | 12:30–13:30 | | | | |
| 03 Codegen | 13:30–15:00 (90) | | | | |
| — break — | 15:00–15:15 | | | | |
| 04 A11y + Dark Mode | 15:15–16:30 (75) | | | | |
| — micro-break — | 16:30–16:40 | | | | |
| 05 Show & Tell | 16:40–17:30 (50) | | | | |

---

## 4. The path — checkpoints, expected signal, false-positive traps

Commands assume the repo clone (per `AGENTS.md` / ADR-0084), a shell in the
repo root, and Claude Code CLI logged in.

### Day 1

**Before 09:00 (once):** Figma Desktop open → Atelier UI file open → Plugins
→ Development → Figma Desktop Bridge started → ask Claude to probe Figma
status → `setup.valid: true`. If this isn't true, every `figma_*` call below
fails for a reason preflight never checks (see Block 01).

**Block 00 — Kickoff.** No gate. Time it.

**Block 01 — Setup & Preflight 🔴**
- Run `npm run preflight`. Expect a clean run: Node/npm/git ok, Claude CLI
  present, Figma REST token optional-warn (fine, it's optional), ports
  4300/4400/4401/4402 reported **free**, and the servers configured in
  `.mcp.json` (the *hosted* ones) reachable.
- **STOP.** A green preflight proves exactly that list — nothing more. It
  does **not** prove: (a) any `figma_*` tool actually works (it checks that
  the bridge's port range is free, not that the plugin answers — that's the
  Figma-status probe above), or (b) the local Storybook `dev`/`test` MCP
  toolset exists — that endpoint doesn't exist until Day 2 Block 02, after
  `nx storybook <fw>` is running and a local entry has been added. Record: did
  preflight actually run clean, and were the two blind spots above clear to a
  first-time reader of the output, or did the summary read as "everything is
  ready"?
- Read `.mcp.json` together. Confirm: it lists the three `storybook-*` hosted
  servers plus `nx-mcp`, `figma-console`, `uianatomy`, `angular-cli`,
  `Astro docs` — and **zero** `localhost` entries. That absence is correct
  today; the local one gets added in Day 2 Block 02, not before.

**Block 02 — Figma für Entwickler.** No gate. If the rehearsal seat lacks
Figma Draft rights (`File → Duplicate to your drafts` unavailable), that is
itself a finding worth one line in §5 — it blocks Day 2 Block 01 outright.

**Block 03 — Storybook comparison.** No gate; open the three hosted
Storybooks, compare `AtlButton`. Time it.

**Block 04 — MCP & Claude Code**
- Ask (hosted) for a component's props — expect a correct prop table, no
  invented props.
- Negativ-Demo: same question with no MCP configured (a plain browser chat)
  — expect a hallucinated answer. Illustrative only, nothing to run.
- Angular/Vue ~5 min: ask the **hosted Angular or Vue** endpoint about a
  component with a two-way binding (e.g. `AtlToggle`). Expect the reply
  **already** in framework-native shape — Angular `[(checked)]` /
  `checkedChange`, Vue `v-model` / `update:checked` — with no manual
  translation step needed (ADR-0097 superseded the old React-shaped
  substitution, ADR-0083). This is a genuinely different answer than it would
  have been in early September; if the reply instead looks React-shaped
  (JSX, `children`, `onCheckedChange`), that is a real regression — say so.
- **Skip** the Claude Design ("Drei Richtungen") demo — known-blocked, §1.
- The fence underneath it is independent and safe to run alone: `npm run
  check:artboard-palette` → expect exit 0. Hard-code one colour value in
  `tools/design/artboard-palette.css`, run it again → still exit 0 (the gate
  reads only the generated sheet against `tokens.css`, never an artboard).
  Then `git checkout tools/design/artboard-palette.css` to revert before
  moving on.

**Block 05 — Guided walkthrough.** Follow `/tutorial` in the chosen framework
— compose the Settings Card from `AtlCard`/`AtlInput`/`AtlToggle`/`AtlButton`
by prompting, not typing. Time it. Note whether "prompt, don't type" needed
active enforcement or happened naturally.

**Block 06 — Wrap-up.** No gate.

### Day 2

**Block 00 — Recap & Brief.** No gate.

**Block 01 — Design in Figma 🔴**
- Duplicate the Atelier file into your own Drafts (needs Draft rights — see
  Block 02 note above). Copy + rename the relevant starter frame from the
  Workshop-Templates page.
- ~45 min manual design, ~45 min MCP structuring (Component Properties,
  `figma_audit_component_accessibility`) per the brief's matrix
  (`workshop/briefs/<component>.md`).
- **STOP.** Before opening Claude for Block 02, write the handoff document
  the block ends with (ADR-0096): draft URL + node id, chosen variants/states,
  token bindings, reuse-vs-new decision, the behaviour from the brief,
  explicit exclusions, target files, acceptance checks. This document has
  never been timed or drafted by anyone but its author. Record how long it
  actually took and whether the brief left anything ambiguous enough to stall
  writing it.

**Block 02 — Spec & Story per Prompt**
- React path: start `nx storybook react` in a second terminal — expect the
  "Storybook ready!" banner with `http://localhost:4401/`. Then connect:
  `claude mcp add --transport http storybook-local http://localhost:4401/mcp`
  (default scope is `local` — confirm with `git status --short .mcp.json`
  staying empty, both before and after). Reconnect the client and list tools.
  **Verified live 2026-09-06:** the local endpoint on Storybook 10.6.0 answers
  with 8 tools, presently named `docs-list`, `docs-show`, `docs-show-story`,
  `stories-preview`, `stories-changed`, `stories-find-by-component`,
  `get-storybook-story-instructions`, `test-run` — this matches what
  schulung.astro's Block 02 bullet already names. **STOP** if any of the
  three the block calls mandatory (`get-storybook-story-instructions`,
  `stories-preview`, `test-run`) are missing: that means "not configured",
  not "server down" — the point of this checkpoint.
- Angular/Vue path: no local MCP tools exist for these frameworks. Work from
  `plan/big-picture.md` and, if useful, the hosted React story as a reference.
  Note whether this asymmetry costs visible extra time against React.
- Prompt Claude for a spec "im Stil von `libs/spec/src/index.ts`" plus a
  story, from the handoff document — not from the picture alone. Iterate
  until the prop table matches the brief.
- **STOP — the spec's home.** Confirm the new spec landed in its **own
  file** next to the component, not inside the shared `libs/spec/src/index.ts`
  master. Then run these six **individually** — not `npm run check:all`,
  whose script is one long `&&` chain that stops dead at the first non-zero
  exit and would hide the rest (`check:sync` sits first in that chain, so a
  single `check:all` run would show only that one failure and silently skip
  the other five):
  ```
  for g in check:sync check:a11y-parity check:design-status check:spec check:variants check:metadata; do
    npm run "$g" > "/tmp/$g.txt" 2>&1; echo "$g: $?"
  done
  ```
  Reproduced against the real gate chain on 2026-09-05 and unaffected by
  today's gate renames (`check:iconography`→`check:icon-duplication` etc. —
  none of these six were touched): expect exactly **`check:sync`,
  `check:a11y-parity`, `check:design-status`** to print non-zero, and
  **`check:spec`, `check:variants`, `check:metadata`** to print `0`. All six
  non-zero means the spec ended up in the shared master by mistake — the
  single highest-value checkpoint in this whole kit, because it's the one
  place two prior reviews say a fresh runner is most likely to diverge from
  what the page assumes.
- **STOP — the false-success check.** Run `npm run sync:generated`. Expect
  exit 0 and an empty `git status --short` afterward. Understand — don't
  just observe — *why* that's correct with an out-of-master spec: the command
  only checks that the generated copies (spec mirrors, behaviors, `llms.txt`)
  match the shared master; with your work correctly living outside that
  master, it has nothing of yours to see, and passing trivially is not proof
  your component is right. That proof is items 3–7 of the
  Erfolgs-Verifizierung, not this line.

**Block 03 — Codegen**
- React: iterate with the `test-run` MCP tool (a11y checks on by default);
  Angular/Vue: `nx test <lib> --watch` plus the browser Storybook open in
  parallel.
- Time it; note friction in the "paste the error back to Claude" loop.

**Block 04 — A11y + Dark Mode + States**
- Three-step check: `figma_audit_component_accessibility` (needs the Bridge —
  §1), Storybook's A11y panel (axe-core), a manual keyboard walkthrough
  (Tab/Shift+Tab/Enter/Escape).
- Dark mode via Storybook's backgrounds/theme addon (not just
  `prefers-color-scheme`).
- **STOP — the parity `codeSpec` exercise.** Call `figma_check_design_parity`
  on your own node **twice**, same node/variant both times: once with all
  seven `codeSpec` fields supplied (`visual`, `spacing`, `typography`,
  `tokens`, `componentAPI`, `accessibility`, `metadata`) and one spacing value
  deliberately wrong — expect the report to catch it. Then again with the
  `spacing` field simply omitted, same wrong value present in the component —
  expect a **clean** report: fields not supplied are not compared. This
  distinction has, until this run, only ever been read off the skill's schema
  (`skills/figma-workspace-architect/references/code-sync.md`) — never watched
  live. If the sparse call does *not* come back clean, that overturns a claim
  three prior reviews all repeated without testing it — record it as a
  blocker, not a minor note.

**Block 05 — Show & Tell.** No gate. Time it.

**End of Day 2 — Erfolgs-Verifizierung.** Walk all 7 items on `/schulung` in
order against your own component. Log each as pass/fail/ambiguous in §5,
quoting the actual command or tool output you saw — not a paraphrase.

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

| # | Severity | Location | Evidence | Smallest fix | Verified / assumed |
|---|---|---|---|---|---|
| | | | | | |

---

## 6. Weakest point of this run

Write this last, the way each prior review does: name the one thing this
rehearsal still didn't settle, and why. (Candidates already known going in:
whether a cohort-sized concurrent load on the hosted MCP endpoints behaves
differently than a solo session; whether a genuinely first-time Figma user's
timing on Block 01/02 of Day 2 matches this run's, since this kit is still run
by someone who already knows the repo.)

---

## 7. What this kit's own commands were checked against (2026-09-06)

Every command this document tells the runner to type was executed for real
before publishing it, not inferred from source alone:

- `npm run preflight` — read in full (`tools/scripts/preflight.mjs`) to
  confirm exactly what it checks (ports free, hosted MCP reachable) and what
  it structurally cannot (local dev/test tools, a live Figma Bridge roundtrip).
- `nx storybook react` — started for real; reached "Storybook ready!" on
  `:4401` in ~4 s.
- The local MCP endpoint at `http://localhost:4401/mcp` — spoken to directly
  over the streamable-HTTP transport (`initialize` → `notifications/initialized`
  → `tools/list`); the 8 tool names quoted above are this call's live result,
  not a doc reference.
- `claude mcp add --transport http <name> http://localhost:4401/mcp`,
  `claude mcp list`, `claude mcp remove <name> -s local` — run for real under
  a throwaway name (not `storybook-local`, to avoid colliding with anything);
  local scope confirmed default, `.mcp.json` confirmed untouched by
  `git status --short` before and after; server showed `✔ Connected`.
- The hosted `storybook-angular` MCP endpoint — called directly
  (`docs-list` then `docs-show` for `AtlToggle`) to check ADR-0097's native-reply
  claim; it returned Angular Signal Forms syntax (`[(checked)]`,
  `checkedChange`), not the old React-shaped substitution — the claim in
  Day 1 Block 04 above is live-verified true today, not carried over from the
  09-05 review's now-superseded finding.
- `npm run check:artboard-palette`, `git checkout tools/design/artboard-palette.css`
  — both exist and were exercised.
- `git branch -a | grep -i solved` — confirmed empty.
- `nx test react` — run for real, exit 0, ~10 s; confirms the `test` target
  named throughout Block 03/Erfolgs-Verifizierung actually resolves (Angular
  and Vue carry the identical target name per each `project.json`, not
  re-run individually).
- The six-gate spec-placement table (§4, Block 02) is `tasks/schulung-review-2026-09-05.md`'s
  own reproduction against the real gate chain, re-checked here only for
  whether any of the six gate names moved in today's two gate-renaming
  commits (`ba5e29d`, `3b2b8e3`) — they did not; the renames touched
  `check:iconography`, `check:manifests`, `check:primitives` and
  `check:exports`'s internals, none of the six named here.
- Deliberately **not** re-executed today, and left for the actual rehearsal to
  be the first to observe: the parity `codeSpec` double-call (Block 04 —
  needs a participant's own Figma node, not the maintainer's), a full Day-1/
  Day-2 timing pass, and anything needing a second Figma seat or a cohort-sized
  concurrent load.
- `npm run check:all` and `npx nx build docs` were run in full as part of
  closing this task (see the task's own verification, not repeated here).

**One defect caught in drafting this kit, by re-reading it rather than by any
gate:** the first draft of the spec's-home checkpoint (Block 02) told the
runner to read the six expected gate results off a single `npm run check:all`
invocation. `check:all`'s script is one long `&&` chain — a non-zero exit from
`check:sync` (first in the chain) stops it dead, so a single run would show
only that one failure and silently skip the other five, including
`check:a11y-parity` and `check:design-status`. The 2026-09-05 review avoided
this by running each gate individually (`npm run <gate> > file 2>&1; echo
$?`); the checkpoint above now does the same. Verified the failure mode itself
with `bash -c 'echo one && false && echo two'` — exits after "one", "two" never
runs.

---

## 8. What this kit deliberately leaves out

- The curriculum content itself — every block's *teaching* material stays on
  `/schulung` and in `schulung-2tage-agenda.md`; duplicating it here would
  drift the moment either changes, which is the exact failure mode this
  week's review work was about.
- A cohort-scale test (concurrent seats, hosted-MCP rate limits, a Figma plan
  tier check) — needs a cohort, not a solo rehearsal; tracked separately in
  `tasks/todo.md`'s trainer-kit checklist.
- Fixing anything this run finds. That's the findings table's job, and the
  next task after this one.
