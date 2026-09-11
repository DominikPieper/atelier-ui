# figma-console-mcp-skills — repository inventory

Method: fetched the GitHub API tree (`git/trees/main?recursive=1`) and every file's raw content
directly via `curl` against `raw.githubusercontent.com` (not WebFetch's AI-summarization path), so
line counts, frontmatter text and code are exact byte-for-byte copies of the repo at fetch time
(2026-09-07). All findings below are [verified] against that fetched content unless marked
[unverified].

## 1. Repo layout

Top level (root of `southleft/figma-console-mcp-skills`, default branch `main`):
`.claude-plugin/marketplace.json`, `.gitignore`, `LICENSE`, `README.md`, `references/` (2 files:
`rest-api-setup.md`, `use-figma-conventions.md` — explicitly optional background, not loaded by any
skill), and `skills/` (23 skill directories). [verified, `api.github.com/repos/southleft/figma-console-mcp-skills/git/trees/main?recursive=1`]

Per-skill folder shape is uniform: `skills/<name>/SKILL.md` (always present, YAML frontmatter +
Markdown body) plus optionally `scripts/` (`.js` for the native `use_figma` Plugin-API tool, `.mjs`/
`.sh` for the 4 REST/code skills) and `references/` (extra tables/rubrics scoped to that one skill,
e.g. `parity-scoring.md`, `lint-rules.md`, `audit-categories.md`). The README states every skill
folder is self-contained (SKILL.md + its own scripts/references, no cross-skill file dependency) so a
single folder can be zipped and uploaded standalone. [verified, `README.md`]

Install methods documented: (a) `npx skills add southleft/figma-console-mcp-skills` (`--skill <name>`
for one) via the third-party `skills` CLI; (b) Claude Code plugin — `/plugin marketplace add
southleft/figma-console-mcp-skills` then `/plugin install figma-console-mcp-skills@figma-console-mcp-skills`
(backed by `.claude-plugin/marketplace.json`, bundling all 23 skill paths under one plugin); (c)
manual zip of one `skills/<name>` folder uploaded via Claude Desktop/claude.ai; (d) `git clone` +
`cp -R skills/* ~/.claude/skills/`; (e) same folders into `.codex/skills/`/`.gemini/skills/`.
[verified, `README.md`, `.claude-plugin/marketplace.json`]

License: MIT, copyright "Southleft / Figma Console MCP Contributors", 2025. [verified, `LICENSE`]

**Discrepancy**: README's own heading is "The 22 skills" and its FAQ says "18 of the 22 skills"
need no token (22 − 4 REST skills = 18), and its 5-category table lists exactly 22 skills — but the
repo tree has **23** skill directories, and `marketplace.json`'s `skills` array bundles all 23. The
one skill missing from the README's table (but present in the tree and in marketplace.json) is
`figma-extract-design-system`. [verified by direct comparison of `README.md` §"The 22 skills" against
the API tree and `marketplace.json`]

## 2. All skills

| Skill                         | One-line description (frontmatter, trimmed)                                                 | Functional area (README's own grouping; * = not in README table) | Tools driven                                                                                        | Token?  | SKILL.md lines |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------- | -------------- |
| figma-export-tokens           | Export Figma variables → DTCG/CSS/Tailwind/SCSS/TS/JSON/Style Dictionary/Tokens Studio      | Tokens & Variables                                               | `use_figma` (Plugin API)                                                                            | No      | 61             |
| figma-import-tokens           | Push tokens from code into Figma as variables, non-destructive                              | Tokens & Variables                                               | `use_figma`                                                                                         | No      | 46             |
| figma-setup-design-tokens     | Bootstrap a whole token system (collection+modes+variables) atomically                      | Tokens & Variables                                               | `use_figma`                                                                                         | No      | 37             |
| figma-manage-variables        | CRUD + batch create/update variables, scopes, code syntax, modes                            | Tokens & Variables                                               | `use_figma`                                                                                         | No      | 38             |
| figma-library-variables       | Discover/import variables from subscribed team libraries                                    | Tokens & Variables                                               | `use_figma`                                                                                         | No      | 34             |
| figma-analyze-component-set   | Analyze a COMPONENT_SET as a state machine (variant axes → CSS pseudo-classes)              | Components & Design System                                       | `use_figma`                                                                                         | No      | 64             |
| figma-arrange-component-set   | Organize variants into a labeled grid container                                             | Components & Design System                                       | `use_figma`                                                                                         | No      | 49             |
| figma-component-properties    | Add/edit/delete component properties; instantiate + set instance props                      | Components & Design System                                       | `use_figma`                                                                                         | No      | 61             |
| figma-design-system-inventory | One-call unified extraction: tokens+components+styles+visual specs                          | Components & Design System                                       | `use_figma`                                                                                         | No      | 49             |
| figma-deep-component          | Unlimited-depth component tree, resolved tokens, mainComponent refs, reactions              | Components & Design System                                       | `use_figma`                                                                                         | No      | 58             |
| figma-lint-design             | WCAG 2.2 + design-system quality lint over a node tree                                      | Quality & Accessibility                                          | `use_figma`                                                                                         | No      | 50             |
| figma-audit-accessibility     | Per-component a11y scorecard: state coverage, focus, target size, color-blind sim           | Quality & Accessibility                                          | `use_figma`                                                                                         | No      | 46             |
| figma-scan-code-accessibility | axe-core + JSDOM scan of generated HTML                                                     | Quality & Accessibility                                          | standalone Node script (axe-core), **no Figma connection at all**                                   | No      | 70             |
| figma-check-design-parity     | Compare a Figma node vs a code spec; parity score + discrepancies                           | Quality & Accessibility                                          | `use_figma`                                                                                         | No      | 47             |
| figma-version-history         | List versions, snapshot a version, diff two versions                                        | Versioning & Collaboration                                       | Figma REST API                                                                                      | **Yes** | 102            |
| figma-generate-changelog      | Human-readable markdown changelog between versions                                          | Versioning & Collaboration                                       | Figma REST API                                                                                      | **Yes** | 73             |
| figma-blame-node              | Binary-search which version introduced a node/property change                               | Versioning & Collaboration                                       | Figma REST API                                                                                      | **Yes** | 86             |
| figma-comments                | Read/post/reply/delete file comments, node-pinned                                           | Versioning & Collaboration                                       | Figma REST API                                                                                      | **Yes** | 97             |
| figma-generate-component-doc  | Generate complete component documentation markdown                                          | Docs/Annotations/FigJam/Slides                                   | `use_figma`                                                                                         | No      | 60             |
| figma-annotations             | Read/write designer annotations (specs pinned to nodes) + categories                        | Docs/Annotations/FigJam/Slides                                   | `use_figma`                                                                                         | No      | 41             |
| figjam-create-content         | Author FigJam: stickies, connectors, shapes, sections, tables, code blocks, auto-arrange    | Docs/Annotations/FigJam/Slides                                   | `use_figma` (FigJam files only)                                                                     | No      | 42             |
| figma-slides                  | Author Figma Slides: slides, text/shapes, backgrounds, transitions                          | Docs/Annotations/FigJam/Slides                                   | `use_figma` (Slides files only)                                                                     | No      | 41             |
| figma-extract-design-system   | Extract a design system from vibe-coded apps: inventory→tokens→Storybook→(optionally) Figma | _not listed in README table_                                     | **figma-console-mcp** `figma_ds_*` tools (Local Mode), with an agent-driven Read/Grep/Bash fallback | No      | 158            |

Source for every row: `https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/<name>/SKILL.md` [verified, fetched directly].

## 3. The six requested skills, in detail

**figma-check-design-parity** (design-to-code parity). Inputs: a `NODE_ID` and a user-assembled
`codeSpec` (only filled sections — `visual`/`spacing`/`typography`/`accessibility` — are compared;
`references/parity-scoring.md` has the shape; `figma-scan-code-accessibility --map-to-codespec` can
auto-build the accessibility section). Workflow: (1) assemble `codeSpec`, (2) run
`scripts/check-parity.js` via `use_figma`, which reads fills/strokes/corner-radius/opacity/padding/
gap/text and diffs against `codeSpec`, (3) read `summary.parityScore = max(0, 100 − critical×15 −
major×8 − minor×3 − info×1)` plus `discrepancies[]` (`category`, `property`, `severity`,
`designValue`, `codeValue`, `suggestion`), (4) fix code or design, then **re-run to confirm the score
rose** — the stated verification/stop condition. Numeric tolerance guards sub-pixel rounding (~2px,
0.01 opacity). [verified, `skills/figma-check-design-parity/SKILL.md`]

**figma-lint-design** (WCAG lint + DS audit). Inputs: `NODE_ID` (`null` = whole page) and a `RULES`
filter (default `['all']`; narrowable to `'wcag'`/`'design-system'`/`'layout'`/one rule id — catalog
in `references/lint-rules.md`). A **14 WCAG-2.2-rule + 6 design-system/layout-rule** port run once
over a tree. Output: findings grouped by rule with `severity` (`critical`/`warning`/`info`) and
`wcagLevel` (`a`/`aa`/`aaa`/`best-practice`/`design-system`), plus `summary.total` and each finding's
`node.id`. Stop/verify: triage critical first, fix via `figma-manage-variables`/`figma-use`, **re-run
the same scope and confirm `summary.total` dropped**. Bounds: `MAX_DEPTH` (10), `MAX_FINDINGS` (100),
`truncated` flag. Read-only (no auto-fix). [verified, `skills/figma-lint-design/SKILL.md`]

**figma-audit-accessibility** (per-component a11y scorecard). Inputs: `NODE_ID` (COMPONENT_SET/
COMPONENT/INSTANCE — instances walk up to the parent set) and `TARGET_SIZE` (default 24px, WCAG
2.5.8; 44/48 for mobile). Scores six categories — state coverage, focus-indicator quality/contrast,
non-color state differentiation, target size, annotation completeness, color-blind simulation
(protanopia/deuteranopia/tritanopia, Brettel/Viénot matrices) — into a classification-weighted
`overallScore` (interactive vs. presentational auto-detected; a badge isn't penalized for lacking a
focus state, a button is). Output: `recommendations[]` sorted by `priority` with the WCAG SC named.
Verify: fix, then **re-audit to confirm the score moved** — the audit itself is read-only. [verified,
`skills/figma-audit-accessibility/SKILL.md`]

**figma-analyze-component-set** (variant/state-machine analysis). Input: a `COMPONENT_SET_ID`
(script validates it's a _set_, not one variant). Output: `variantAxes` (axis+options),
`componentProps` (non-variant TEXT/BOOLEAN/INSTANCE_SWAP → code props), a `stateMachine` with
`cssMapping` (a fixed table: `hover→:hover`, `focus(-visible)→:focus-visible`, `active/pressed→
:active`, `disabled→:disabled,[aria-disabled="true"]`, `error/invalid→[aria-invalid="true"]`,
`selected→[aria-selected="true"]`, `checked→:checked`, `loading→[aria-busy="true"]`, `open/closed→
[aria-expanded=...]`, `filled→.has-value`) and a `defaultSignature`, plus per-variant
`diffFromDefault` (only properties that change vs. default). Bound variables resolve to token
names, falling back to hex. Explicit verification: "cross-check that every state in
`stateMachine.states` got a CSS rule, and that token names in the diff resolve to your exported
tokens." Stated failure mode: axis detection is heuristic (`state`/`status`/`interaction`,
`size`/`scale` names) — an unrecognized axis name yields an empty `cssMapping`. [verified,
`skills/figma-analyze-component-set/SKILL.md`]

**figma-generate-changelog** (changelog generation). Setup: terminal-only, requires `FIGMA_TOKEN`
(PAT, _File content: read_ + _File versions: read_; the Figma connector's OAuth session does not
cover REST). Workflow: (1) list versions (`../figma-version-history/scripts/list-versions.sh
<fileKey>`) to pick `--from`/`--to` or `current`, (2) run `scripts/generate-changelog.mjs --file <key>
--from <id> --to <id|current> [--components a:b,c:d] [--mode summary|standard|detailed] [--json]`.
Output: markdown (default) or `{markdown, data}`; sections are a From/To header (label, date, author,
span — best-effort, pages up to ~200 versions back), Page Structure (added/removed/renamed), an
optional Components section (rename/description/children/`componentPropertyDefinitions`/binding
changes), and a Notes section listing REST's blind spots for historical versions (canvas instances,
raw layout/visual props, variable values, style content). No re-run-to-verify loop — it's a report
generator; its own caveat is graceful degradation to a raw version id once author lookback is
exceeded. [verified, `skills/figma-generate-changelog/SKILL.md`]

**figma-annotations**. Inputs: a node id (frames/components/instances/shapes/text, not pages) and,
for categorized writes, a real `categoryId` (per-file, not guessable — list categories first).
Workflow: (1) get node id, (2) list categories if needed, (3) read via `scripts/get-annotations.js`
(`INCLUDE_CHILDREN` to walk a component tree), (4) write via `scripts/set-annotations.js` with
`MODE: 'replace'` (default) or `'append'`, (5) explicit verification: "re-run the read script and
confirm the annotation count and labels match what you set." Gotchas: Figma populates both `label`
and `labelMarkdown` on read but rejects writing both (append prefers `labelMarkdown`); `properties`
only names which attributes the note is about, it doesn't set values; requires Figma Desktop.
[verified, `skills/figma-annotations/SKILL.md`]

## 4. Conventions worth noting

- **Trigger phrasing**: every `description` field is one dense paragraph ending in an explicit
  `Triggers:`/`triggers:` clause with 5–10 quoted example user phrasings, plus a "NOT X, use Y
  instead" disambiguation against sibling skills and against the native MCP's built-in tools. All 23
  frontmatters carry `disable-model-invocation: false` (auto-invocation is left on for every skill).
  [verified, all 23 `SKILL.md` files]
- **MCP tool references are NOT server-qualified.** Skills call the native tool by bare name
  (`use_figma`, `get_design_context`) — there is exactly one Figma MCP server in this design (the
  official native one), so no `mcp__<server>__` prefix is used anywhere, unlike figma-console-mcp's
  `mcp__figma-console__figma_*` naming in this session's own tool list. [verified, all `SKILL.md`
  files + `references/use-figma-conventions.md`]
- **"nodeIds are session-specific / search first" pattern**: narrower than figma-console-mcp's own
  guidance in this session (`figma_search_components` at session start). These skills instead say to
  source `NODE_ID` from "the user's selection, a search, or a node id they paste," and
  `figma-analyze-component-set` validates the node is the right _type_ before proceeding; no skill
  states ids go stale across sessions. [verified/contrast, `skills/figma-analyze-component-set/SKILL.md` step 1]
- **Verification loop is score-and-rerun, not screenshot-diff.** None of the 6 detailed skills uses a
  screenshot loop (that's the native `get_screenshot` tool, listed as "left out to avoid conflicts" in
  `README.md`). Each quality/audit skill instead computes a numeric score and says "fix, then
  re-run/re-audit/re-lint to confirm the score moved/dropped." [verified, respective `SKILL.md` §Workflow]
- **Narrow tool surface per skill**: every "Skill boundaries" section opens with identical
  boilerplate (load `figma-use` first; plain JS, top-level await/return, no IIFE, colors 0–1, load
  fonts before text ops, atomic errors) then lists 2–4 sibling skills as "for X use skill Y instead" —
  cross-referencing, not tool restriction, is how they stay single-purpose (there's only ever one
  callable tool, `use_figma`, or a REST script). [verified, all `use_figma`-based `SKILL.md` files]
- Shared execution-model rules live once in `references/use-figma-conventions.md` (11 numbered rules
  - a `hexToRgb` helper + a "Plugin API gotchas" list from live testing, e.g. many property getters
    throw `TypeError` rather than return `undefined` on the wrong node type; `figma.loadAllPagesAsync()`
    is unsupported inside `use_figma`); each SKILL.md inlines only an "essentials" sentence — the full
    file is optional. [verified, `references/use-figma-conventions.md`]

## 5. Gaps: native-MCP-only skills vs. transport-agnostic

**Assume the native Figma Dev Mode MCP (`use_figma` / `get_design_context` / etc.) and will NOT run
against figma-console-mcp as-is**: all 17 skills whose "Tools driven" column above says `use_figma` —
`figma-export-tokens`, `figma-import-tokens`, `figma-setup-design-tokens`, `figma-manage-variables`,
`figma-library-variables`, `figma-analyze-component-set`, `figma-arrange-component-set`,
`figma-component-properties`, `figma-design-system-inventory`, `figma-deep-component`,
`figma-lint-design`, `figma-audit-accessibility`, `figma-check-design-parity`,
`figma-generate-component-doc`, `figma-annotations`, `figjam-create-content`, `figma-slides`. Their
`scripts/*.js` use the `use_figma` execution idiom (bare top-level `await`/`return`, no `msg.*` param
object, `skillNames` logging arg), specific to the native MCP's plugin-execution tool —
figma-console-mcp exposes a differently-shaped `figma_execute` tool plus purpose-built tools instead
(per this session's own connected figma-console MCP tool list, e.g.
`mcp__figma-console__figma_check_design_parity`, `figma_lint_design`,
`figma_audit_component_accessibility`, `figma_analyze_component_set`, `figma_generate_changelog`,
`figma_get_annotations`/`figma_set_annotations`/`figma_get_annotation_categories`). [verified for the
skill side, `README.md` + all `use_figma` `SKILL.md` files; the figma-console-mcp tool names are
ambient/session knowledge, not a web source, so tagged separately here]

**Transport-agnostic (would run, or need only cosmetic changes, against any Figma access)**:
`figma-scan-code-accessibility` — a standalone Node/axe-core/JSDOM script with **no Figma connection
at all**, operating purely on generated HTML. [verified, `skills/figma-scan-code-accessibility/SKILL.md`]
The 4 REST skills (`figma-version-history`, `figma-generate-changelog`, `figma-blame-node`,
`figma-comments`) call `api.figma.com` directly with a personal access token and are independent of
which MCP server is installed — they'd work unmodified alongside figma-console-mcp. [verified,
`references/rest-api-setup.md`, and each skill's own "Setup" section]

**Explicitly figma-console-mcp-native**: `figma-extract-design-system` is the one skill in the
collection built _against_ figma-console-mcp's `figma_ds_*` tools (`figma_ds_analyze`,
`figma_ds_extract_tokens`, `figma_ds_scaffold`, `figma_ds_setup_storybook`, `figma_ds_status`), with a
stated Read/Grep/Bash fallback "if no console MCP" is connected — making it the repo's only skill that
would run as designed in an figma-console-mcp environment, and the only one _not_ listed in the
README's own "22 skills" table. It is also the only skill whose Phase 6 mentions two more skill names
(`figma-generate-library`, `prototype-to-figma`) that do **not** exist in this repo's tree — these are
either from figma-console-mcp's own (unfetched) skill bundle or a forward reference to unshipped
skills; [unverified — no file with either name exists in this repo per the API tree]. [verified for
everything else in this paragraph, `skills/figma-extract-design-system/SKILL.md`]

## 6. Design-QA / code→design / Storybook-linking workflows

- **"Design QA"/"design review" wording appears verbatim** as trigger phrases in `figma-lint-design`
  ("design QA", "a11y check on this page", "audit my design for issues") and in
  `figma-check-design-parity` ("design QA against code", "verify the build matches Figma"). [verified,
  both `SKILL.md` frontmatters]
- **No dedicated "code → Figma" sync skill** exists as its own top-level skill; the closest is
  `figma-import-tokens` (tokens code→Figma) and `figma-extract-design-system` Phase 6 ("Design-led:
  into Figma" — `figma_import_tokens` for tokens, then rebuilding key components as Figma component
  sets bound to the imported variables, "so Figma and code share one token source," followed by an
  ongoing `figma_export_tokens`/`figma_import_tokens` diff-aware merge loop). [verified,
  `skills/figma-extract-design-system/SKILL.md` Phase 6]
- **Storybook-linking workflow**: also only inside `figma-extract-design-system` — Phase 3 runs
  `figma_ds_scaffold` then `npm create storybook@latest` then `figma_ds_setup_storybook`, which the
  skill says generates `.storybook/preview.css` (tokens + the source app's Tailwind `@theme`/`@utility`/
  `@font-face` rules), copies self-hosted fonts, and patches `main.js`/`preview.jsx` for a theme
  toolbar sourced from the extracted mode names; Phase 4 requires "visually verify in Storybook
  (browser) before calling it done" as its explicit stop condition per component. No other skill in
  the collection references Storybook. [verified, `skills/figma-extract-design-system/SKILL.md`
  Phases 3–4]

## Bibliography

- https://github.com/southleft/figma-console-mcp-skills — repo homepage [verified via API tree, not the HTML UI]
- https://api.github.com/repos/southleft/figma-console-mcp-skills/git/trees/main?recursive=1 — full file tree [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/README.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/LICENSE [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/.claude-plugin/marketplace.json [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/references/use-figma-conventions.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/references/rest-api-setup.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-check-design-parity/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-lint-design/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-audit-accessibility/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-analyze-component-set/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-generate-changelog/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-annotations/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-extract-design-system/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-export-tokens/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-import-tokens/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-setup-design-tokens/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-manage-variables/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-library-variables/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-arrange-component-set/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-component-properties/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-design-system-inventory/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-deep-component/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-scan-code-accessibility/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-version-history/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-blame-node/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-comments/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-generate-component-doc/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figjam-create-content/SKILL.md [verified]
- https://raw.githubusercontent.com/southleft/figma-console-mcp-skills/main/skills/figma-slides/SKILL.md [verified]
