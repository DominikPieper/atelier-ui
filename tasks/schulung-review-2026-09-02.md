# Training Material Review — Second Pass, the Claude Design Track, and the Trainer Kit

**Date:** 2026-09-02 · **Baseline:** `tasks/schulung-review-2026-08-28.md` (all 4 blockers / 15 majors / 16 minors closed 08-29; p1, p2, n5, n14, n15, r4, r6, r12, r13 still open — not re-listed here unless regressed) · **Inputs:** four read-only audits (Claude Design depth · Day-1 track re-audit · Day-2 build-your-own flow · trainer kit + public/private boundary) + own spot-verification of every HIGH claim (§9) · **Environment under review:** the cloned repo, which ADR-0084 makes canonical for the cohort.

The four questions asked: What can be improved? Where are the gaps? Is the Claude Design part detailed enough? What does the facilitator need that should not go on the public site?

---

## 1. Verdict

The 08-29 repair made the material *internally* consistent and left it *externally* wrong in one place that touches every hands-on block: **the material describes the scaffold, the cohort runs the clone.** Every page, the agenda, `CLAUDE.md` and preflight say Storybook is on `localhost:6006`; the clone serves it on `4400/4401/4402` and the docs app on `4300`. On top of that, one library drift (`AtlInput.label` exists in React/Vue, not in the spec or Angular) means the tutorial's own OUTPUT samples will not compile for an Angular cohort, and the Day-2 gate story ("preflight stays green") is vacuous — preflight never reads component code, while `check:all` is guaranteed red for any single-framework addition and no page says so.

The Claude Design track is **not detailed enough — for either audience.** `/claude-design` is a strong *explanation* (why the fence exists, what the palette gate can and cannot see) with no *how-to*: no artboard image, no prompt→canvas pair, no worked Step-5 handoff, and three numbers already stale after four days. The trainer's only run-of-show is one agenda cell in which 5 of 8 steps name *what* but not *how* (which product, which login, which prompt, which file to hardcode, where the fallback URL is). Participants get a 12-minute demo they cannot follow on their own machine, and the katas that would change that stay blocked on the untested per-seat question.

The trainer kit is **mostly unwritten** and what exists sits in a **public repo** — including two `tasks/` files that name colleagues and an internal mailbox, a root agenda that admits "kein Dry-Run", and a slide outline that promises `solved-*` branches that do not exist.

**Counts: 4 blockers · 1 immediate · 13 major · 15 minor.**

---

## 2. Answers to the four questions

| Question | Short answer |
|---|---|
| Improve? | Fix the clone/scaffold split first (ports, kata prompt, quickstart), then the Day-2 gate story (sync step, expected reds, real acceptance), then the brief/union mismatch. §3. |
| Gaps? | Block 05 exercise has no page; no clone quickstart; no local addon-mcp snippet; no authoring prompts for Day 2; nine predicted Day-1 failures with no troubleshooting entry; participant essentials (prerequisites box, hardware, accounts/cost, group size, privacy notice, LICENSE) missing from the public page. §4. |
| Claude Design detailed enough? | **No.** Page = explanation without how-to; agenda cell = run-of-show without procedure; katas blocked. Concrete list in §5. |
| Trainer needs, off the public site? | A run-sheet per block, demo scripts with exact prompts, golden-prompt and error→fix cards, `solved-*` branches, pre-workshop mail, per-seat Claude Design test result, timing log, feedback form — in a **private `atelier-trainer` repo pinned to an atelier SHA**, and the current trainer-internal lines moved out of `schulung.astro`, the root agenda and `tasks/`. §6–§7. |

---

## 3. Findings

Severity: **Blocker** = a participant following the page cannot reach the block's checkpoint · **Major** = wrong, misleading or missing in a way that costs the room ≥15 min or the trainer a fallback · **Minor** = wrong but cheap and local. *Serves* names who benefits (P participant · T trainer · R repo).

### 3.0 Immediate (not a training defect — a public-repo hygiene defect)

| # | Finding | Evidence | Fix | Serves |
|---|---|---|---|---|
| I1 | Two tracked files in the PUBLIC repo carry two colleagues' full names and the internal data-protection mailbox. | `tasks/review-state-2026-08-26.md:168`, `tasks/schulung-review-2026-08-28.md:64`; `gh repo view` → `visibility: PUBLIC`. ADR-0032 already uses the role-only phrasing. | Rewrite both lines to roles ("the internal DSB / ISB"); keep names and mailbox in the trainer kit. | R |

### 3.1 Blockers

| # | Finding | Evidence | Fix | Serves |
|---|---|---|---|---|
| B1 | **Storybook/docs ports are the scaffold's, not the clone's — everywhere.** Clone: `--port 4400/4401/4402` (`libs/{angular,react,vue}/project.json`), docs `astro dev --port 4300` (`docs/project.json:21`). Material: `localhost:6006` in `tutorial.astro:547`, `first-component.astro:199`, `troubleshooting.astro:129,145`, `storybook.astro:225-231`, `schulung.astro:186`, `schulung-2tage-agenda.md:31,33,58,83`, `CLAUDE.md:53`, ADR-0084:67; `preflight.mjs:361` checks `[4200, 6006]`. `git grep 440[0-2] docs/src` → no hits. | Verified: `nx show project react --json` → `npx storybook dev … --port 4401`. | One sweep: every clone branch says "read the port from the terminal; the clone uses 4400/4401/4402, docs 4300"; local MCP URL `http://localhost:440x/mcp`; preflight checks clone ports when run inside the clone (it can detect `nx.json`); `troubleshooting` `port-in-use` renamed and extended. Add a `check:docs` rule that greps pages for `6006` outside the scaffold branch. | P T |
| B2 | **`AtlInput.label` drift breaks the Angular tutorial/kata path.** React `atl-input.tsx:35` and Vue `atl-input.vue:17` have `label?: string`; `AtlInputSpec` (`libs/spec/src/index.ts:126-129`) and Angular `atl-input.ts` (inputs: value, type, placeholder, disabled, readonly, invalid, errors, touched, required, name) do not. Hosted `storybook-angular` MCP (React manifest, ADR-0083) advertises `label` + `WithLabel` story. Tutorial OUTPUT samples `tutorial.astro:72-73` show `<atl-input label="Name" />`; kata acceptance "two labelled inputs". `check:sync` is dir-level (`check-sync.js:49-63`) and cannot see it. | Verified by reading all three adapters + spec. Angular compile behaviour (NG8002 vs silently dropped attribute) *assumed*, not built. | Decide once: add `label?: string` to `AtlInputSpec` + Angular (the tutorial already assumes it) **or** drop it from React/Vue and rewrite the samples. Then a gate: prop-name parity across the three adapters against the spec (the gap `check:sync` leaves). | P R |
| B3 | **Day-2 gate story is wrong in three linked places.** (a) Components import `'../spec'` = `libs/<fw>/src/lib/spec.ts`, AUTO-GENERATED by `tools/scripts/sync-spec.mjs`; a new `AtlTagChipSpec` is invisible until `npm run sync:generated` — no page, brief, agenda cell or prompt names the step. (b) Erfolgs-Verifizierung item 2 "preflight weiter grün" (`agenda:94`, `schulung.astro`) cannot fail: `preflight.mjs:381-395` checks node/npm/git/claude/figma/MCP/ports only. Slide "Drift erkennen — Tool: `npm run preflight`" (`agenda:243`) is false. (c) `check:all` is guaranteed red for a single-framework component: `check:sync [DRIFT]` (dir missing in two libs), `check:spec`, `check:metadata [MISSING-REGISTRY]` for any exported `Atl*Spec`, `check:a11y-parity [ROSTER]`, `check:exports`, `check:story-descriptions` — nobody warns the room. The pre-push hook that runs `check:all` (`tools/git-hooks/pre-push:75`) is installed only by `install-hooks.sh`, which no setup page mentions. | Verified: `spec.ts` header; `check:all` = 30 gates; preflight `main()`. | Rewrite Day-2 Block 03–05 and Erfolgs item 2: "after the spec: `npm run sync:generated`"; replace item 2 with a scoped, passable set (`check:spec`, `check:exports`, `check:tokens`, `check:css-tokens`, `nx test <lib>`) and state plainly that `check:sync`/`check:metadata`/`check:a11y-parity` go red by design in a one-framework build — that *is* the drift lesson. Trainer slide: "Drift erkennen — `npm run check:sync`", not preflight. | P T |
| B4 | **Briefs use severity `error`; the code union and tokens say `danger`.** `toast.md:51,67,151,153`, `tagchip.md:54` ("the same one the CSS contract maps to token pairs" — false for `error`). Unions: `AtlToastVariant`/`AtlBadgeVariant`/`AtlAlertVariant` = `… 'danger' …` (`index.ts:36,213,297`). Tokens: `--ui-color-danger{,-bg,-text,-hover,-active}` exist; only `--ui-color-error-text` exists on the `error` side. README Done-when #1 demands the axis be "named exactly as the code union" → a participant following the brief fails the brief. | Verified by grep on briefs, spec, `libs/angular/src/styles/tokens.css`. | `error` → `danger` in Toast and TagChip briefs (and the `role="alert"` sentence); one line in README explaining `--ui-color-error-text` is the field-validation token, not a severity. | P |

### 3.2 Major

| # | Finding | Evidence | Fix | Serves |
|---|---|---|---|---|
| M1 | `/claude-design` numbers stale after 4 days: "check:all · 29 gates" (`:196,:209`) → 30; "twenty-four tags" (`:304`) → 25 emitted + 3 ratcheted = 28 and moving (5 commits to `check-figma.js` since); "Seventeen decision records … thirteen name an artboard" (`:497-498`) → 16/12 (ADR-0053 is an npm-peer/CI incident, not a redesign record). "Every gate in check:all is keyed on one of exactly four identities" (`:249`) is rhetorical — `check:adr-refs`, `check:llms`, `check:cookbook`, `check:docs` are not. | Verified: `package.json`, ADR `sources`. | Generate the gate count from `package.json` like other generated facts; make the tag count non-numeric or generated; recount ADRs; soften `:249` to "every gate that looks at a component". | P R |
| M2 | Claude Design **trainer run-of-show**: 5 of 8 steps have no procedure. Unstated: which product (Claude Code `/design` skill writing local `.dc.html` vs. the claude.ai/design *Atelier* project where the 31 fallbacks and `_sheet.css` live — the page itself says these differ, `:160-176`); `/design-login` + `/design consent` sequence (this session's `claude-design` MCP failed with `FIRST_PARTY_AUTH_REJECTED … run /design-login` — the exact trap at 14:30); the paste-ready three-directions prompt (none exists — `tasks/claude-design-prompt.md` is a landing-page prompt, `atelier-design/SKILL.md` has no `/design` recipe, Kata 1's text is four directions without palette seeding); which file/editor "hardcode a colour" means; which of 48 palette values to flip; the fallback project URL lives only in `artboards.json` meta, not in the agenda. No dry-run (`agenda:31`). | Verified by reading agenda:31,84, `claude-design-prompt.md`, SKILL.md, `gen-artboard-palette.mjs:28-35`. | A one-page trainer run-sheet (kit, §6): product choice, login steps, the prompt with the `:root` block pasted into `<helmet><style>`, "one severity across three directions", file+line to hardcode, value to flip, `git checkout` line, fallback URL + artboard names, expected timings after one rehearsal. | T |
| M3 | Claude Design **participant depth**: no `<img>`, screenshot or prompt→canvas pair anywhere on `/claude-design` (only two architecture SVGs); `.dc.html` explained in one sentence (`:166-168`); Step-5 handoff asserted (`:183-190`, diagram label `:233`) but the worked example (Kata 5's Handoff Card) is not on the page; assumes `check:figma` tags, `check:parity` records, `tokens.manifest.ts`, `/design-sync`, ts-morph, ADR numbers without titles — none of which the room has met by Tag 1 Block 04 (the agenda says so itself). | Read `claude-design.astro:1-634`. | Add: a 5-line "What you saw in the demo" opener; one captured image of the three Toast directions; the Kata-5 handoff as prose (variant sheet + dark twin + keyboard map, and the "dark mode is a hand-duplicated artboard" cost); a glossary strip linking `check:figma`/`check:parity`/ADR titles. | P |
| M4 | Kata prompt is scaffold-shaped and the clone correction lands one step late. `first-component.astro:48-62` hardcodes `workshop-angular/src/app/components/settings-card.component.ts` "copy verbatim"; clone note only in Step 4 (`:194-202`); Step 2 "framework you scaffolded", Step 5 "Nx welcome page?" scaffold-only; no `*.stories.ts` in the clone branch → invisible in Storybook (`libs/angular/.storybook/main.ts:7`) and `check:sync [NO-STORY]`. | Read. | Make the clone the default branch of the kata (ADR-0084), scaffold the alternate; prompt names `libs/<fw>/src/lib/settings-card/` + a story file + barrel export. | P |
| M5 | **Tag 1 Block 05 exercise has no page.** Agenda: "ändern eine vorhandene Komponente (z.B. neuer Button-Tone)". In the clone that touches `libs/spec` union + adapter + story + `check:sync`/`check:docs` + Figma variant axis. No guide, no acceptance criterion, no "which gates go red and why". | `agenda:33`, `schulung.astro` Block 05. | A short `/first-change` page or a section in `/first-component`: the change, the four files, the two gates that must stay green, the one that goes red until Figma follows. | P T |
| M6 | No **clone-first quickstart** and no **local addon-mcp `.mcp.json` snippet**. Setup lives in a callout inside the scaffold page (`workshop.astro:~108-127`); "Preview im Chat (lokal)" (Block 04) and the Day-2 React test loop are unreachable from any page; the promised snippet (`agenda:83`) would today be written against a dead port (B1). | Read. | One page: clone → `npm ci` → `npm run preflight` → `nx serve docs` (4300) → `nx storybook <fw>` (440x) with expected terminal output; a committed `.mcp.local.example.json` with the three local URLs. | P T |
| M7 | Starter frames are described as bound to "UI-Tokens-Variablen" (`schulung.astro:157`, `agenda:54`); the collection is `Library Tokens` (`workshop/briefs/README.md:36,43,69`; `plan/figma.md:42-44`: `UI Tokens` renamed `Docs Brand Tokens`). A Figma novice looks for the wrong collection. | Verified. | "…an Variablen der `Library Tokens`-Collection (die `--ui-*`-Schicht) gebunden". Related open item r4 (Figma Instructions node `703:333`). | P |
| M8 | Day-2 templates drag per-component infrastructure: stories import `@atelier-ui/spec/metadata/<x>.metadata` (`atl-badge.stories.tsx:4,22`) — copied for a new component → load error or hardcoded string; `*.a11y.spec.tsx` reads a committed snapshot (`atl-badge.a11y.spec.tsx:15,37`) → ENOENT, `nx test` red (Erfolgs item 4). `.claude/agents/component-trinity.md:3` triggers "PROACTIVELY" on "add a Foo component" → three-framework build in a one-framework block. `run-story-tests` needs Playwright Chromium (`libs/react/vitest.storybook.config.ts:18-23`), not installed by `npm install`, not checked by preflight, not in any mail. `a11y.test: 'todo'` (`preview.tsx:14-18`) → green ≠ a11y clean. | Read (agent C); component-trinity trigger *assumed* to fire. | Day-2 prompt template states "one framework, no metadata import, no a11y snapshot spec"; disable/trim `component-trinity` for cohort clones or mention it; add `npx playwright install chromium` to setup + preflight; tell the room what `a11y: todo` means. | P T |
| M9 | `prompts.astro` is eight **consumer** prompts (login form, dashboard, wizard…) and says "use these after the workshop"; the agenda cites it as Tag-2 Block 02/03 material (`agenda:57,105`). No authoring prompts exist for: spec interface from brief, story generation, implementation with token fidelity, fixing a11y findings, dark-mode support, paste-the-error. "golden" occurs only in agenda/schulung prose. | Grep. | Six authoring prompts on a `/prompts#authoring` section (public, participants need them) — the golden-prompt *cheat sheet* with trainer notes goes to the kit. | P T |
| M10 | Erfolgs-Verifizierung defects beyond B3: item 5 "ohne axe-core-Findings" (`schulung.astro:341`) vs "keine kritischen" (`agenda:97`); item 6 names `prefers-color-scheme` (`agenda:98`) while Storybook toggles via the `backgrounds` global → `data-theme` decorator (`preview.tsx:6-10,33-39`) and the agenda itself teaches "nicht nur via prefers-color-scheme" (`:60`); item 4 for React at risk (B1 + Playwright); item 7 (`figma_check_design_parity` on own node) last in sequence with the most tooling hops and no shown `codeSpec` shape. | Read. | One canonical list in one file (astro renders it; agenda links it); item 6 → "`data-theme="dark"` toggle in Storybook *and* the `prefers-color-scheme` media query in tokens"; item 7 gets an example call. | P T |
| M11 | **Trainer-internal content on the public page**, participant essentials missing (details §7). Internal: `schulung.astro:96` credential-class remark, `:97-98` the full fence script incl. "Erwartete Antwort: keine", `:99` Gegenmittel/Fallback/`git checkout`, `:57` "Kohorten-Policy"; `agenda:31` minute arithmetic + "kein Dry-Run". Missing for a prospect: one prerequisites box (today split `:281-283` vs `:54-59`), hardware/OS, accounts + who pays + budget/seat, Figma plan tier, group size, privacy notice, what they keep — `package.json:4` says MIT, **no `LICENSE` file is tracked**. | Verified (`git ls-files | grep -i licen` → empty). | Trim the page to curriculum + prerequisites; move contingency text to the kit; add `LICENSE`. | P T R |
| M12 | Slide outline promises `git checkout solved-<name>` (`agenda:208`) and the gap table a backup workspace (`agenda:81`); `git branch -a` → no `solved-*`. | Verified. | Build four `solved-<component>` branches for the cohort's framework (M effort) or delete the promise. | T |
| M13 | Troubleshooting has no entry for nine predicted Day-1 failures: Storybook not on 6006 / EADDRINUSE 4300–4402; `claude` installed but not logged in (preflight only runs `claude --version`, `preflight.mjs:268`); MCP project-server approval declined at first start; Figma opened in browser, plugin run in the wrong file (`figma-token.astro` never says "open the Atelier UI file in Desktop first"); viewer-only account, no "Duplicate to your drafts"; Angular `label` error (B2); gate failure after a change (open n5); Windows stdio `npx` servers needing `cmd /c` (*assumed* from Claude Code docs); `figma_check_design_parity` "nodeId required / codeSpec invalid". | Agent B table. | Nine entries; the port and gate ones first. | P T |

### 3.3 Minor

| # | Finding | Evidence | Fix |
|---|---|---|---|
| n1 | "7–8 h netto" (`schulung.astro:236,281`, `agenda:13`); block sums are 410 min = 6 h 50 per day. | Computed from the `time:` fields. | "~7 h netto" or "6 h 50". |
| n2 | Mirror: `schulung.astro:83` "Atelier lässt den Docgen aus — Prop-Tabellen kommen weiter aus react-docgen" vs `agenda:29` "ersetzt react-docgen" with no Atelier caveat. | Verified. | Add the caveat to the agenda cell. |
| n3 | `preflight.mjs:183-192` `portFree` binds `127.0.0.1` only; reported "Bridge 9223–9232 — all free" while node held `[::1]:9223-9227`. | Observed via `lsof` (agent B). | Probe `::1` too. |
| n4 | Tutorial Step A (`tutorial.astro:425`) links the file root without `node-id=936-2954` or the page name; compare-card prompt hardcodes `storybook-react` (`:237`); workshop checkpoint "every framework's app serves on 4200" (`workshop.astro:~410`) has no clone branch; troubleshooting port fix suggests `--port 4300` (`troubleshooting.astro:151`) = the clone's docs port. | Read. | Node-id + page name; `storybook-{fw}`; clone branch; pick 4301. |
| n5 | `${FIGMA_ACCESS_TOKEN}` in `figma-token.astro` Option A and `troubleshooting.astro:~163` vs repo `.mcp.json` `${FIGMA_ACCESS_TOKEN:-}` — the page's form breaks default-empty for token-less participants (which the page calls optional). | Read. | Use `:-` form. |
| n6 | `HelpFooter.astro` "Eight common failure modes" — 14 entries. | Count. | Compute or drop the number. |
| n7 | `storybook.astro:~107-116` local `docs` toolset "All frameworks" vs `CLAUDE.md` React-only manifest in 10.5. | Read. | "React (components) · all (MDX docs)". |
| n8 | `.mcp.json` servers `angular-cli`, `Astro docs` appear on no participant page although Block 01 reads `.mcp.json` together. | Grep. | One row each in `/mcp`. |
| n9 | `claude-md.astro:189-215` "copy the CLAUDE.md content into a file at your project root" — the clone already has it. | Read. | Clone note. |
| n10 | Brief staleness "116–117 days" (`briefs/README.md`) is 120–122 today and drifts daily; `tasks/todo.md:1880-1882` still says briefs are untracked — they are tracked. | `git ls-files`. | Date instead of day-count; fix todo. |
| n11 | `tools/design/artboards.json:6-8` carries the claude.ai/design project id + URL + design-system id. Auth-gated, low risk, no public purpose. | Read. | Optional: keep `redesignPhase` (read by `check:parity`), move `projects` to the kit. |
| n12 | Kata 3 gate leg cannot execute (`figma-snapshot.mjs` hardcodes the Atelier key; `check-figma.js` compares against the spec roster); Kata 4's Block-04 slot was consumed by the three-directions demo. `review-state:171-266`. | Agent A. | Rewrite Kata 3 step 5; decide Kata 4 (cut or Tag 2 Block 05). |
| n13 | Slide `agenda:169` "Access-Token optional" vs both Block-01 texts "wird als Kohorten-Policy trotzdem gesetzt". | Read. | Align. |
| n14 | Agenda-only teaching content absent from `schulung.astro`: Nachzügler track (`:25`), MCP-role rule + file-scope reason (`:54`), get-changed-stories ~5 min / Debugging ~10 min / "Typische Fehler" (`:58`), "zwei Briefs, zwei Kompositionen" (`:53`). Astro is otherwise a strict subset. | Diff. | Decide per line: public or kit. |
| n15 | `/claude-design:127` "/design appears in no Claude Code CHANGELOG" is a dated external claim (ADR-0032, 08-26) that will rot silently. | Read. | Date it in the sentence or drop it. |

---

## 4. Gaps (missing, not wrong)

1. **Block 05 exercise page** (M5) — the only Tag-1 hands-on beyond the tutorial has no artifact.
2. **Clone quickstart + local MCP snippet** (M6).
3. **Authoring prompts for Day 2** (M9).
4. **Per-block "what to have open"** (terminal · Figma Desktop file · Storybook tab · docs tab) — nowhere.
5. **How to ask Claude when stuck** — HelpFooter routes to troubleshooting/GitHub; no "paste the error + `.mcp.json` context" pattern.
6. **Angular/Vue MCP reading rule** ("the reply is React-shaped; `libs/spec` settles bindings") exists only in `CLAUDE.md`, never on a participant page.
7. **Framework choice** — Block 05 says "gewähltes Framework"; no page says how or when the cohort's framework is fixed (ADR-0084 says one per workshop).
8. **Participant essentials on the public page** (M11): prerequisites box, hardware/OS incl. Windows, accounts + cost, Figma plan tier for Duplicate-to-drafts + dev-plugin import, group size, language, privacy notice (prompts go to Anthropic; Figma duplicates hold what data), LICENSE.
9. **Claude Design**: image, prompt, handoff example, opener, glossary (M3); run-sheet (M2); per-seat test (§5).
10. **Dry-run data** — still none for any block; Tag 2 Block 01's 90 min and the 12-min demo are both untimed.

---

## 5. The Claude Design track — is it detailed enough?

**No.** Three audiences, three verdicts:

| Audience | Has | Lacks | Fix |
|---|---|---|---|
| Participant, on the page | Why the fence exists; what the palette gate sees (`tokens.css → artboard-palette.css → _sheet.css → 31 × .dc.html`); honest limits; governance routing. | Anything that looks like what they saw in the demo: no artboard image, no prompt, no `.dc.html` explained in learner terms, no Step-5 handoff example, no "what to do with this at home". Prerequisite load (check:figma tags, parity records, ADR numbers) is the maintainer's, not the room's. | M3 |
| Participant, hands-on | Nothing, by design (`agenda:84`: "Teilnehmer können nicht mitmachen, und das muss im ersten Satz gesagt werden"). Five katas drafted (`review-state:171-266`); Katas 2 and 5 half-unblocked by the starter palette (ADR-0072). | The **widened per-seat test** — never run. Kata 3's gate leg cannot execute as written; Kata 4 lost its slot. | Run the test (below); then decide katas per result. |
| Trainer | The concept, the fence script, the gate commands, 31 fallback artboards, the gap-table prep line (`agenda:84`). | Product choice, login sequence, the prompt, the hardcode target, the flip value, the fallback URL in the agenda, any timing. | M2 |

**The per-seat test, stated once so it can be run:** provision two seats exactly as the cohort will be — Claude Code CLI on a fresh machine/user (a) with the cohort credential, (b) with a claude.ai Pro/Team login. On each run Kata 1 verbatim with the Toast brief and record: (1) does `/design` load; (2) are `.dc.html` + `canvas.json` written; (3) does the Artifact publish; (4) does the published page open in editor mode with Save, or view-and-export only; (5) does a Save on seat A appear on seat B. Pass for Katas 1/2/5 as written = (1)–(3) on both seats; pass for any "edit it in the canvas" sentence = (4). Fail on (1) with the API-key seat settles the credential-class question and moves the katas to "requires claude.ai seats" in the pre-workshop mail. Effort S; everything else in this section waits on it.

What is *right* about the track and should stay: the parallel-track framing (step 0 and step 5 only, ADR-0032), the fence as four identities an artboard has none of, the palette gate honesty ("only the generated sheet, never a `.dc.html`"), the manifest-defect review as the argument against `/design-sync` for participants, the governance callout.

---

## 6. Trainer kit — what exists, what is missing, where it lives

### 6.1 Inventory

| Material | State | Where | Note |
|---|---|---|---|
| Curriculum page | exists | `schulung.astro` (public) | Two audiences in one page — SEO description is marketing, callout says "for instructors" |
| Trainer agenda (Quellen, Zeitdeckung, Gegenmittel) | exists | repo root, public | `review-state:164` calls it "client-facing"; audience never settled |
| Slide outline | partial | `agenda:120-267`, 3 of 13 blocks | no deck |
| Component briefs | exists, tracked | `workshop/briefs/` | good; B4 + n10 |
| Material-gap table | exists | `agenda:73-85` | its own list is still 7/8 open |
| Fallback plans | partial | only Drei Richtungen + the `solved-*` promise | — |
| Demo scripts (Kickoff cross-framework change, Negativ-Demo, Drei Richtungen, get-changed-stories, a11y three-step) | missing | one sentence each in the agenda | — |
| Golden prompts / Spickzettel | missing | — | M9 |
| `solved-*` branches | missing | — | M12 |
| Pre-workshop mail / setup PDF | missing | — | needs p1/p2 screenshots |
| Feedback form, certificate, follow-up mail | missing | — | `agenda:267` links a form that does not exist |
| Dry-run / timing data | none | — | `agenda:31` says so |
| Claude Design katas | written, blocked | `review-state:171-266` | §5 |
| Claude Design trainer prep | partial | `agenda:84` | M2 |
| Local MCP snippet | missing | — | M6, must use 440x |
| Retro / lessons | none | `tasks/lessons.md` has zero workshop entries | — |

### 6.2 Checklist (S < 2 h · M ½–1 day · L > 1 day)

**(a) Pre-workshop** — participant mail with step-by-step + screenshots, clone route (L; blocked on p1/p2 captures) · provisioning: API key vs Claude Code seat, payer, budget/seat, rate-limit expectation for 10 seats on hosted MCP + Figma (M) · Figma seat type verified for Duplicate-to-drafts + Desktop + dev-plugin import (S) · Claude Design trainer account + `/design consent` + per-seat test (M) · hardware/OS matrix incl. Windows/WSL (S) · network checklist: claude.ai, api.anthropic.com, atelier.pieper.io, figma.com, uianatomy.dev, localhost 4300/440x (S) · privacy notice + org AI-tool policy check, routed through the internal DSB/ISB (S) · `npx playwright install chromium` in setup (S) · local `.mcp.json` snippet (S).

**(b) Run-of-show** — minute-level per block: trainer action / participant action / trainer screen / checkpoint / fallback (L) · rules of the form "if 30 % are red at 10:15, do X" (M) · Nachzügler track content for Tag 1 Block 01 (S).

**(c) Demo scripts** — Kickoff 5-min cross-framework change: exact prompt, expected diff, pre-warmed repo (M) · Negativ-Demo: exact question + screenshot of the hallucination (S) · Drei Richtungen run-sheet (M2) (S) · get-changed-stories micro demo (S) · a11y three-step on a deliberately broken component (M).

**(d) Cheat sheets** — golden prompts per block with trainer notes (M) · error→fix table incl. the n5 gate-failure entry (M) · MCP tool-name card: hosted 3 / dev 3+2 / test 1 (S) · framework paths card: `libs/<fw>/src/lib/…`, ports 4300/440x, `nx test <lib>`, `sync:generated` (S).

**(e) Backup assets** — `solved-*` branches for the cohort framework (M) · three pre-generated Toast directions (S; 31 fallbacks exist) · screenshots of every expected screen (M) · recorded tutorial video for when live fails (M).

**(f) Assessment / closing** — Erfolgs-Verifizierung as printable per-participant checklist, corrected per B3/M10 (S) · feedback form (S) · certificate template (S) · follow-up mail + "what you keep" (needs LICENSE) (S).

**(g) Post-cohort** — retro template (S) · timing log per block replacing "kein Dry-Run" (S, fill during cohort 1) · workshop section in `tasks/lessons.md` (S).

### 6.3 Where it lives — recommendation

Mini-ADR (decision is the trainer's; this is the recommendation):

- **Context.** The repo and docs site are public. The kit is ~80 % paths, commands, node ids and ports that change with the repo (ADR-0084 churn), plus ~20 % that must not be public: credentials/budgets, colleagues' names, unrehearsed-timing admissions, contingency scripts.
- **Options.** (1) private `atelier-trainer` git repo pinned to an atelier SHA; (2) gitignored folder in the clone; (3) keep in `tasks/`; (4) Notion/Drive.
- **Choice.** (1).
- **Why.** (2) has no history and vanishes on every fresh clone the drift reviews run in; (3) is the leak class I1 already found; (4) drifts from paths the repo renames weekly and cannot be gated.
- **Tradeoff.** Two repos to keep in step — mitigated by pinning the SHA in the kit's README and re-checking it in the same review cadence as `check:docs`.

**Moves:** `schulung-2tage-agenda.md` (Quellen column, Zeitdeckung, Gegenmittel, gap table, slide outline, run-of-show) → kit; the two `tasks/` lines (I1) → roles here, names in the kit; `artboards.json` `projects` block → kit (optional, n11). **Stays public:** `schulung.astro` trimmed to curriculum + prerequisites; briefs (participants need them; add LICENSE); ADRs; dated review files (this one included — it contains no personal data).

---

## 7. Public/private boundary — concrete lines

| Line | Why internal | Where to |
|---|---|---|
| `schulung.astro:96` "nur Trainer-Maschine — claude.ai/design braucht ein anderes Login als der Kohorten-API-Key" | credential provisioning | kit; public keeps "Trainer-Demo" |
| `schulung.astro:97-98` full fence script incl. "Erwartete Antwort: keine" | hands participants the checkpoint answer | kit; public keeps "Zaun-Demo + Checkpoint-Frage" |
| `schulung.astro:99` "Gegenmittel … Kaffeepause … Fallback … git checkout" | contingency plan | kit |
| `schulung.astro:57`, `agenda:25` "Kohorten-Policy" | policy framing, not requirement | rewrite as requirement |
| `agenda:31` "Zeitdeckung … −5/−4/−3 min … kein Dry-Run … erste Kohorte mitstoppen" | minute arithmetic + admission of no rehearsal, in a public root file | kit |
| `agenda:81,208` `solved-*` | promise without artifact | build or delete |
| `tasks/review-state-2026-08-26.md:168`, `tasks/schulung-review-2026-08-28.md:64` | colleagues' names + internal mailbox | roles here, names in kit (I1) |
| `tools/design/artboards.json:6-8` | internal project ids/URL | optional move (n11) |

**Missing on the public page for a prospect/participant:** one "Voraussetzungen / Mitbringen" box · hardware/OS · accounts, who pays, budget · Figma plan tier · group size and trainer:participant ratio · what they keep + LICENSE · privacy notice · booking/contact beyond the generic footer. Present and fine: target group, language, day results, format callout, Erfolgs-Verifizierung (once corrected).

---

## 8. What is good (keep)

- The **parallel-track framing** of Claude Design and the fence argument are the best-written part of the whole material; the limits section is honest.
- **Briefs**: identical six-section structure; exact 2×2 matrices with explicit out-of-scope; every Figma variable named exists in `tools/figma/snapshot.json`; starter frame node ids (`703:341/348/352/355`) verified and now guarded by `check-docs-sync.js [NODE-ID]`; uianatomy ids valid (confirmed via `list_components`).
- **Gates green where they claim to be**: `check:docs`, `check:llms`, `check:sync` (31 components), preflight "14 ok" on the maintainer machine; `check:artboard-palette` "48 value(s)" and `check:design-status` "29 of 29" match the page.
- Agenda's **Quellen column** and the gap table — the agenda already knows most of what it lacks.
- Single-framework framing (memory: one framework per workshop) is applied consistently on the page level.
- Tooling claims that hold: addon-a11y in all three; `backgrounds` → `data-theme` decorator in all three previews; addon-vitest on React; addon-mcp started by `nx storybook react` (`react/main.ts:12`); `figma_audit_component_accessibility` / `figma_scan_code_accessibility` exist; `nx test <lib> --watch` forwards to vitest (ran it).

---

## 9. Verified vs assumed

**Verified in this session (own commands or read):** `gh repo view` → PUBLIC · no `solved-*` branch · `check:all` = 30 gates (`package.json` split) · `claude-design.astro:196,209` "29 gates" · ports via `libs/react/project.json:68` + `nx show project react --json` and `docs/project.json:21` · `git grep 6006` hit list · `libs/react/src/lib/spec.ts` AUTO-GENERATED header · `preflight.mjs:375-400` check list · `AtlInputSpec` (`index.ts:126-129`), Angular `atl-input.ts` input list (no `label`), React `:35` / Vue `:17` `label` · tutorial `:72-73` `label=` samples · briefs `error` lines, unions `danger` (`index.ts:36,213,297`), tokens `--ui-color-danger*` + lone `--ui-color-error-text` · DSB/ISB names + mailbox at the two cited lines · no LICENSE tracked, `package.json:4` MIT · `Library Tokens` naming (`plan/figma.md:40-46`, `briefs/README.md:36,43,47,69,97`) vs "UI-Tokens-Variablen" (`schulung.astro:157`, `agenda:54`) · block sums 410 min/day · docgen lines `schulung.astro:83` / `agenda:29`.

**Verified by the audits (read/ran, not re-run by me):** `check:artboard-palette` 48, `check:design-status` 29/29, check:figma emitter count 25+3, ADR-0041..0057 sources, DEFECT quotes, hosted `storybook-angular` returning `label`, `lsof` IPv6 bridge ports, `check:docs`/`check:llms`/`check:sync` exit 0, preflight 14 ok, Figma snapshot node ids and variable names, uianatomy ids, `nx test` arg forwarding, addon lists, `preview.tsx` wiring, `component-trinity.md:3` trigger text.

**Assumed (not executed):** Angular compile behaviour on `label` (NG8002 vs dropped attribute) · `component-trinity` actually firing on the Day-2 prompt · Playwright browsers absent on participant machines · Windows `cmd /c` requirement · `check:sync` `[NO-STORY]` for a new dir (code read, dir not added) · Figma free plan sufficing for drafts + dev-plugin import · hosted MCP/Cloudflare tolerating 10 concurrent seats · that "twenty-four" was right on 08-29 · that the trainer's demo artboards are Claude Code drafts rather than project files · all minute estimates.

---

## 10. Weakest point of this review

Same as 08-28, and it is now the third review to say it: **nobody has executed the participant path end-to-end in the clone** — no `nx storybook angular` started and its URL read, no Angular build with `<atl-input label>`, no new component added to watch which gates go red, no per-seat Claude Design test, no block timed. Every blocker above was found by reading; the fix for that class of finding is one rehearsal on a non-author machine, and it costs less than this review did. Second weakness: 15 minors were taken from the audits without independent re-verification (the four blockers, I1, M1, M7, M11-LICENSE, n1, n2 were re-verified).

---

## 11. Proposed order

1. **I1** — two lines, today.
2. **B1** port sweep + `check:docs` rule against `6006` outside the scaffold branch.
3. **B2** `label` decision (spec + Angular, or drop) + a prop-parity gate.
4. **B3** Day-2 gate story: `sync:generated` step, scoped Erfolgs item 2, "these reds are expected", slide fix.
5. **B4** `error` → `danger` in two briefs.
6. **M1** stale numbers on `/claude-design` (generate, don't type).
7. **M4–M6** clone-first kata, Block 05 page, quickstart + local MCP snippet.
8. **M7, M10, n1–n2** one-line fixes.
9. **Per-seat test** (§5) → then M2 run-sheet, M3 page additions, kata decisions.
10. **Trainer repo** (§6.3) → move the agenda's internal parts, write (b)–(d) first, (a) once p1/p2 captures exist.
11. **Rehearsal** on a non-author machine with a timer → replaces §10.
