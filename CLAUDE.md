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
- **Component Discovery & Docs**: Use the framework-specific **Storybook MCP servers** for exact component specs:
  - `storybook-angular` MCP: High-fidelity documentation for Angular components.
  - `storybook-react` MCP: Full support including previews and story tests for React.
  - `storybook-vue` MCP: Full support including previews and story tests for Vue.

### Storybook MCP Workflows

**When creating or editing components/stories:**
1. Call `get-storybook-story-instructions` before writing any code
2. After any change, call `preview-stories` and include the returned URLs in your response
3. Run `run-story-tests` after each change — fix failures before reporting completion

**When reading component docs:**
1. Call `list-all-documentation` once at session start to get valid IDs
2. Use `get-documentation` with those IDs — never guess IDs or invent props
3. If a prop isn't documented, say so rather than inventing it

**Which MCP to use:**
- Angular components → `storybook-angular` MCP
  - *Supported Tools*: `list-all-documentation`, `get-documentation`
  - *Status*: Documentation only; previews and tests coming soon.
- React components → `storybook-react` MCP
  - *Supported Tools*: Full support (`preview-stories`, `run-story-tests`, `get-storybook-story-instructions`, etc.)
- Vue components → `storybook-vue` MCP
  - *Supported Tools*: Full support (`preview-stories`, `run-story-tests`, etc.)

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Big Picture
- The project idea are in `plan`

---

## Component Documentation

**Do not add component API documentation to this file.** Use the Storybook MCP servers instead:
- Angular components → `storybook-angular` MCP (`list-all-documentation`, `get-documentation`)
- React components → `storybook-react` MCP (`list-all-documentation`, `get-documentation`)

The Storybook MCP servers are the authoritative source for component props, variants, and usage examples. Always query them rather than relying on inline docs here.

---
