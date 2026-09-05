# Training Material Review — Third Pass, the Handoff Joints

**Date:** 2026-09-05 · **Baseline:** `tasks/schulung-review-2026-08-28.md` and `tasks/schulung-review-2026-09-02.md` · **Artefact:** `docs/src/pages/schulung.astro` (the `DAYS` array) · **Inputs:** three independent reviewers run in parallel — two Sonnet subagents on separate briefs (curriculum completeness · the Figma→Claude Design→agent→code chain) and one Codex session given the artefact and the question with **no framing at all** — plus own spot-verification of every finding listed below.

The question asked: is the content complete, where are the gaps, and specifically — does the interplay of Figma and Claude Design, the handover to the agent, and the path into code hold together?

---

## 1. Verdict

The four-step loop the repo is built around — Inspect → Spec → Generate → Verify — is taught and practised. `figma_check_design_parity` is the best-taught joint on the page: practised three times, and the Erfolgs-Verifizierung correctly separates the ad-hoc MCP call from the repo gate that reads `tools/figma/snapshot.json`.

What fails is everything on either side of that loop, and it fails the same way each time: **the page states an outcome where it should teach a step.** The participant's own spec has no declared home, the local MCP surface that Day 2 depends on is never connected, the Day-2 success check is asserted to read the day's work and does not, and "Handoff" is a word on the page with no artefact behind it in either of its two senses — Claude Design's step 5, and the participant's own design→agent handover.

The methodologically important result is the **divergence between reviewers**. The two framed reviewers converged on the joints I pointed them at. Codex, given no framing, went somewhere else entirely and found two referential defects that the completeness reviewer had explicitly cleared as "clean". The framing was the blind spot — as it was the last time this check was run.

**Counts: 3 blockers · 4 major · 4 minor.** All verified against files; the verification method is named per finding.

---

## 2. Blockers

### B1 — The participant's spec has no home, and the instruction that fixes it was written this morning into the wrong file

`schulung.astro:170` (Day 2, Block 02): *"von Claude eine Spec (im Stil von `libs/spec/src/index.ts`) und Story generieren lassen"*. Nothing on the page says where that spec goes.

Commit `7c9a9a2` (2026-09-05, "the gate list is measured now, and the spec gets a home") touches **only** `schulung-2tage-agenda.md`. It adds the resolution: *"die eigene Spec als eigene Datei neben der Komponente, nicht in den geteilten Master. Das Material sagt „eine Spec **im Stil von**…" — im Stil von, nicht hinein."* It also records the measured gate consequences of getting this wrong: `check:variants` → `[UNMAPPED]`, `check:metadata` → `[MISSING-REGISTRY]`, on top of the three gates that go red for any single-framework add.

`grep` for `eigene Datei|geteilten Master|UNMAPPED|MISSING-REGISTRY` against `schulung.astro` → zero hits. The shipped page is one commit behind the agenda on the single instruction that keeps a participant out of three extra red gates nobody has shown them how to fix.

**Fix:** one bullet in Block 02, and a line in the Erfolgs-Verifizierung.
**Verified:** `git show 7c9a9a2 --stat` (1 file, 10 insertions), diff read, grep against the page.

**Reproduced 2026-09-05** — the agenda's gate list is not just measured by its author, it is measured again here. Baseline: all six gates exit 0 on a clean tree.

| Gate | clean | A: single-fw add, spec in own file | B: same + spec in shared master |
|---|---|---|---|
| `check:sync` | 0 | **1** `[DRIFT] 'wsdemo' is missing from React` / `from Vue` | **1** |
| `check:a11y-parity` | 0 | **1** `[BLOCKER] [ROSTER] wsdemo: no a11y snapshot and no A11Y_PARITY_EXEMPT entry` | **1** |
| `check:design-status` | 0 | **1** | **1** |
| `check:spec` | 0 | 0 | **1** |
| `check:variants` | 0 | 0 | **1** `[UNMAPPED] AtlWsdemoVariant (Variant) is not in UNION_TO_COMPONENT` |
| `check:metadata` | 0 | 0 | **1** `[MISSING-REGISTRY] AtlWsdemoSpec: not in COMPONENT_METADATA_REGISTRY` |

Method: created `libs/angular/src/lib/wsdemo/` with `atl-wsdemo.ts`, a story, and `wsdemo.contract.ts` (the participant's spec in its own file) for A; appended `AtlWsdemoVariant` + `AtlWsdemoSpec` to `libs/spec/src/index.ts` for B. Each gate run as `npm run <gate> > file 2>&1; echo $?` — exit code read, never piped. Tree restored afterwards (`rm -rf` the dir, `git checkout -- libs/spec/src/index.ts`) and all six gates re-run: back to 0.

**Three red is the correct, expected state for a participant. Six means they edited the master.** The page currently gives the room no way to tell those apart.

### B2 — Day 2 requires a local MCP surface that no block connects

Day 2 Block 02 (`schulung.astro:174`) makes `get-storybook-story-instructions` mandatory before every `*.stories.*` edit. Block 03 (`:186`) puts the React test loop on `localhost:4401/mcp` with `preview-stories` and `run-story-tests`. Both tools live in the `dev`/`test` toolsets, which exist only on a running local Storybook's own MCP endpoint.

`.mcp.json` configures eight servers. **Zero contain `localhost`.** `AGENTS.md` says it plainly: *"Add a local entry when you need the dev / test toolsets."* No page teaches that step — `/storybook:225-227` lists the three local URLs in a table and stops there.

A React participant reaches Block 02 and the mandatory tool is not there. They cannot tell "not configured" from "server down" from "wrong endpoint", because the configuration step was never in the room.

**Fix:** a participant checkpoint at the start of Day 2 Block 02 — start Storybook, register `http://localhost:4401/mcp`, reconnect, list tools, preview one known story.
**Verified:** `.mcp.json` parsed (8 servers, `grep -c localhost` → 0); grep across `docs/src/pages/*.astro` for the local URLs and for `claude mcp add`.

### B3 — The Day-2 success check claims to read the day's work; it reads two files, neither of them the participant's

`schulung.astro:338`: *"`npm run sync:generated` läuft ohne Diff durch … anders als `preflight`, das nie Komponenten-Code liest, prüft das direkt die heutige Arbeit."*

`sync:generated` = `sync-spec.mjs && gen-behaviors.mjs && gen-llms-txt.mjs && sync-skill-discovery.mjs`. `sync-spec.mjs` copies exactly `libs/spec/src/index.ts` and `libs/spec/src/icons.ts` into `libs/<fw>/src/lib/`. `gen-behaviors.mjs` regenerates from `behaviors.json`. Neither reads component code — the same blind spot the contrast sentence accuses `preflight` of.

Worse in combination with B1: once B1's correct instruction is applied (own spec file, not the shared master), `sync:generated` has nothing of the participant's to see at all. It passes trivially. Participants are being taught to read a clean `git status` as proof of correctness.

**Fix:** replace with a check that reads the participant's own files — build/lint/test scoped to their component — and keep the regeneration check for what it actually proves.
**Verified:** `package.json#sync:generated` printed; `tools/scripts/sync-spec.mjs` read (source list is a two-entry array at `:23-24`).
**Convergence:** found independently by the completeness reviewer and by Codex, same line, same reasoning. Highest-confidence finding in this pass.

---

## 3. Major

### M1 — "Handoff" is asserted twice and delivered zero times, in both of its senses

Two reviewers reached this joint from opposite directions, which is why it is one finding and not two.

**Claude Design's step 5.** `schulung.astro:98` tells the room *"Claude Design ist kein fünfter Pillar, sondern Schritt 0 (Divergenz) und Schritt 5 (Handoff), nie Schritt 1–4"* — and builds a checkpoint question on that distinction. The string "Schritt 5" appears **once** on the page. On `/claude-design`, where the trainer is sent for background, step 5 exists as a diagram label (`:232`), an SVG `<desc>` (`:196`) and one sentence (`:180`). No artefact, no worked example, no fallback. Step 0 at least gets a trainer demo as a stopgap for the per-seat blocker; step 5 gets nothing. The worked version exists — `tasks/review-state-2026-08-26.md`, Kata 5 "The Handoff Card" — and has never reached a participant-facing page. `tasks/schulung-review-2026-09-02.md:57` (M3) recorded this; still open.

**The participant's own handover.** The briefs carry behaviour a picture cannot: Toast specifies timer pause/resume, Escape, live-region politeness. The transition from Day 2 Block 01 (Figma) to Block 02 (prompt) is *"API in Worten beschreiben"* — nothing binds that to the participant's own duplicated node, their scope, their acceptance criteria. They may reproduce appearance and leave behaviour implicit.

**Fix:** (a) turn Kata 5 into prose on `/claude-design` with one screenshot — no agenda time, the trainer's background reading; the spec for it is already written. (b) End Day 2 Block 01 with a short handoff document: draft URL/node, chosen variants and states, token bindings, reuse-vs-new decision, behaviour, exclusions, target files, acceptance checks. Have a fresh agent session implement from that document.
**Verified:** grep for `Schritt 5|Step 5` across both pages; `tasks/review-state-2026-08-26.md` and `tasks/todo.md:1901,2285` read (the per-seat blocker is real and correctly gated, not a writing omission).

### M2 — Block 05 names a prop that does not exist, and its linked instructions teach a different exercise

`schulung.astro:110`: *"ändern existierende Komponente (z.B. neuer Button-**Tone**)"*. The spec has `AtlButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'` at `libs/spec/src/index.ts:15`, and the prop is `variant`. There is no `tone` contract anywhere.

The block's own linked walkthrough, `/tutorial`, composes a Settings Card from `AtlCard`/`AtlInput`/`AtlToggle`/`AtlButton`. It does not teach extending an existing component's API. The mandatory Day-1 exercise and the instructions it points at are two different tasks.

**Fix:** make Block 05 the Settings Card composition it actually links to; if API extension stays a goal, give it its own beat with the real prop name.
**Verified:** grep of `libs/spec/src/index.ts` for `tone` (no hits outside `AtlButtonVariant`'s neighbours); `/tutorial` read.
**Note:** the completeness reviewer's referential-integrity sweep returned "clean — everything checked resolves". It did not. This defect and B2 both sit inside that sweep's scope.

### M3 — Angular and Vue participants meet the React-shaped manifest on every lookup and never practise resolving it

ADR-0083's substitution is documented in `AGENTS.md`, `/design-to-code:58-59` and `/tutorial:477-481`: the hosted Angular and Vue endpoints answer with React's manifest, and `libs/spec/src/index.ts` settles any binding in doubt. `grep` for `ADR-0083|React-shaped|children|model\(\)|update:` against `schulung.astro` → zero hits.

Of Day 2's two build blocks (165 min combined), React participants get a named mandatory MCP tool in both. Angular and Vue get none in either, and the one place they are pointed at a React example (`:174`, "ggf. React-Story als Vorlage holen") carries no translation instruction. The safety net is documented and unrehearsed — the first time an Angular participant needs it, it is a new skill.

**Fix:** ~5 min inside Day 1 Block 04, which already runs the MCP demo live: one Angular/Vue query against a component with a change handler, `libs/spec/src/index.ts` open side by side. Name the mapping once — `children` → projection/slot, `on*Change` → `model()`/`update:*`.
**Verified:** grep against the page; `AGENTS.md` and the two docs pages read.
**Convergence:** all three reviewers, from three different angles.

### M4 — A clean parity report is treated as proof without teaching how the comparison is built

`schulung.astro:343` makes a clean `figma_check_design_parity` the closing criterion. `skills/figma-workspace-architect/references/code-sync.md:142` documents the `codeSpec` input — visual, spacing, typography, tokens, API, accessibility, metadata. **Fields not supplied are not compared.** `plan/adr/0024-design-parity-persistence-gate.md:118` records the amendment: unchanged code scored differently because the sampled node and the declared fields changed.

Participants cannot distinguish "the implementation matches" from "the agent supplied a sparse comparison", and feeding findings back does not repair missing coverage.

**Fix:** in Day 2, have participants inspect the node, variant/state and `codeSpec` they submitted, then deliberately introduce one spacing mismatch the check must catch. Keep the page's correct MCP-call-vs-repo-gate distinction.
**Verified:** `code-sync.md` and ADR-0024 read. *(Reported by Codex; the live tool was not called in this session — the field semantics are read from the skill reference, not observed.)*

---

## 4. Minor

### n1 — `/claude-design` says 29 gates; there are 34

`docs/src/pages/claude-design.astro:209` (visible diagram text) and `:196` (the screen-reader `<desc>`) both read *"check:all · 29 gates"*. `package.json#check:all` chains **34**; `AGENTS.md:124` says 34. Stale by five, in both the visual and the accessible copy — on the page the curriculum sends the trainer to for background.
**Verified:** `check:all` printed and counted.
**Found by:** neither reviewer — surfaced while spot-checking M1.

**Checked and deliberately NOT changed on the same page:** `31 artboards` is correct — `tools/design/artboards.json` holds 31 entries nested under its `artboards` key (a top-level key count returns 2 and is the wrong measure). `29 components` is *not* drift either, though the library now has 31 component directories per framework: it belongs to a dated record — *"On 2026-08-26 and 27 this library was redesigned through the canvas. 31 artboards — 29 component sheets plus two studies — covering 29 of 29 components."* Updating that figure would falsify what happened on that date. Only the `check:all` gate count is a present-tense claim about the repo, and only it was corrected.

The hero at `:149` is the one borderline case — *"This library's own 29 components were redesigned through 31 of them"* reads as a current count while describing the same past event. Left alone rather than silently rewritten; worth a deliberate wording decision, not a number swap.

### n2 — Neither high-risk block links to `/troubleshooting`

Day 1 Block 01 and Day 2 Block 01 both carry `risk: true`. `grep -c troubleshooting schulung.astro` → **0**. `/troubleshooting` holds 14 on-topic entries, several of them exactly these blocks' failure modes (bridge not connected, node-id doesn't resolve, port conflicts, Node too old). The page knows the pattern — Block 04's Claude Design demo has a verified-accurate fallback (`:99`, the 31 artboards; count confirmed in `tools/design/artboards.json`) — it just isn't applied where it is flagged as needed.

### n3 — `HelpFooter` promises eight failure modes; there are 14

`docs/src/components/HelpFooter.astro:29`: *"Eight common failure modes with one-line fixes."* `troubleshooting.astro` defines 14 entries in `ISSUES`. `schulung.astro:347` renders this footer. Prior finding n6 (2026-09-02), still open.
**Verified:** entries enumerated (`:19`–`:170`, 14 titles after excluding the type declaration at `:8`).

### n4 — Declared net hours overstate the schedule by 10–70 min

Both days: 410 min of blocks + 100 min of breaks = 510 min, 09:00–17:30, no gaps or overlaps, break structure exactly as declared. Net working time is **6 h 50 min**, against *"~7–8 h netto"*. Prior finding n1 (2026-09-02), re-verified by full recomputation, unchanged.

---

## 5. On the method

Three reviewers, deliberately unequal briefs. The two Sonnet subagents got my framing — one on curriculum completeness, one aimed at the Figma→Claude Design→agent→code chain with the "Schritt 0 / Schritt 5" vocabulary in the brief. Codex got the artefact, the repo, and one question, with the handoff stretch named only as *"a design surface hands work over to a coding agent"* — no product names, no step numbers, no joints enumerated.

The framed chain-reviewer confirmed the joints I named and ranked Claude Design's step 5 first. Codex ranked shippability first and reached the handoff gap from the participant's side, then found B2 and M2 — two referential defects inside the scope the completeness reviewer had just declared clean.

The lesson repeats the one already in `CLAUDE.md §3`: the brief's central constraint is the sentence most worth withholding. Reviewer 2 built around "Schritt 0 and Schritt 5" because I handed it that frame; it found the gap inside the frame and not the larger one around it. Worth keeping the unframed third seat in this rotation.

**Weakest point of this pass:** B1 is now reproduced end to end against the real gate chain (table above), so that caveat is retired. What remains unverified is everything that needs a live surface rather than a file: no MCP call was made against a running local Storybook, so B2's failure mode is inferred from `.mcp.json`'s contents and the toolset gating documented in `AGENTS.md`, not observed; M4's `codeSpec` field semantics come from `skills/figma-workspace-architect/references/code-sync.md`, not from a call I watched; and no Figma action was performed, so nothing about the Day-2 design block is confirmed beyond what the snapshot file contains. Nothing here is workshop-verified — no dry run happened.

---

## 6. Fixed in this pass (2026-09-05)

All three blockers closed in `docs/src/pages/schulung.astro`. Nothing else touched; not committed.

- **B1** — Day 2 Block 02 now carries the spec's home in the agenda's own words ("im Stil von, nicht hinein") plus the reproduced gate expectation: *drei rote Gates sind erwartet, sechs heißt: die Spec liegt im Master*. The room can now tell the two apart.
- **B2** — Day 2 Block 02 opens with a React-only connection checkpoint: start Storybook on 4401, then `claude mcp add --transport http storybook-local http://localhost:4401/mcp`, reconnect, confirm the `dev`/`test` tools are listed. It names the diagnosis participants could not otherwise make — "nicht verfügbar" means "nicht konfiguriert", not "Server down" — and scopes Angular/Vue out.
- **B3** — Erfolgs-Verifizierung item 2 no longer claims to read the day's work. It states what `sync:generated` proves (the generated copies match the shared master) and says plainly that a correctly-placed participant spec makes it pass trivially, pointing at items 3–7 for the component itself.

**Two defects were caught in the first fix round and corrected**, both found by reading the diff rather than by any gate:

1. The first attempt told participants to edit `.mcp.json` — which is **tracked** (`git ls-files --error-unmatch` resolves, not gitignored). That would have put a permanent entry in `git status` and made Erfolgs-Verifizierung item 2 ("`git status --short` danach leer") unsatisfiable — the fix would have contradicted the page. `claude mcp add` defaults to `--scope local` (verified against `claude mcp add --help`), so the CLI route leaves the working tree clean. The JSON snippet was also incomplete: the value without the `mcpServers` key or a server name.
2. The new bullet duplicated the pre-existing "React-Teilnehmer: `nx storybook react` parallel + `get-storybook-story-instructions`" bullet three lines below it. Merged; the "Pflicht vor jedem `*.stories.*` Edit" obligation survives in the merged bullet.

Neither defect was visible to `check:docs` or `check:docs-layout`, which both returned 0 on the flawed version. The gates check the page's shape, not whether it contradicts itself.

**Verification of the final state:**

| Check | Result |
|---|---|
| `npm run check:all` (34 gates) | exit **0** |
| `npx nx build docs` | exit **0** |
| Rendered `dist/docs/schulung/index.html` | all four new passages present; `<lib>` correctly escaped to `&lt;lib&gt;`; quote convention (`„…"`, U+0022 closer) matches the page's existing usage |

Still open: M1–M4 and n1–n4 from this review. n1 (`/claude-design` says 29 gates, `check:all` chains 34) is a two-token fix in two places and should not wait.

---

## 7. Second fix round (2026-09-05)

M1–M4 and n2–n4 closed. `tasks/todo.md`-level summary: the page no longer asserts anything it cannot back.

- **M1a** — Day 1 Block 04 now says step 5 is idea, not demonstration: no demo, no artefact, tooling absent, blocked on the per-seat test. `/claude-design` carries the same statement as a callout naming where the specification lives. **The reviewer's proposed fix was rejected.** It suggested writing Kata 5 up as prose with a screenshot; I searched first and found no `seed-canvas.mjs`, no `payload.template.html` and no `.dc.html` anywhere outside `node_modules`. Publishing a how-to for tooling this repo does not contain, behind an access path nobody has verified, would have been the same defect class the review exists to remove.
- **M1b** — Day 2 Block 01 closes with a written handoff document; Block 02 prompts from it. Recorded as [ADR-0096](../plan/adr/0096-the-handoff-a-picture-cannot-carry.md), which also states what was rejected: a machine-readable schema (it would let participants fill fields instead of making decisions) and a Figma extractor (the behaviour it must carry is precisely what Figma does not hold).
- **M2** — Block 05 is now the Settings Card composition `/tutorial` actually teaches; the invented `Button-Tone` is gone. Side effect worth noting: the buffer kata bullet ("dieselbe Settings / Card-Frame als zweite Runde auf Zeit") only makes sense now — it had been sitting beside a different exercise.
- **M3** — ~5 min inside the existing Block 04 MCP demo: one Angular/Vue query with `libs/spec/src/index.ts` open beside it, naming ADR-0083's mapping once.
- **M4** — a deliberate-mismatch exercise in Block 04, and Erfolgs-Verifizierung item 7 no longer lets a clean report stand as proof on its own.
- **n2** — `/troubleshooting` in both `risk: true` blocks. **n3** — HelpFooter now says fourteen, not eight. **n4** — `09:00–17:30 (6 h 50 min netto)`, and the plural "kleine Mikro-Pausen" replaced by the single 10-min buffer that actually exists.

**One defect caught in review, again by reading the diff rather than by a gate.** The M4 bullet listed the `codeSpec` fields as `visual, spacing, typography, tokens, api, a11y, metadata`. The schema in `skills/figma-workspace-architect/references/code-sync.md` defines `componentAPI` and `accessibility`; `api` and `a11y` do not exist. That is the same failure as the `Button-Tone` defect being fixed three bullets above it — a plausible identifier the source does not contain — and it would have broken the exercise outright, since the bullet's whole point is that the participant compares the page's field list against what they actually submitted. Corrected before commit.

Twice now in this session a fix round introduced a defect that every gate passed and only diff-reading caught. Both were factual claims about things outside the file being edited: a tracked `.mcp.json`, and a schema in a skill reference. The gates check the page's shape; nothing checks whether its sentences are true.

**Verification of the final state:** `npm run check:all` (34 gates) exit **0**; `npx nx build docs` exit **0**; `npm run check:adr-refs` exit **0**; all seven passages confirmed present in the rendered `dist/docs/schulung/index.html` and `dist/docs/claude-design/index.html`.

Still unverified, and unchanged by this round: nothing here is workshop-verified. No dry run, no live MCP call against a running local Storybook, no Figma action.
