# Skill drafts — skill-creator pass (2026-09-07)

> **Moved 2026-09-07:** `design-to-code/` left this folder for `skills/design-to-code/` once
> the catalog was decided (restructured into Build and Review modes, six fixtures under
> `tests/`, `evals/` kept for the skill-creator runs). What remains here is the intent
> capture for the other candidates and the record of the pass.

Drafts live here, **not** in `skills/`, so the roster gates (`check:skill-discovery`,
the `skills` release group, `check-skill.mjs`) do not see them until the owner decides
which ones ship (`plan/design-skills-blueprint.md` § 8). Moving a draft into `skills/`
means: `project.json` with the five targets, an explicit `nx.json` release-group entry
(ADR-0099), `UNDISTRIBUTED_SKILLS` entry for repo-bound skills, fixtures under `tests/`
(the runner passes silently without that directory — `evals.json` prompts are not
fixtures), and a fixed `test-skill.mjs` mode list (it already omits the architect's Sync).

The skill-creator method was applied as far as an unattended session allows:

| Step | Done | Not done, and why |
|---|---|---|
| Capture intent (enable / trigger / output / test cases) | For all five skills, below | — |
| Interview | Answers taken from the research and the repo's ADRs | Open questions listed per skill; the owner confirms |
| Draft SKILL.md | `skills/design-to-code/SKILL.md` (moved) — the exemplar, revised after the Codex cross-check (seven codeSpec sections, static-read ceiling, node-id provenance, disabled/loading as props, ADR-0096 narrowing made explicit) | The bridge skill waits for the catalog decision; 2, 3 and 5 fold into design-to-code or the architect (blueprint § 5 preamble) |
| Test prompts (`evals/evals.json`, no assertions yet) | `skills/design-to-code/evals/evals.json`, 4 prompts incl. one out-of-scope; six repo fixtures under `tests/` | — |
| Trigger eval set (20 queries, 10/10) | `skills/design-to-code/evals/trigger-eval.json` | Needs owner review before `run_loop.py` |
| With-skill / baseline runs | — | They call figma-console against the live file and write into `libs/`; not run unattended |
| Description optimisation loop | — | Depends on the reviewed trigger set; ~15 min of `claude -p` runs |

## Intent capture per skill

### 1. `design-to-code` — drafted

- **Enables:** the Figma → spec → code → verify loop for one component in one framework,
  from a written handoff document to `parity:record`.
- **Triggers:** implement / build / generate / port + a Figma source (master, node, URL,
  brief); "make the code match the master"; verify-only ("does X still match Figma").
- **Output:** component + CSS + Testing Library spec + story in one `libs/<fw>`; gate exit
  codes; parity discrepancies with a decision each; a verified/assumed report.
- **Tests:** yes — fixed workflow, objectively checkable (autodocs tag present, gates run,
  parity recorded, handoff doc written before code when missing).
- **Open questions for the owner:** should the skill *refuse* to generate without a
  handoff document, or draft-and-continue when the user says "just build it"? Should
  verify-only re-record automatically or always ask?

### 2. `component-design-review`

- **Enables:** a PR-time review of one component across Figma and code with severities.
- **Triggers:** "review AtlFoo's design", "design review", "design QA", "is the master
  ready", "why does check:figma fail on X", the PR template's Figma section.
- **Output:** the architect's `audit-report-template.md` filled for one component:
  priority list first, each finding with severity and a one-line fix; a human-checks
  section the reviewer answers.
- **Tests:** yes — machine checks are deterministic (matrix vs spec, token binding,
  auto layout, description references spec, inventory tile is an INSTANCE).
- **Eval prompts:** (a) "review the AtlAlert master before I open the PR"; (b) "check:figma
  says AtlProgress has a raw radius — is that real?" (should pin snapshot, verify, and
  consult `FIGMA_CONFORMANCE_EXCEPTIONS` before flagging); (c) out-of-scope: "audit the
  whole file's naming" → architect.
- **Resolved by the cross-check:** folds into `design-to-code` as its review/verify mode; the architect's Audit CD6–CD9 already covers the Figma side per component.

### 3. `spec-to-figma`

- **Enables:** spec block → master `COMPONENT_SET` bound to `Library Tokens`, described,
  annotated, ready-for-dev, on Inventory, snapshot refreshed, `check:figma` green.
- **Triggers:** "put AtlFoo into Figma", "create the master for", "the spec changed,
  update Figma", "Figma is behind the code", "sync tokens to Figma".
- **Output:** node ids created, screenshot verified, `figma:snapshot` diff, `check:figma`
  exit code. Structural changes hand off to the architect's Migrate mode.
- **Tests:** yes, but every run mutates a Figma file — evals need a scratch duplicate.
- **Resolved by the cross-check:** not a skill — a repo-bound Build recipe inside the
  architect (Build already creates component sets; Sync already ends in parity), plus
  `references/plugin-api-gotchas.md` from the Figma section of `tasks/lessons.md`.

### 4. `artboard-bridge` (was `claude-design-handoff`; skill names may not contain "claude")

- **Enables:** intake (artboard sheet → handoff document → `design-to-code`) and publish
  (component → `.dc.html` sheet in the Atelier project via `finalize_plan` → `write_files`
  → `render_preview`).
- **Triggers:** a claude.ai/design URL; "take this artboard into code"; "share AtlFoo as an
  artboard"; "update the Claude Design sheet for".
- **Output:** intake — the handoff document stamped "from Claude Design, unverified
  against Figma"; publish — the durable `open_url`, the registry (`tools/design/artboards.json`)
  updated, `gen-design-status` run.
- **Tests:** intake yes (read-only); publish only against a scratch project.
- **Open questions:** build publish now (blueprint § 8.3)? Which project is the target —
  `7a6a2f19…` (redesign, 31 `.dc.html` sheets) or `019de217…` (design system)? Atelier's system is
  not the account default; the skill must pass `design_system_id` explicitly.

### 5. `design-changelog`

- **Enables:** versions → diff → changelog, blame for "when did this move".
- **Triggers:** "what changed in Figma since", "release notes for the design", "who moved
  the padding on".
- **Output:** markdown changelog section with the REST blind spots stated.
- **Tests:** yes, read-only, cheap. **Resolved by the cross-check:** the architect's Migrate post-flight already logs changes on the Cover page and its taxonomy has a Changelog page; add the diff/changelog/blame tools to its tool map instead of a skill.

## Trigger-set design notes

The should-not-trigger queries in `skills/design-to-code/evals/trigger-eval.json` are near-misses
on purpose: cross-framework changes (`component-trinity`), Figma-side fixes (`spec-to-figma`,
architect), a Storybook-only defect, the Claude Design intake, the changelog — each shares
vocabulary with design-to-code and should lose to a sibling skill. Two should-trigger items
are deliberately awkward: a screenshot instead of a node (the skill should trigger and then
ask for the node, because a picture is the failure mode it exists to catch), and a parity
result the user wants explained (verify slice).
