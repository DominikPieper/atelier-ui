# Design-workflow skills — research and blueprint

_Written 2026-09-07. Status: **decided the same day** — see the note at the top of § 8;
the catalog in § 5 is what the research supports, § 5's preamble is the adopted shape. Everything
marked *verified* was read from a live tool, a fetched page, or this repo today;
everything marked *assumed* was not._

## 1. The question

The design work in this repo runs across three surfaces — the Figma file, the Claude
Design projects, and the code — through two MCP servers (`figma-console`,
`claude-design`) plus Storybook and uianatomy. Each session that touches design
re-derives the same things: which tool reads a master, what a parity check needs,
how an artboard is shaped, which Plugin API call flips auto-layout sizing. The ask
was: research what the tools can do and what good practice looks like, and turn the
recurring paths into skills so the knowledge is loaded, not rediscovered — a design
review, a design-to-code workflow, code-to-Figma, and the Claude Design direction
(canvas → code), plus guidance on how a Figma file and its overview pages should be
architected.

## 2. Method and sources

- **Live probes (verified today).** All 23 `claude-design` MCP tool schemas loaded and the
  read-only ones called against the Atelier project; `read_design_skill(hifi-design)` read
  in full; `list_design_systems` (10 systems, Atelier's is *not* the account default).
  All ~120 `figma-console` tool schemas loaded and every `figma_*` name grepped across
  `skills/`, `plan/`, `tasks/`, `tools/`, `docs/`.
- **Web research (five Sonnet agents; digests kept verbatim in
  `plan/research/design-skills-2026-09-07/`).** Figma's own
  best-practice guides and help center, the figma-console-mcp README/docs/CHANGELOG
  (v1.40.0, 2026-08-16), the `southleft/figma-console-mcp-skills` repo (all 23 SKILL.md
  files fetched raw), Anthropic's Agent Skills docs and `anthropics/skills`, and the
  Claude Design product/help/admin pages.
- **NotebookLM.** Two deep-research runs (34 + 45 sources) into one notebook, then three
  synthesis queries (Figma file blueprint, Claude Design handoff, design review).
  Notebook: <https://notebooklm.google.com/notebook/f153635d-2589-4922-8fcc-6c171482d1fe>.
  Treat its answers as a second reader over the same sources, not as a primary source.
- **Repo.** `AGENTS.md`, the three existing skills, `plan/figma.md`,
  `plan/figma-component-checklist.md`, `workshop/briefs/README.md`, `tasks/lessons.md`,
  ADR-0019/0024/0032/0096/0099/0104/0106.

## 3. What already exists (do not rebuild)

| Asset | Covers | Gap it leaves |
|---|---|---|
| `skills/figma-workspace-architect` (5 modes: Build, Audit, Decide, Migrate, Sync, plus Scaffold/Inventory/Re-verify sub-modes; 16 references; 8 fixtures) | File-level architecture, token tiers, audits of the *file* incl. Component Design CD6–CD9, token sync ending in a parity check, migrations; Build already creates component sets. Explicitly out of scope: Figma → code, Plugin API mechanics, Code Connect (toolchain constraint). | No repo-bound recipe for "spec block → conformant master → snapshot → `check:figma`"; Plugin API gotchas live in `tasks/lessons.md`, not in the skill; file-structure reference (which already has Changelog and `_Internal` pages) predates Slots and the doc-frame practice. |
| `skills/atelier-design` | Brand, tokens, type scale, docs-site UI kit — for generating on-brand surfaces. | Nothing about workflow. |
| `.claude/skills/uianatomy-mcp` (canonical copy from uianatomy.dev) | Anatomy, axes, mismatches, `validate_implementation`. | Referenced by the briefs, not by any workflow skill. |
| `AGENTS.md` § Design-to-Code Workflow + docs `/design-to-code`, `/first-component` | The four-step loop as prose and prompts. | Prose is re-read every session; the handoff document (ADR-0096) is a curriculum convention with no skill behind it. |
| Gates: `check:figma` (snapshot vs spec), `check:parity` (ADR-0024/0104), `check:skill*`, `parity:record`, `figma:snapshot`, `figma-sync-*`, `gen-figma-library-tokens`, `gen-artboard-palette` | The offline proof. | Skills must *end* in these; today only the architect's Sync mode and `code-verify.md` do, and a static parity read reaches about a fifth of what Figma paints (`tasks/todo.md`, AtlSelect measurement). |
| ADR-0032 / docs `/claude-design` | Claude Design at step 0 and step 5, Figma the only gated truth. | Step 5 is "specified and unbuilt". ADR-0106 proved the **owner seat** writes; ADR-0032's blocker is per-seat access across a room (two non-author accounts), and `tasks/todo.md` § Blocked keeps it open, narrowed. |

## 4. Findings

### 4.1 figma-console-mcp — what the server offers vs what the repo uses

Reference counts across skills, plans, tasks, tools and docs (verified by grep today):

- Heavily used: `figma_execute` (109), `figma_check_design_parity` (49), `figma_get_variables`
  (36), `figma_get_file_data` (24), `figma_setup_design_tokens` (21), `figma_set_description`
  (19), `figma_take_screenshot` (18), `figma_get_component_for_development` (14),
  `figma_audit_component_accessibility` (12), `figma_set_annotations` (11).
- **Never referenced anywhere (30 tools; counts and method in research digest 01 § a–b):**
  the diff/changelog/blame half of the version-history family
  (`figma_diff_versions`, `figma_generate_changelog`, `figma_blame_node`,
  `figma_get_changes_since_version`, `figma_get_file_at_version` — while
  `figma_get_file_versions` and `figma_get_design_changes` are used, ADR-0105), the slot family
  (`figma_create_slot`, `figma_get_slots`, `figma_append_to_slot`, `figma_reset_slot`,
  `figma_add_slot_property`), the token I/O pair (`figma_export_tokens`,
  `figma_import_tokens`, `figma_get_token_values`, `figma_browse_tokens`), the whole `ds_*`
  extraction pipeline (7 tools, v1.40.0, code → design system → Storybook → Figma),
  `figma_audit_design_system_report` (the JSON twin of the MCP-Apps dashboard, needs no
  `ENABLE_MCP_APPS`), `figma_create_component_set`, `figma_execute_across_files`,
  `figma_diagnose`, and three of the four library tools (`figma_get_library_components`
  is in the architect's tool map).

Facts a skill author needs (from the docs, verified):

- Two transports. Desktop Bridge plugin (WebSocket 9223–9232) is the only path for writes,
  live screenshots, selection and console. REST-only mode reads file/variables/styles and
  is the one that can be stale after a write — hence `figma_capture_screenshot` (live)
  over `figma_take_screenshot` (REST) right after a mutation.
- Caps: `figma_execute` 5 s default / 30 s max; batch variable calls 100/batch;
  `figma_create_component_set` 100 variants; responses > 500 KB auto-compressed.
- `.mcp.json` pins `figma-console-mcp@latest`. The architect's SKILL.md and references
  hardcode ~70 tool names against a server that added seven tools in its last minor.
- Traps the tool descriptions themselves name (full list in research digest 01 § c):
  text edits on an INSTANCE via `figma_execute` **fail silently** — use
  `figma_set_instance_properties`; `figma_import_tokens` is round-trip safe for DTCG
  only, the other input formats return `NotImplementedError`; `figma_diff_versions` never
  sees description/annotation changes made while the Bridge was disconnected, nor
  variable *value* changes; `figma_search_components` matches description text too, so an
  unrelated component can surface on a description hit.
- The maintainers ship **23 skills in a separate repo**, but 17 of them drive the *native*
  Figma MCP's `use_figma` executor and do not run against figma-console-mcp. What ports is
  their **rubrics**: the parity score formula (`100 − critical×15 − major×8 − minor×3 −
  info×1`), the variant-axis → CSS pseudo-class table, the 14+6 lint rule catalog, the
  six-category a11y weights. Their SKILL.md convention — one dense description ending in a
  `Triggers:` list of quoted phrasings plus "NOT X, use Y instead" — is worth copying.

### 4.2 claude-design MCP — what flows in which direction

Verified against the live server today (full table in the session digest):

- **Read out of a project:** file tree and content (etag-tracked, 256 KiB/call), the chat
  transcript, comment threads (with an `author_is_you` / `queued_for_claude` trust model),
  the two design skills (`hifi-design`, `frontend-design`), and Claude Design's own system
  prompt plus a bound design system's guide (`get_claude_design_prompt`).
- **Write into a project:** files (`write_files`, `copy_files`, `create_support_js`),
  deletions, new projects, a one-way mirror of *our* conversation into the project's chat
  panel, comment acknowledgement, membership and sharing. There is **no tool that steers
  the in-app designer agent**; `put_conversation` is documented as write-only.
- `finalize_plan` → `plan_token` gates only the mutating quartet; it is a concurrency/consent
  layer (`base_etags` → `if_match`), not a read gate. `render_preview` mints a tooling-only
  `serve_url` and a durable user-facing `open_url` — the mechanism behind the prompt's own
  verify loop (render → gate on console errors/404s/blank mounts → fresh eyes → act).
- **A live drift.** `tools/design/artboards.json` lists 31 artboards including
  `Typography Directions.dc.html`, which the project no longer contains; the project has
  31 `.dc.html` files (29 `Atl*`, `Foundations`, `Index`) and the registry does not list
  `Index.dc.html`. Same count, two mismatches — the hand-maintained column the file
  warns about has already drifted. (Todo item in § 7; `list_files` output in research
  digest 02.)
- The `hifi-design` skill's process is: ask questions → collect design context (copy ALL
  relevant components; `list_files` the bound design-system project; `copy_files` starter
  frames) → write assumptions + reasoning first, show early → build → verify loop. Options
  are presented as stacked turns with stable `{turn}{letter}` ids. Its own words: "Mocking a
  full product from scratch is a LAST RESORT."
- Product state (fetched pages): inputs are codebases/GitHub, Figma links, screenshots,
  DOCX/PPTX; outputs are HTML/PDF/PPTX/ZIP/Canva plus a connector list; **Figma appears
  only as an input, never as an export target** on any primary page; the Claude Code
  handoff is the documented output path (`/design-sync`, "handoff bundle"). The New Stack's
  June-2026 review of the overhaul reported bidirectional sync and brand validation as
  fixed, and "has not meaningfully reduced the visual back-and-forth" plus token cost as
  not fixed. The repo's own `/design-sync` note (React-only, ts-morph over `.tsx`) stands;
  the `DesignSync` tool schema in this session confirms the plan → write → `report_validate`
  shape and the `@dsCard` preview-card convention.

### 4.3 Figma file architecture — what current practice says

Converging recommendations (Figma's own guides first, practitioners second; the NotebookLM
blueprint agrees on every item below):

- **Pages are a workflow, not a taxonomy.** Cover → Getting started → Changelog →
  Foundations/Tokens → Icons → Components → Patterns → Templates → Playground →
  Deprecated → `_Private/WIP`. Hyphen-named spacer pages divide sections. Ready-for-dev
  work is physically separated from work in flux. Split into several library files only
  when a symptom appears (load time, permissions, ownership) — and keep all variable
  collections in one parent file so aliases never cross a file boundary.
- **Cover** carries at minimum name and one-line description; a good one adds version,
  status, owners, last change, and links to Storybook/docs. **Component overview /
  inventory** pages exist for discovery and for machine audits — every tile an instance
  of a master, never a copy (this repo already does this, `plan/figma.md`).
- **Documentation frames beside each component** (purpose, anatomy callouts, properties
  table with defaults, do/don't, a11y requirements, Storybook link). Where the canonical
  doc *lives* is genuinely contested: Figma's mature-org guidance points to an external
  site; Figma's Storybook plugin treats the two as co-equal and bidirectional. The
  anti-drift mechanism every source agrees on is **binding docs to live objects**
  (descriptions, annotations that reference variables) and **linting the docs** (eBay).
- **Component architecture.** Atom/base components nested for one update point; the
  `.`/`_` prefix hides them from publishing (reported as leaky once nested — unresolved).
  Spread customisation over the five property types — Variant only for visibly distinct
  axes, Boolean for on/off layers (the single biggest variant-count reducer), Instance
  swap for closed sets like icons, Text for copy, **Slot** (open beta since 2026-03) for
  open-ended regions in cards/dialogs/menus. Slots are Figma's stated fix for variant
  explosion and for detaching; their limit is that properties cannot be applied to layers
  *inside* a slot. Identical layer names across variants preserve overrides. Variant
  property names and values match code props verbatim (`variant=primary`, not
  `Type=Primary`) — Figma's own guide ties this to React/Vue prop format.
- **Interaction states are not variants.** This repo's briefs already say it; uianatomy
  names the failure mode (`variant-explosion-from-states`).
- **Tokens.** Three collections (primitive / semantic / component-optional) with
  aliasing; semantic names encode role, not appearance; modes are the theming axis (light/
  dark, density, brand); scopes set explicitly (a colour showing up in a spacing picker
  is the classic miss); `codeSyntax.WEB` set so MCP extraction returns the CSS token, not
  a hex. Styles stay for composite values (type ramps, multi-layer shadows).
- **Handoff.** Dev Mode annotations as a curated post-design layer referencing live
  variables; Code Connect as the component → production-code contract (needs
  Organization/Enterprise seats per Figma's repo; this repo excludes it by an explicit
  *toolchain* constraint — figma-console-mcp only — recorded nowhere but the architect's
  SKILL.md, which is worth an ADR).
- **Review practice.** Automatable: unbound fills/strokes/radii/padding, missing auto
  layout, naming casing, scope/codeSyntax, text-layer name continuity, contrast. Human
  only: the "detach test" (a designer new to the library must not need to detach), the
  three-minute find-place-configure test, rationale review, branch approvals. Drift
  reviews end "with an owner, a deadline, and a decision".

### 4.4 Skill authoring — the rules that matter

From Anthropic's skills docs, the skill-creator, and Figma's own "Create skills for the
Figma MCP server" page (all verified):

- Frontmatter: `name` (≤ 64 chars, lowercase-hyphen, may not contain "claude" or
  "anthropic") and `description` (≤ 1024 chars, third person, states *what* and *when*,
  deliberately "pushy" against under-triggering). Body under ~500 lines / 5k tokens;
  `references/`, `scripts/`, `assets/` one level deep; TOC on references > 100 lines.
- Reference MCP tools **server-qualified** (`figma-console:figma_check_design_parity`) —
  this session has *two* Figma servers connected (`figma-console` and the official
  `claude_ai_Figma` connector), so bare names are an actual collision risk here, not a
  theoretical one.
- Workflows as copy-pasteable checklists with explicit stop conditions; plan → validate →
  execute for anything that writes in bulk; every quality step is "run, fix, re-run and
  confirm the number moved".
- Evals before docs: ≥ 3 test prompts, a no-skill baseline, iterate. Versioning is
  overwrite-in-place under the same name (no `-v2` folders). This repo already has the
  fixture shape (`tests/<scenario>/{input,expected}.md`) and the structural runner.
- Figma's page adds a body shape: single `#` title, `## When to use`, `## Instructions`
  (numbered, imperative), `## Examples`, `## Common edge cases`, and
  `disable-model-invocation: true` for high-risk actions.

## 5. Proposed skill catalog

**Boundary after the second-model cross-check (Codex, same day).** The five candidates in
§ 5.1–5.5 are what the research surfaced. Codex, handed the draft and the repo without my
framing, found that three of them re-cover ground the architect already holds: Build
already creates component sets and Sync already ends in a parity check (5.3), Audit's
CD6–CD9 already enforce states/bindings/auto-layout per component (5.2), and the
Changelog page and the snapshot/diff post-flight already sit in Migrate (5.5). I checked
each claim against the skill text and agree. **Recommended shape: two new skills plus
architect additions** — `design-to-code` with a build mode and a review/verify mode, and
`artboard-bridge` for Claude Design; the spec → master recipe, the Plugin API gotchas and
the changelog tools go into the architect as references. The candidates stay below so the
reasoning is traceable; their headers say where each folds.

Two tiers. **Generic** skills (distributable through the `.well-known/agent-skills`
mirror like the architect) know Figma and the MCP servers but not this repo. **Repo-bound**
skills know `libs/spec`, the gates and the file key, live in `skills/` too, and are named
in `UNDISTRIBUTED_SKILLS` with a reason. Every skill ends in a gate or a re-run, never in
"looks right".

### 5.1 `design-to-code` — repo-bound — **first**

The four-step loop as an executable checklist, starting from the ADR-0096 handoff
document rather than from the canvas.

- **Trigger.** "implement AtlFoo from Figma", "build this component from the design",
  "design to code", a pasted Figma node URL plus a framework, the kata.
- **Inputs.** Handoff document (draft URL + node id, chosen variants/states, token
  bindings, reuse-vs-new decision, behaviour from the brief, exclusions, target files,
  acceptance checks). If absent, the skill fills the *provenance and scope* half from the
  master and leaves behaviour, exclusions and the reuse decision as blanks, then stops.
  ADR-0096 rejected deriving the document automatically; this is a proposed narrowing of
  that stance (mechanical half by the agent, decisions by the author), to be recorded as
  a dated correction on ADR-0096 if adopted, not slipped in.
- **Steps.** (1) `figma-console:figma_search_components` (ids are session-specific) →
  `figma_get_component_for_development` on the node; `figma_analyze_component_set` for the
  state machine. (2) `uianatomy:get_component_view(id, "bridge")` for mismatches and
  named mistakes; note when the component is a *composition* (briefs README). (3) Read
  the spec block in `libs/spec/src/index.ts`; decide new vs. extend; for a new component
  run the generator. (4) Storybook MCP `docs-list` → `docs-show` for the chosen framework
  — never invent props. (5) Generate in **one** framework (ADR-0014); story declares
  `tags: ['autodocs']`; for local React Storybook, `get-storybook-story-instructions`,
  `stories-preview` and `test-run` are required by `AGENTS.md`. (6) `nx test <lib>`,
  `nx lint <lib>`. (7) `figma_check_design_parity` with a `codeSpec` declaring the
  relevant of its seven sections (visual, spacing, typography, tokens, componentAPI,
  accessibility, metadata) — a thin spec compares clean (ADR-0096); for stateful
  components the interactive Light/Dark recipe in the architect's `code-verify.md`,
  because a static read reaches about a fifth of the painted states; then
  `npm run parity:record`, with the report naming framework, states and sections, since
  the record stores none of them. (8)
  `uianatomy:validate_implementation` as a checklist, not a verdict. (9) Report
  verified vs assumed, and the parity discrepancies *understood*, not merely absent
  (briefs "Done when" § 8).
- **References.** `handoff-document.md` (the checklist as a template), `parity-codespec.md`
  (which fields, the tolerance, why the score is not stored — ADR-0024),
  `framework-notes.md` (the ADR-0097 binding shapes per framework, pointing at the hosted
  Storybook MCP rather than restating prop tables).
- **Relation.** Replaces re-reading `AGENTS.md` § Design-to-Code each session; the docs
  page stays the human explanation. Effort: M.

### 5.2 `component-design-review` — repo-bound → **folds into `design-to-code` as its review/verify mode**

A PR-time review of *one component across both surfaces*, distinct from the architect's
file-level Audit mode.

- **Trigger.** "review AtlFoo's design", "design review", "design QA", "is the Figma
  master ready", the PR template's Figma section, "why does check:figma fail".
- **Steps.** (1) Pin the snapshot (git SHA + Figma `lastModified`; `npm run figma:snapshot`
  if the master moved). (2) Machine layer: `figma_analyze_component_set` vs the spec's
  `variantMatrix` (names and values verbatim), `figma_lint_design` on the set,
  `figma_audit_component_accessibility` (≥ 85 per `plan/figma.md`), the five
  `check:figma` items, description references the `Atl*Spec` name, inventory tile is an
  `INSTANCE`, states drawn as variants get flagged (interaction states are CSS, not
  variants). (3) Human layer, as prompts to the reviewer: detach test, non-colour signal
  for every status colour, root typography leading (the ungated `[ROOT-PAINT]` hole in
  `plan/figma.md`), behaviour the picture cannot carry. (4) Code side:
  `figma_scan_code_accessibility` on the story HTML, `check:parity` state. (5) Output the
  architect's report template with severities and *one-line fixes*; Blockers first.
- **References.** `review-checklist.md` (CL-01…CL-12 from the research with severities,
  each mapped to the tool or gate that checks it), `false-positives.md` (the
  `wcag-color-only` page-lint noise on Badge/Alert/Toast, the `card-section-2` frames —
  so they are not re-fixed).
- **Relation.** The architect's Audit stays for the file; this is the per-component gate
  companion. Consider making it a mode of the architect instead — argument against: the
  trigger vocabulary ("review this PR's component") and the repo-bound inputs differ, and
  the architect's test runner hardcodes its mode list. Effort: M.

### 5.3 `spec-to-figma` — repo-bound → **folds into the architect as a repo-bound Build recipe + `plugin-api-gotchas.md`**

The direction the lessons file is full of and no skill covers: a spec block becomes a
master `COMPONENT_SET` on the Components page, tile on Inventory, snapshot refreshed.

- **Trigger.** "put AtlFoo into Figma", "create the master for", "the spec changed, update
  Figma", "sync tokens to Figma", "Figma is behind the code".
- **Steps.** Discovery first (architect Build loop step 1). Token side:
  `npm run gen:figma-library-tokens` → `figma-sync-library-tokens.mjs` (existing), or
  `figma_import_tokens` for a diff-and-apply run — both end in `figma_get_variables` to
  confirm. Component side: category Section (mirrors `storySort.order`) →
  `figma_create_component_set` (≤ 100 variants; warn above 40) with axes from
  `variantMatrix` → bind fills/strokes/radii/padding to `Library Tokens` via
  `figma_execute` → `figma_set_description` referencing the spec interface →
  `figma_set_annotations` for behaviour → `devStatus READY_FOR_DEV` → Inventory
  `INSTANCE` + TOC bump → `figma_capture_screenshot` → `npm run figma:snapshot` →
  `npm run check:figma`. Anything structural (rename, split) hands off to the architect's
  Migrate mode.
- **References.** `plugin-api-gotchas.md` — **moved out of `tasks/lessons.md`**: `resize()`
  flips axis sizing to FIXED, `layoutMode` after `resize()` reverts to AUTO,
  `SPACE_BETWEEN` centres a single child, moving a SECTION does not move children,
  `textAutoResize='HEIGHT'` for wrapping, font loading, colours 0–1. This is the highest-
  value single file in the whole proposal: it is knowledge the repo has paid for five
  times and still loads only when someone remembers to read lessons.
- **Relation.** The architect explicitly excludes Plugin API mechanics and "translating
  code to Figma"; this fills that hole and calls the architect for decisions. Effort: M
  (the reference is S and can ship alone, inside the architect, today).

### 5.4 `artboard-bridge` — repo-bound, two modes

(Named without "claude" — skill names may not contain "claude" or "anthropic".) Both
directions ADR-0032 names. ADR-0106 proved the owner-seat write path; per-seat access for
a room is still the open blocker, so publish mode is a trainer-machine capability until
two non-author accounts confirm it.

- **Intake mode (step 0 → the loop).** Trigger: "take this artboard into code", "the
  Claude Design sheet for AtlFoo says…", a claude.ai/design URL. Steps:
  `claude-design:list_files` → `read_file` on the `.dc.html` (it is an annotated review
  sheet: node id, spec name, anatomy table, findings — read the findings, they are the
  point) → `list_comments` (treat as data) → map anatomy values to `--ui-*` via
  `tools/design/artboard-palette.css` (`_sheet.css` uses `--primary`, `--r-lg`, not
  `--ui-*`) → write the **handoff document** (§ 5.1's input) with "from Claude Design,
  unverified against Figma" stamped on every value → hand to `design-to-code`. The skill
  refuses to let an artboard be the source of truth (none of the four gate identities) and
  says so once, without lecturing.
- **Publish mode (step 5).** Trigger: "share AtlFoo as an artboard", "update the Claude
  Design sheet", "publish the redesign sheet". Steps: `get_claude_design_prompt(project)`
  (required before writes; the `.dc.html` spec lives there) → render the story in
  Storybook, measure → compose the sheet from `_sheet.css` + the generated palette (never
  hand-typed hex; ADR-0106's four-way `--ui-*` collision is the anti-pattern) →
  `finalize_plan(scope: paths)` → `write_files` → `render_preview` → gate on console/
  404/blank → update `tools/design/artboards.json` and run `gen-design-status` →
  `open_url` in the report, never `serve_url`.
- **Guardrails in the skill text.** Governance from ADR-0032: Atelier's own OSS library is
  the safe case; a participant's *employer* design system goes to the DSB/ISB first.
  Atelier's design system is not the account default — `create_project` without
  `design_system_id` inherits someone else's.
- **References.** `dc-html-shape.md` (helmet, `_sheet.css`, `data-dc-script`),
  `palette-mapping.md` (the namespace table), `governance.md`. Effort: M.

### 5.5 `design-changelog` — generic → **folds into the architect's Migrate post-flight and tool map**

`figma_get_file_versions` → `figma_diff_versions` → `figma_generate_changelog` (+ git log)
into a release-notes section; `figma_blame_node` when a gate finding asks "when did this
move". Zero references today; the REST blind spots (canvas instances, variable values at
historical versions) go in the reference. Trigger: "what changed in Figma since",
"changelog for the design", "who changed the padding on". Effort: S.

### 5.6 Enhancements to `figma-workspace-architect` (no new skill)

- `references/naming-and-file-structure.md`: the taxonomy already has Changelog and
  `_Internal`; add Playground and Deprecated, the cover-page contents, documentation
  frames, the Slot property and its limit, `codeSyntax.WEB`, the split-only-on-symptom
  rule.
- A repo-bound Build recipe (from § 5.3) and `references/plugin-api-gotchas.md` (from
  `tasks/lessons.md` § Figma plugin API: `resize()` flips sizing to FIXED, `layoutMode`
  after `resize()` reverts to AUTO, `SPACE_BETWEEN` centres a single child, moving a
  SECTION leaves children behind, `textAutoResize='HEIGHT'`, instance text edits fail
  silently through `figma_execute`).
- `references/tool-map.md`: add the 30 unreferenced tools with one line each; mark which
  need the Desktop Bridge; add `figma_audit_design_system_report` as the Audit mode's
  breadth layer when MCP Apps are unavailable (today the skill assumes the dashboard).
- Rubrics ported from the southleft skills: parity severity weights, axis → pseudo-class
  table, lint rule catalog, a11y category weights — as small tables, credited.
- Server-qualified tool names in the tool tables.

### 5.7 Cross-cutting

- **Pin `figma-console-mcp`** in `.mcp.json` (currently `@latest`); bump deliberately with a
  tool-map refresh. Candidate ADR.
- **Fix `test-skill.mjs` before any second skill.** `VALID_MODES` is hardcoded to
  `Build`, `Audit`, `Decide`, `Migrate`, `Out-of-scope` — the architect's own fifth mode,
  Sync, is already missing, so the runner is already wrong for the skill it was written
  for. Read modes from a per-skill `tests/modes.json` or from the `## Mode routing` table.
- **Roster gates** (ADR-0099): `check-skill-discovery` is filesystem-derived; the
  `nx.json` `skills` release group is **explicit by decision** and gets a new entry by
  hand. Each new skill needs `project.json` with the five targets, `UNDISTRIBUTED_SKILLS`
  for repo-bound ones, and fixtures under `tests/` — the runner passes silently when the
  directory is absent, so the skill-creator `evals.json` prompts have to be converted.
- **Shared context.** Skills point at `AGENTS.md` for repo facts (file key, spec path,
  gates); they do not copy them.
- **Evals.** Each skill ships ≥ 3 fixtures on day one, one of them out-of-scope.

### 5.8 Skill-creator pass

The skill-creator method (intent → draft → test prompts → runs → review → iterate →
description optimisation) was applied as far as an unattended session allows. Intent
capture for all five skills, a full draft of `design-to-code` (SKILL.md + three
references), four eval prompts and a 20-query trigger set live in
`plan/research/design-skills-2026-09-07/drafts/` — outside `skills/`, so no roster gate
sees them before the decision. Not run: the with-skill/baseline runs (they call
figma-console against the live file and write into `libs/`) and the description
optimisation loop (needs the trigger set reviewed first). Those are the next two steps
once § 8.1 is decided.

## 6. Guidance that is not a skill

Two reference documents the research supports, worth writing regardless of the catalog:

- **`plan/figma-architecture.md`** — how *this* file should be laid out going forward
  (the § 4.3 checklist applied to `plan/figma.md`'s current six pages: Cover exists,
  no Changelog/Deprecated/`_WIP` pages, docs frames absent, Slots unused, `codeSyntax`
  unverified). Supersedes the stale table in `plan/figma.md` § Variable Collections
  (flagged stale since ADR-0030).
- **`plan/claude-design-workflow.md`** — the canvas → code direction as a recipe for humans:
  seed from the generated palette, ask for 3+ options as stacked turns, review via
  comments, hand off through the handoff document, never polish fidelity in the canvas
  (every practitioner source and the New Stack review agree), and what the artboard
  cannot carry (tokens as variables, behaviour, a gate identity).

## 7. Findings that need a todo item now

- `tools/design/artboards.json` drift: `Typography Directions.dc.html` listed but absent
  from the project, `Index.dc.html` present but unlisted; 31 entries against 31 files.
  (Verified today via `list_files`.)
- `.mcp.json` `figma-console-mcp@latest` unpinned while the architect hardcodes ~70 tool names.
- `test-skill.mjs` already omits the architect's Sync mode from `VALID_MODES`.
- `plan/figma.md` § Variable Collections still carries the pre-ADR-0030 table.

## 8. Decisions for the owner

**Decided 2026-09-07 (owner, same day):** 1 → two new skills plus architect additions;
2 → gotchas reference and `test-skill.mjs` fix first, then `design-to-code`, then the
architect Build recipe, then `artboard-bridge`; 3 → build publish mode now as a
trainer-machine capability, Blocked item stays open; 4 → pin `figma-console-mcp` 1.40.0
with an ADR; 5 → Code Connect exclusion recorded as an ADR; 6 → yes, mechanical prefill
allowed, with a dated correction on ADR-0096. Execution tracked in `tasks/todo.md`.
The list below is kept as written before the decisions.

1. **Catalog shape.** My first draft proposed five skills; the Codex cross-check showed
   three re-cover the architect (§ 5 preamble). Revised recommendation: **two new skills**
   (`design-to-code` with build + review/verify modes; `artboard-bridge`) **plus architect
   additions** (repo-bound Build recipe, `plugin-api-gotchas.md`, changelog tools in the
   tool map). The alternative — five separate skills — buys clearer trigger vocabularies
   at the cost of duplicated mode logic and three more roster entries.
2. **Order.** `plugin-api-gotchas.md` (S, today, no decision needed) → fix
   `test-skill.mjs` → `design-to-code` → architect Build recipe → `artboard-bridge`.
3. **Claude Design step 5.** ADR-0106 proved the owner seat; ADR-0032 asks for two
   non-author accounts before any exercise depends on it. Build `artboard-bridge`'s
   publish mode as a trainer-machine capability now, or wait for the seat test?
   Recommendation: build it, keep the todo's Blocked item open, and let the seat test
   decide whether it reaches an agenda.
4. **Pin the MCP server version** and record the constraint (ADR).
5. **Code Connect** stays out by toolchain choice (figma-console-mcp only), which the
   architect's SKILL.md carries alone — record it in an ADR so it outlives the skill text.
6. **ADR-0096 narrowing.** If `design-to-code` may fill the mechanical half of the handoff
   document, ADR-0096's "not derived automatically" needs a dated correction paragraph.
7. **Package the skills into `create-workspace`?** (asked by the owner 2026-09-07, open.)
   The scaffold preset writes `.mcp.json` (nx, Storybook per framework, figma-console) and
   `CLAUDE.md`, but ships no `.claude/skills/` and no skill files. Facts that bound the
   answer: the generic skills (`figma-workspace-architect`, its new
   `plugin-api-gotchas.md`) already publish at
   `atelier.pieper.io/.well-known/agent-skills/<name>/SKILL.md` with a digest, so the
   scaffold can fetch or vendor them without a second source; the repo-bound skill
   (`design-to-code`) leans on `libs/spec`, `parity:record`, `check:figma` and
   `tools/figma/snapshot.json`, none of which exist in a scaffolded workspace — its own
   draft already says "in a scaffolded workspace, stop at the parity report". Options:
   (a) vendor the generic skills at generate time and add a **scaffold profile** to
   `design-to-code` (same checklist, gate steps replaced by "run the parity check and
   read it"; `references/` name which steps are monorepo-only) — one skill, two
   environments, same pattern as ADR-0084's "one canonical per audience"; (b) generic
   skills only, `design-to-code` stays monorepo-only and the scaffold's `CLAUDE.md`
   keeps the prose loop; (c) nothing until a cohort asks. Recommendation: (a), but
   after `design-to-code` has passed its eval runs in the monorepo — packaging an
   untested skill into every participant workspace multiplies the untested part.
   Either way the scaffold's `.mcp.json` gets the same version pin as ADR-0110.

## 9. Verified vs assumed

**Verified today:** every tool count in § 4.1; every claude-design tool behaviour in § 4.2
(schemas + read-only calls); the artboards.json drift; the hifi-design process text; the
`.mcp.json` pin; `test-skill.mjs`'s hardcoded modes; the figma-console-mcp version and caps
(fetched README/CHANGELOG/docs); Figma's slot, property-type and page-organisation guidance
(fetched help/best-practice pages); the southleft skills' transport split (all 23 SKILL.md
fetched raw).

**Assumed / secondary:** that `.base` prefix hiding leaks once nested (search-derived, not
fetched); Figma plan-tier mode limits (forum); "no Figma export from Claude Design" as a
flat claim (absent from every primary page, asserted only by a secondary source); the New
Stack review's specifics (via NotebookLM's reading, not fetched directly); effort sizes.

**Corrected after the Codex cross-check (same day):** architect has five modes, not six;
`test-skill.mjs` already omits Sync; only the architect hardcodes tool names; ADR-0106
proved the owner seat, not per-seat access; `codeSpec` has seven sections; the `nx.json`
release group is explicit by decision; `figma_get_file_versions` is used (ADR-0105);
`figma_get_library_components` is in the tool map; Code Connect is excluded by toolchain,
not plan tier; `claude-design-handoff` violated the skill-naming rule. All fixed in place.

**Not done:** no skill was placed in `skills/` (one draft exists under
`plan/research/…/drafts/`); no Figma or Claude Design file was mutated; the
`figma_audit_design_system_report` and `figma_analyze_component_set` tools were not
exercised against the live file to confirm their output shape — that is the first spike
for § 5.2.
