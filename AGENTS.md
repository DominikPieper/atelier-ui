# Atelier — how to work in this repo

Read by every coding agent used here: Claude Code (via the `@AGENTS.md` import in
`CLAUDE.md`), Codex, and the Antigravity CLI. It holds the **facts about this
repo** — what is true, where the truth lives, and how work is proven done.

How a particular agent should organise its own work does not belong here.
Claude Code's working agreement lives in `CLAUDE.md` beside the import.

Atelier teaches **design-to-code with AI**: a Figma design becomes a working,
verified component. The library is implemented in three frameworks (Angular,
React, Vue) behind one framework-agnostic spec, but **any given workshop uses
exactly one framework** — the other two adapters are reference/prep
infrastructure kept in sync by the drift gates, not something you touch in a
session. Optimise for the single chosen framework's path.

## Design-to-Code Workflow

The core loop — Figma → spec → code → verify, in your chosen framework:

1. **Inspect** the Figma component: `figma_get_component_for_development`
   (figma-console-mcp) on the node, or read the master on the Components page of
   file `QMnDD8uZQPldPrlCwZZ58T`. Note its variants, `--ui-*` tokens, and a11y.
2. **Spec** is the naming contract: `libs/spec/src/index.ts` (+ `metadata/`,
   `tokens.manifest.ts`, `behaviors.json`). It carries prop names, string-literal
   unions and intent — not defaults, descriptions, events beyond `on*Change`, slots or
   behaviour; those live in the adapters, the stories, `docs/src/data/components.ts`
   and the handoff document. All three adapters are drift-gated against it
   (`check:props`, with recorded exemptions), which is what keeps prop and variant
   names identical; the compiler binds only React (ADR-0093).
3. **Generate or edit** the component with your agent, using the Storybook MCP for
   exact component docs (see the table below). **All three hosted endpoints answer
   component lookups natively** — each framework emits its own `components.json`
   (Angular via `angular-component-meta`, Vue via `vue-component-meta`, React via
   `react-docgen`; ADR-0097). Variants, defaults and state props come back shaped
   for the framework you're in: two-way `[(checked)]` bindings and split
   Inputs/Outputs for Angular, `v-model`/`update:*` events and typed slots for Vue,
   JSX/`children`/`on*Change` for React. `libs/spec/src/index.ts` is still the
   contract all three adapters are drift-gated against, so a prop *name* or *axis
   value* the docs leave ambiguous is settled there. It cannot settle binding
   *shape* — two-way vs. one-way, slot vs. prop, an event's payload — because the
   format does not express those; for shape the framework's own manifest is the
   answer, and `check:props` maps `on<X>Change` to Angular `model()` / Vue
   `update:*` for you.
4. **Verify** — run the story in Storybook, then close the loop with
   `figma_check_design_parity` to catch padding/colour/variant drift. **Required,
   not optional.**

Full walkthrough: docs `/design-to-code`; hands-on kata: `/first-component`.
Run the docs app with `nx serve docs`.

## MCP Servers

Always use the appropriate server for the task:

- **Nx & Workspace Management**: the **Nx MCP server**. Note this repo does not
  configure Nx Cloud, so its `ci_information` / `ci_task_output` tools cannot
  authenticate; `nx_docs` is the usable one. Reach CI state through `gh` instead.
- **Angular-Specific CLI**: the **Angular CLI MCP server** for Angular best practices, API searches, examples.
- **Component Discovery & Docs**: the framework-specific **Storybook MCP servers** for exact component specs. Storybook ships MCP in two layers (added in 10.4, tool surface renamed and manifests made framework-native in the pinned 10.6.0) — be explicit about which surface you're calling.
- **Component Anatomy & Cross-Framework Mapping**: the **`uianatomy` MCP server** (HTTP at `https://uianatomy.dev/mcp`, 29 tools) for canonical component anatomy, axes, slots, transitions, motion, tokens, events, and library divergences (41 components; per-library `implementations/` audits across radix, headlessui, cdk, react-aria, vaul). Pair with the bundled `uianatomy-mcp` skill at `.claude/skills/uianatomy-mcp/SKILL.md`.

`.mcp.json` at the repo root wires these for Claude Code. Other agents configure
their own MCP servers; nothing in this repo does it for them.

### Storybook MCP Workflows

**Two MCP surfaces (do not conflate):**

| Surface | URL | Toolsets exposed | Frameworks |
|---|---|---|---|
| **Hosted** (`@storybook/mcp` via Cloudflare Worker, reads static manifests) | `atelier.pieper.io/storybook-{angular,react,vue}/mcp` | `docs` only: `docs-list`, `docs-show`, `docs-show-story` | All three, natively — Angular's `components.json` comes from `angular-component-meta`, Vue's from `vue-component-meta`, React's from `react-docgen` (ADR-0097). Each answers component lookups shaped for its own framework: two-way bindings and split Inputs/Outputs for Angular, `v-model`/`update:*` and typed slots for Vue, unchanged JSX/`children` for React. |
| **Local dev** (`@storybook/addon-mcp` inside a running Storybook) | `http://localhost:<port>/mcp` (after `nx storybook <fw>` — this repo binds 4400 angular / 4401 react / 4402 vue; read the exact port from the terminal) | `docs` + `dev` (`stories-preview`, `get-storybook-story-instructions`, `stories-changed`, plus the conditionally registered `stories-find-by-component` and `display-review`) + `test` (`test-run`) | All three: under 10.6, `tools/list` against a locally-run Angular or Vue Storybook returns the same eight-tool surface as React — no longer React-only in preview. |

**Toolset gating** (addon-mcp options, all default `true`): `docs` requires the `componentsManifest` feature flag — addon-mcp's own preset switches it on, and it is the flag core-server reads when writing the manifest — plus an actually emitted `components.json`. React gets this for free (`react-docgen` is its default docgen path); Angular and Vue need `experimentalDocgenServer` — the default under `@storybook/angular-vite`, opt-in until Storybook 11 for `@storybook/vue3-vite` — and this repo sets it explicitly for both rather than resting on the current default. Inside `dev`, `stories-preview` and `get-storybook-story-instructions` need nothing extra; `stories-changed` and `display-review` need `features.changeDetection` (10.4's Change Review sidebar), and `display-review` additionally needs `experimentalReview` not set to `false`; `stories-find-by-component` needs a builder that exposes the module-graph service. `test` requires `@storybook/addon-vitest`; a11y in `test-run` activates when `@storybook/addon-a11y` is installed.

Add a local entry when you need the `dev` / `test` toolsets. **Angular/Vue prop tables come back from their own hosted endpoint, natively — ADR-0097 supersedes ADR-0083's React-manifest fallback, which is deleted, not shrunk; `libs/spec/src/index.ts` stays the naming contract inside this repo.**

**When reading component docs (any framework, any surface):**
1. Call `docs-list` once at session start to get valid IDs (set `withStoryIds: true` if you need story IDs for downstream tools; pass `storybookId` to scope multi-source setups)
2. Use `docs-show` with those IDs — never guess IDs or invent props; subcomponent docs are included since `@storybook/mcp@0.7.0`
3. Call `docs-show-story` only when `docs-show` lacks the story-level detail you need
4. If a prop isn't documented, say so rather than inventing it

**When creating or editing components/stories (React, local dev only):**
1. Call `get-storybook-story-instructions` before writing any code (REQUIRED before touching `*.stories.*` files)
2. After any change, call `stories-preview` and include the returned `previewUrl`s in your final response; in MCP-Apps-capable hosts the addon also exposes a `ui://stories-preview/preview.html` resource that embeds the previews directly
3. Use `stories-changed` to enumerate new/modified/affected stories from the Change Review sidebar before bulk edits
4. Run `test-run` after each change (pass `{ stories: [...] }` for focused runs, omit for full suite; `a11y: false` to skip accessibility checks) — fix failures before reporting completion

For Angular/Vue, the test loop is `nx test <lib>` (Vitest) plus a manual browser preview in the running Storybook.

## Component Documentation

The primary documentation for the component library lives in the `docs/` application and the `libs/spec` library (which defines the framework-agnostic API contract).

**Do not add component API documentation to this file.** Use the following sources instead:
- **Interactive Docs**: Run the `docs` app (`nx serve docs`) for framework-specific API tables and live demos.
- **Spec Library**: Refer to `libs/spec/src/index.ts` for the ground-truth API definitions.
- **Storybook MCP**: See the "Storybook MCP Workflows" table above for the hosted vs. local surfaces and their tools.

## Figma File (Atelier UI)

File key: `QMnDD8uZQPldPrlCwZZ58T`. Page conventions:

- **Components page** = master `COMPONENT_SET`s with full variant matrix. Source of truth.
- **Inventory page** = condensed catalog. Every tile is an `INSTANCE` of a master on Components — never duplicate by hand.
- When adding a new master: also add one `INSTANCE` on Inventory and bump the TOC count + date.
- When removing a master: instance auto-deletes; bump TOC.

## Testing

- **Angular unit tests use Angular Testing Library** (`@testing-library/angular`) —
  `render()` and `screen`, never raw `TestBed` / `ComponentFixture`. React and Vue
  use their Testing Library equivalents.
- `@testing-library/jest-dom` matchers (`toBeInTheDocument()`, `toHaveAttribute()`)
  are globally available via each lib's `test-setup.ts`.
- Runner: Vitest (`@analogjs/vitest-angular` for Angular). Run a library's suite
  with `nx test <lib>`.
- Behaviour that matters gets a test that pins it down, written with the code —
  not afterwards as decoration.

## Verifying that something works

- **Lint through Nx, not the raw binary**: `nx lint <project>`. The project config
  is stricter than a bare `npx eslint` run, so a clean raw run proves nothing.
- **A gate's result is its exit code.** Run it as `cmd > /tmp/out 2>&1; echo $?`
  and read the file afterwards. Piping into `head`/`tail`/`grep` reports the
  *pipe's* status, which is always `0` — that silently converts a failure into a
  pass, and has already put a false "all gates green" claim into this repo's
  history.
- `npm run check:all` runs the full gate chain. Every gate in it is offline
  and deterministic; that is why `check:release-drift`, which asks the npm
  registry, is deliberately **not** in the chain. (Its exact gate count is
  intentionally not stated here — it moves with every gate added or split,
  and has gone stale in this file four times already; read `check:all` in
  `package.json`, or the derived count on the `docs/src/pages/claude-design.astro`
  diagram, if you need the number.)
- **Every story is a test.** `npm run check:stories` (`nx run-many -t storybook-test`,
  also the last gate in `check:all` and its own CI job) renders every story of all three
  libraries in Chromium through `@storybook/addon-vitest`, runs each `play` function's
  assertions, and runs axe with `parameters.a11y.test: 'error'`. A story that stops
  rendering, a `play` that stops holding, or a new axe violation is a red build. Run one
  framework with `nx run <fw>:storybook-test`; the three share Vitest's browser port, so
  never run two at once. The hosted base path is set by `BUILD_STORYBOOK=1` only — never
  key anything in `.storybook/main.ts` on `CI`, the test server is also CI (ADR-0122).
- Local gates say nothing about the release pipeline. "All gates pass" is a
  statement about the checks that exist here, not about what reached npm — check
  CI and the registry separately (`gh run list`, `npm run check:release-drift`).
- Never mark a task complete without proving it works. Separate what you
  *verified* from what you *assumed* when you report.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
- **Big Picture**: the project idea / plan docs live in `plan/`.

## Decision Records (ADR)

When a non-trivial decision is made, record it as an ADR so the *why* stays
traceable and reusable later (blog posts, talks, teaching). `plan/adr/` is the
canonical decision log.

**Record an ADR when** you choose one approach over alternatives, set a
convention, change the architecture / spec contract / API shape, the tooling &
gates, the design-system & tokens, the Figma→code workflow, or build/release —
i.e. any tradeoff with a rationale worth keeping. **Skip it** for trivial or
mechanical work (typos, renames, dependency bumps, routine bugfixes).

How:
1. Create `plan/adr/NNNN-kebab-title.md` with the next sequential number.
2. Follow the MADR format already in `plan/adr/`: YAML frontmatter
   (`status: accepted`, `date: <YYYY-MM-DD>`, `sources`, optional
   `supersedes`/`superseded-by`) + sections `## Status`, `## Context`,
   `## Decision`, `## Consequences`. New ADRs are recorded-at-the-time, so they
   need no `confidence` field (that marks the older reconstructed records).
3. Capture the reasoning richly — the forces/context, the decision, **why**
   (and which alternatives were rejected and why), and the consequences/
   tradeoffs. That "why" is the content that gets reused later.
4. Add a row to the `plan/adr/README.md` index. If the decision reverses an
   earlier one, set `supersedes` here and flip the old ADR's `status:` to
   `superseded`.
5. Write the ADR as part of finishing the decision-bearing task (same bar as
   "verifying that something works"), not retroactively.

An ADR is a record of what was decided *and* of what the deciders believed:
Context/Decision/Consequences stay immutable, corrected only by a dated
in-place "**Corrected YYYY-MM-DD**" paragraph, never by editing the error away.

That protects the decision, not every sentence inside it. A sentence stating
**current operational state** — what's in `check:all`, a version pin, a
feature-flag default — decays on its own schedule, independent of the decision
that motivated it; point at its live source instead of restating it as prose,
or it goes stale silently. And a newer ADR that claims to revise, correct or
supersede §N of an older one has not actually revised it until that correction
is written *into* the older ADR, **in the same commit** — `check:adr-refs`
enforces this, so a claim with nothing on the other end fails the build rather
than sitting unread the way ADR-0019 §5 and ADR-0024 §4 did.

Deeper rationale lives in `plan/big-picture.md`, `plan/design-principles.md`,
and `tasks/rationale.md` — cross-link rather than duplicate.

## Task record

- `tasks/todo.md` — the running plan and status. Open work is a checkbox item;
  finished work keeps its reasoning.
- `tasks/lessons.md` — accumulated correction patterns. Add to it after a
  correction, so the same mistake gets harder to repeat.
- Convert relative dates to absolute ones when writing either.
