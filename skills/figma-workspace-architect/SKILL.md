---
name: figma-workspace-architect
description: Designs, builds, audits, and improves Figma workspaces and component libraries via figma-console-mcp so they use the right Figma primitives (Variables with proper scopes, Variants, Component Properties, Auto Layout, slash naming, Modes) and stay maintainable for both designers and downstream code generation. Use this skill whenever the user asks to set up, bootstrap, structure, build, refactor, audit, review, or assess a Figma file, library, design system, token system, component set, or workspace — even if they only mention "tokens", "variables", "components", "variants", "modes", or "design system" without saying "workspace". Also trigger on the bare keyword "Figma" when it is paired with a structural/architectural/audit verb ("fix in Figma", "set up in Figma", "audit Figma", "check Figma", "update Figma to match X"); this catches the common case where the user names the surface ("Figma") rather than the artifact ("the Figma file"). Also use it before running any larger figma_execute, figma_setup_design_tokens, figma_create_variable*, or figma_arrange_component_set call so the agent makes architectural decisions before mutating Figma. Do NOT use this skill for translating Figma designs into code in a repo — that is a code-generation task. Do NOT use it as a substitute for Plugin API mechanics — the agent uses its own knowledge of the Figma Plugin API for `figma_execute` payloads.
---

# Figma Workspace Architect

A skill for using **figma-console-mcp** ([southleft/figma-console-mcp](https://github.com/southleft/figma-console-mcp)) to build, audit, and evolve Figma workspaces that use the right Figma primitives — not just files that *look* right.

The bar this skill sets: a workspace where a designer can find what they need without asking, where Variables have correct scopes, where Variants match the engineering prop API, where Modes carry theming instead of duplicate components, and where naming/page structure is predictable enough that any agent (or human) can navigate it cold.

## When to load this skill

Load this skill when the user is about to:

- **Build** anything structural in Figma — a token collection, a component set, a library scaffold, an icon set, a theme/mode setup
- **Audit / review** an existing Figma file or library and ask what's wrong with it
- **Decide** between architectural options — Variant vs. Component Property, Primitive vs. Semantic Token, separate Components vs. one Variant set, new Mode vs. new Collection

Also load it **before** any of these `figma-console-mcp` write tools, because each one bakes architectural choices into the file:

- `figma_execute` — when the JS payload creates frames, components, or variables
- `figma_setup_design_tokens` — bootstraps an entire token system in one call
- `figma_create_variable_collection`, `figma_create_variable`, `figma_batch_create_variables`
- `figma_add_mode`, `figma_rename_mode`
- `figma_arrange_component_set`
- `figma_set_description` (for components — descriptions are the discoverability layer)

## What this skill is NOT

To keep scope sharp, this skill **does not** cover:

- **Plugin API mechanics for `figma_execute`** — colors as 0–1, `await figma.loadFontAsync`, `appendChild` ordering, etc. Use general Plugin API knowledge for the payload itself.
- **Figma → code translation** — generating React/Vue/Swift from a design. That is downstream of this skill.
- **Console / plugin debugging** (`figma_get_console_logs`, `figma_watch_console`). Those are unrelated workflows.
- **Accessibility and visual-coverage auditing** — the figma-console-mcp built-in *Design System Dashboard* MCP App already scores Naming, Tokens, Components, Accessibility, Consistency, and Coverage. This skill defers A11y and Coverage to that dashboard and focuses on **architectural** depth the dashboard does not reach.

When the user asks something out-of-scope, say so briefly and either point them at the right tool (the dashboard, code-gen workflows) or proceed with general knowledge — do not pretend this skill covers it.

## Four modes — pick one based on the user's intent

### Build mode

Triggered by verbs like *create, set up, bootstrap, scaffold, build, generate, add, refactor*.

Never start writing to Figma directly. Run this loop:

1. **Discovery.** Call `figma_get_file_data` (or `figma_get_variables` + `figma_get_styles` if the file is large) to see what already exists. Read the existing structure before adding to it. Skipping this is the #1 cause of duplicate or conflicting tokens.
2. **Decide.** Resolve every architectural question before any write tool. Use `references/decision-heuristics.md` for the common ones (Variant vs. Property, Token tier, Mode vs. Collection, etc.). If a decision genuinely cannot be made without the user, ask — don't guess.
3. **Map tools.** Pick the right tool for each step using `references/tool-map.md`. Prefer `figma_setup_design_tokens` and `figma_batch_*` over loops of single calls; they are 10–50× faster and atomic.
4. **Execute.** Run the writes. Return all created/mutated node IDs from any `figma_execute` payload — subsequent calls reference them.
5. **Validate.** Call `figma_take_screenshot` on the result. Look for cropped text, wrong scopes (e.g. a color variable showing up in spacing pickers), missing descriptions. Fix issues with targeted follow-ups, not a rebuild.
6. **Document.** Use `figma_set_description` on every Component, Component Set, and shared Style. The description is what designers see in the asset panel and what Dev Mode surfaces — undocumented components are invisible.

The detailed Build playbook is in `references/build-workflow.md`.

#### Scaffold sub-mode — one-shot starter file

Triggered by *scaffold, template, starter, quickstart, bootstrap a new file* (when the user wants a working skeleton in one turn, not an iterative dialogue).

Skip the full Discovery → Decide loop and run a fixed three-call recipe that produces Cover + Tokens + Components pages with placeholder content. The output is a *skeleton* the user is expected to replace, not a finished system. See `references/scaffold-payload.md` for the recipe and the after-scaffold checklist that the agent must hand back to the user.

Use the regular Build loop (not Scaffold) when:
- The user already has a file and wants additions — Discovery first.
- The user has specific values to seed — use those, not the placeholder palette.
- The user wants something polished — Scaffold ships placeholders intentionally.

### Audit mode

Triggered by *audit, review, check, assess, what's wrong with, how good is*.

Two layers, run in this order:

1. **Run the built-in Design System Dashboard MCP App** first if the client supports MCP Apps (Claude Desktop with `ENABLE_MCP_APPS=true`). Ask the user something like "audit the design system" — this gives an immediate Lighthouse-style score across Naming, Tokens, Components, A11y, Consistency, and Coverage. Use this as the **breadth** layer; do not duplicate it.
2. **Run the architectural deep-audit** in `references/audit-checklist.md`. This is the **depth** layer: five categories (Token Architecture, Component Design, Naming, File Structure, Engineering-Sync Readiness), each finding tagged with a severity (Blocker / Critical / Warning / Suggestion) and a concrete fix.

Before writing the report, do the two pre-flight passes called out in the checklist's *Inputs* section: **pin the snapshot** (git SHA + Figma `lastModified`) and **cross-source-grep** any Variable / Variant value you're about to flag. Both are cheap and prevent the most common audit failure mode — findings that were already true at audit time but stale by the time someone acts on them, or findings that look bad in Figma but are actually load-bearing in code with subtly different semantics.

Output the result using `assets/audit-report-template.md`. Always lead with the priority list — Blockers and Criticals at the top, with effort estimates. Do not bury the punchline in a category-by-category walk-through.

#### Re-verify sub-mode — re-check an existing audit

Triggered when an audit report already exists and the user asks "is X still relevant?", "what's actually left?", "re-check this audit", "re-verify before I act", or hands you an audit `.md` more than a few hours old.

Don't redo the full deep-audit. Open `references/audit-verify-queries.md` and run *only* the verify query for each open finding. Emit a `still-open / auto-resolved / state-shifted` line per finding. Update the report's "Re-verify" table with the result (template field at the bottom of `assets/audit-report-template.md`) — drop `auto-resolved` rows from the priority list, and rewrite `state-shifted` rows before acting.

This catches the most common audit failure mode: a stale `.md` directing fixes for findings that have already been resolved or have shifted in shape since audit time.

### Decide mode

Triggered by either/or questions or "should I…" framings. The user is at a fork.

Go straight to `references/decision-heuristics.md`, find the matching decision, give the recommendation **with the reasoning in one or two sentences**, and offer the alternative path with the trade-off. Don't write a treatise — the user is trying to move on.

### Migrate mode

Triggered by *rename, split, restructure, refactor, deprecate, retire, replace* — when the user wants to **change** an existing structure without breaking downstream consumers (designers, code, libraries that depend on this file).

Never run a Breaking operation alone. Open `references/migration-playbook.md` and:

1. Pre-flight: re-discover, snapshot, classify each planned change as Safe / Mostly safe / Breaking.
2. For Breaking changes: enforce the additive coordination protocol (add new shape alongside old → wait one cycle → migrate consumers → remove old). Skipping this is the source of "the design system broke prod" stories.
3. Use the recipes in the playbook for the common patterns: Variable rename, Mode addition, Variant Set split, Primitive→Semantic promotion, Library split.
4. Post-flight: re-audit, diff against the snapshot, update Component descriptions, run the codesync exporter, log the change on the Cover page. **If the change has a downstream visual effect in the consuming code repo** (mode-aware token, contrast-relevant fix, variant rename), run the recipe in `references/code-verify.md` to confirm Figma and code render the same thing in both Light and Dark — Figma alone won't catch decorator wiring or stale CSS-variable bindings.

If the migration is large enough to span sessions, finish each session in a self-contained state — never leave the file mid-restructure overnight.

## Mode routing — quick reference

| User says…                                                      | Mode    | First action                                            |
|-----------------------------------------------------------------|---------|---------------------------------------------------------|
| "create / build / set up / bootstrap…"                          | Build   | `figma_get_file_data` for discovery                     |
| "scaffold / starter / template / quickstart a new file…"        | Build (Scaffold sub-mode) | Open `references/scaffold-payload.md`, run the three-call recipe |
| "audit / review / check / assess / how good is…"                | Audit   | Try Design System Dashboard MCP App; then deep-audit    |
| "is finding X still relevant?", "re-verify this audit…"         | Audit (Re-verify sub-mode) | Open `references/audit-verify-queries.md`; run only the verify queries for open findings |
| "should I use a Variant or…?", "is it better to…?"              | Decide  | Open `references/decision-heuristics.md`                |
| "rename / split / restructure / deprecate / migrate…"           | Migrate | Open `references/migration-playbook.md`; run pre-flight  |
| "verify in code", "check the rendered result", "does dark mode look right…" | Migrate (post-flight) | Open `references/code-verify.md`; run the Storybook recipe |
| "fix this issue…" (specific, after an audit)                    | Migrate | Use the playbook's recipe for the matching operation     |
| "translate this Figma component into code…"                     | (none)  | This is out of scope — point at code-gen workflow       |

## References — load on demand

Each file is self-contained and loaded only when relevant. Don't load everything up front.

- **`references/tool-map.md`** — figma-console-mcp tools grouped by purpose (read, create-tokens, create-components, validate, document). Read first time the agent isn't sure which tool to use. Includes ready-to-use `figma_execute` and `figma_setup_design_tokens` payloads.
- **`references/token-architecture.md`** — three-tier token model (Primitive / Semantic / Component), Modes, Variable Scopes (this is where most setups go wrong), naming, anti-patterns.
- **`references/component-design.md`** — Variants vs. Component Properties vs. Instance Swap, atomic composition, slot patterns, Variant Property naming that matches engineering props.
- **`references/naming-and-file-structure.md`** — slash naming, page layout (Cover / Tokens / Icons / Components / Patterns), `_` and `.` prefixes for unpublished sub-components, library splitting heuristics.
- **`references/build-workflow.md`** — Build mode in depth: discovery checklist, decide gates, validation steps, documentation requirements.
- **`references/audit-checklist.md`** — five architectural categories, severity definitions, per-finding fix template. Includes pre-flight steps for snapshot pinning and cross-source grep.
- **`references/audit-verify-queries.md`** — Re-verify sub-mode. One verify query per audit category with auto-resolve signals; output format for `still-open / auto-resolved / state-shifted` per finding.
- **`references/code-verify.md`** — code-side visual verification recipe. Storybook + browser-automation flow to confirm Figma↔code parity in Light + Dark after token/variant changes. Common traps (stale theme decorators, web-component selectors, HMR caching).
- **`references/decision-heuristics.md`** — decision trees for the recurring forks.
- **`references/code-sync.md`** — keeping Figma Variables in lockstep with code-side tokens (CSS / JSON / framework libraries). Direction-of-truth, sync approaches, mode-mapping pitfalls, drift sources.
- **`references/migration-playbook.md`** — refactoring an existing file safely. Safety classes per operation, the additive coordination protocol, recipes for Variable renames, Mode adds, Variant-Set splits, semantic-tier promotions, and Library splits.
- **`references/iconography.md`** — icon-system architecture. Size stops, internal boxed-model layout, Component-vs-vector heuristic, color-binding (never hardcode fills), naming categories, library-split signals, audit checklist.
- **`references/scaffold-payload.md`** — Scaffold sub-mode recipe. Three-call sequence (`figma_setup_design_tokens` + `figma_execute` + `figma_arrange_component_set`) producing Cover + Tokens + Components pages with placeholder content; after-scaffold checklist for the user.

## Output expectations

- **Audit report** — always use `assets/audit-report-template.md`. Priority list first, then findings by category. Severity tags on every finding. Each finding has a one-line fix.
- **Build summary** — after a build, return what was created (counts: collections, modes, variables, components), what was validated (screenshots taken, descriptions set), and what is left undone (e.g. "Code Connect mappings — out of scope here, see [TODO]").
- **Decision answer** — recommendation in the first sentence, reasoning in the second, the alternative and its trade-off in the third. Stop there.
