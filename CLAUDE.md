## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## MCP Servers

This project provides several MCP servers to assist in development. Always use the appropriate server for your task:

- **Nx & Workspace Management**: Use the **Nx MCP server** for understanding project dependencies and running workspace tasks.
- **Angular-Specific CLI**: Use the **Angular CLI MCP server** for Angular-specific best practices, API searches, and examples.
- **Component Discovery & Docs**: Use the framework-specific **Storybook MCP servers** for exact component specs. Storybook 10.4 ships MCP in two layers — be explicit about which surface you're calling.
- **Component Anatomy & Cross-Framework Mapping**: Use the **`uianatomy` MCP server** (HTTP at `https://uianatomy.dev/mcp`, 29 tools) for canonical component anatomy, axes, slots, transitions, motion, tokens, events, and library divergences (41 components; per-library `implementations/` audits across radix, headlessui, cdk, react-aria, vaul). Pair with the bundled `uianatomy-mcp` skill at `.claude/skills/uianatomy-mcp/SKILL.md` for trigger guidance.

### Storybook MCP Workflows

**Two MCP surfaces (do not conflate):**

| Surface | URL | Toolsets exposed | Frameworks |
|---|---|---|---|
| **Hosted** (`@storybook/mcp` via Cloudflare Worker, reads static manifests) | `atelier.pieper.io/storybook-{angular,react,vue}/mcp` | `docs` only: `list-all-documentation`, `get-documentation`, `get-documentation-for-story` | React: components + docs. Angular/Vue: **docs (MDX foundation pages) only** — Storybook 10.4 only emits `components.json` for React. |
| **Local dev** (`@storybook/addon-mcp` inside a running Storybook) | `http://localhost:6006/mcp` (after `nx storybook <fw>`) | `docs` + `dev` (`preview-stories`, `get-storybook-story-instructions`, `get-changed-stories`) + `test` (`run-story-tests`) | React: preview-supported. Vue/Angular: experimental per Storybook 10.4 — may not work. |

**Toolset gating** (addon-mcp options, all default `true`): `dev` requires nothing extra. `docs` requires the `experimentalComponentsManifest` feature flag + emitted `components.json` (React only as of 10.4). `test` requires `@storybook/addon-vitest`; a11y in `run-story-tests` activates when `@storybook/addon-a11y` is installed. `get-changed-stories` activates when `features.changeDetection` is on (Storybook 10.4 Change Review sidebar).

The `.mcp.json` at the repo root wires the hosted surface for all three frameworks. Add a local entry when you need preview / test tools or per-component data on Angular/Vue. For Angular/Vue prop tables, fall back to the React MCP as cross-framework API reference (the spec contract is identical) or read `libs/spec/src/index.ts` directly.

**When reading component docs (any framework, any surface):**
1. Call `list-all-documentation` once at session start to get valid IDs (set `withStoryIds: true` if you need story IDs for downstream tools; pass `storybookId` to scope multi-source setups)
2. Use `get-documentation` with those IDs — never guess IDs or invent props; subcomponent docs are included since `@storybook/mcp@0.7.0`
3. Call `get-documentation-for-story` only when `get-documentation` lacks the story-level detail you need
4. If a prop isn't documented, say so rather than inventing it

**When creating or editing components/stories (React, local dev only):**
1. Call `get-storybook-story-instructions` before writing any code (REQUIRED before touching `*.stories.*` files)
2. After any change, call `preview-stories` and include the returned `previewUrl`s in your final response; in MCP-Apps-capable hosts the addon also exposes a `ui://preview-stories/preview.html` resource that embeds the previews directly
3. Use `get-changed-stories` to enumerate new/modified/affected stories from the Change Review sidebar before bulk edits
4. Run `run-story-tests` after each change (pass `{ stories: [...] }` for focused runs, omit for full suite; `a11y: false` to skip accessibility checks) — fix failures before reporting completion

For Angular/Vue, the test loop is `nx test <lib>` (Vitest) plus a manual browser preview in the running Storybook.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Big Picture
- The project idea are in `plan`

---

## Component Documentation

The primary documentation for the component library lives in the `docs/` application and the `libs/spec` library (which defines the framework-agnostic API contract).

**Do not add component API documentation to this file.** Use the following sources instead:
- **Interactive Docs**: Run the `docs` app (`nx serve docs`) for framework-specific API tables and live demos.
- **Spec Library**: Refer to `libs/spec/src/index.ts` for the ground-truth API definitions.
- **Storybook MCP**: See the "Storybook MCP Workflows" table above for the hosted vs. local surfaces and their tools.

---

## Figma File (Atelier UI)

File key: `QMnDD8uZQPldPrlCwZZ58T`. Page conventions:

- **Components page** = master `COMPONENT_SET`s with full variant matrix. Source of truth.
- **Inventory page** = condensed catalog. Every tile is an `INSTANCE` of a master on Components — never duplicate by hand.
- When adding a new master: also add one `INSTANCE` on Inventory and bump the TOC count + date.
- When removing a master: instance auto-deletes; bump TOC.

---
