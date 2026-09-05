@AGENTS.md

# Claude Code — working agreement

`AGENTS.md`, imported above, holds the facts about this repo: the design-to-code
workflow, the spec as source of truth, the MCP servers, the Figma conventions,
the ADR rules, and how work is proven done. It is shared with every other coding
agent used here (Codex, the Antigravity CLI), so it must stay free of anything
that is only true for one of them.

This file holds the part that is specific to how *you* work. Do not duplicate
`AGENTS.md` content here — a second copy drifts, and there is no gate that would
catch it.

## 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

## 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- **Hand a subagent the artefact and the question, never your conclusion.** A
  brief's "central constraint" is the sentence most worth verifying before you
  send it, because the agent will build around it instead of questioning it.

## 3. Second-model cross-check
- The Codex MCP server is available as a Gegenprobe for judgement-heavy calls:
  hand it the finished diff and the environment facts, and ask it the question.
- **Never hand it your reasoning.** Its value is that it does not share your
  framing — on its first use it found three real defects, two of which *were*
  my framing. A shared instruction base carrying your interpretation would
  correlate the blind spots and waste the check.
- You stay the final judge. Agents also report incorrect results; verify a
  claim that changes your conclusion before acting on it.

## 4. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

## 5. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## 6. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it
- Before "done": re-read the diff as a hostile reviewer, and name the weakest
  point of your own solution unprompted

## 7. Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## 8. Model roles
See the standing rule in the user-level configuration: when running as a model
larger than Sonnet, orchestrate rather than edit — research, decompose, write
tight specs, spawn Sonnet agents for code changes, then verify (run the gates,
read the diff as a hostile reviewer) and report. Docs, ADRs, plans and the task
record may be written directly.
