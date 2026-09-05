---
status: accepted
date: 2026-09-05
sources:
  - AGENTS.md
  - CLAUDE.md
  - tools/scripts/check-adr-refs.js (EXTRA_SOURCES — the one gate that reads the instruction files)
  - "verified 2026-09-05 against Claude Code's own docs: CLAUDE.md supports `@path` imports, max four hops, imported content loads at launch alongside the importing file; Claude Code does NOT read AGENTS.md natively, with no flag or setting to make it"
  - plan/adr/0083-the-manifest-the-framework-cannot-emit.md (the same instinct applied to a different asymmetry)
---

# ADR-0095: One factual base, three agents

## Status

Accepted. `AGENTS.md` at the repo root holds the repo's facts and is read by
Claude Code, Codex and the Antigravity CLI. `CLAUDE.md` is now a `@AGENTS.md`
import plus the Claude-specific working agreement.

## Context

Three coding agents now run against this repo: Claude Code, Codex (via its MCP
server, used as a second-model cross-check), and the Antigravity CLI for
delegated bulk work. Only `CLAUDE.md` existed, and Claude Code is the only tool
that reads it.

So **Codex and Antigravity ran with none of the repo's conventions**. Neither
knew that `libs/spec/src/index.ts` is the contract, that lint goes through
`nx lint` because the project config is stricter than the raw binary, that a
gate's result is its exit code and a `| tail` always reports zero, that Angular
tests use Testing Library rather than raw `TestBed`, or that decisions get an
ADR. For a cross-check on a finished diff that is survivable; for anything that
writes code it is not.

Some of those facts were worse than absent — they lived only in one agent's
private memory, which means they were unavailable to the other two by
construction and invisible to anyone reading the repo.

Verified before designing anything, rather than assumed: Claude Code does **not**
read `AGENTS.md` natively — no flag, no setting — but `CLAUDE.md` supports
`@path` imports, resolved relative to the importing file, expanded into context
at launch, up to four hops. Claude Code's own documentation names this exact
situation and prescribes the import.

## Decision

**Split by kind, not by tool.** Three categories, and the third is the one that
matters most:

1. **Facts about the repo → `AGENTS.md`, shared.** The design-to-code loop, the
   spec as source of truth, the MCP surfaces, the Figma file and its page
   conventions, testing conventions, how a gate is run and read, the ADR
   convention, the task record. An agent getting these wrong is pure loss; there
   is no upside to Codex inventing a prop or trusting a piped exit code.

2. **How a given agent organises itself → its own file.** Plan-mode default,
   subagent strategy, the self-improvement loop, model roles. Meaningless to a
   one-shot cross-check, and actively misleading if it implies Codex should be
   spawning subagents.

3. **The current task's framing and conclusions → never shared, with anything.**
   This is the constraint that shapes the split. Codex earned its keep on first
   use by finding a false comment about `check:sync`, a `.mcp.json` recovery
   message that told a clone user to scaffold a workspace, and an `existsSync`
   check that is true for a regular file as well as a directory — **two of those
   were the framing in the brief it was given**. A cross-check is worth having
   exactly to the extent that it does not share your reasoning. A shared
   instruction base that carried interpretation as well as fact would correlate
   the blind spots and quietly convert the Gegenprobe into an echo.

**No duplication, therefore no sync gate.** Two files holding the same facts
would drift, and this repo's reflex is to build a gate that detects drift. Here
prevention is available: `CLAUDE.md` imports rather than copies, so there is one
copy and drift is structurally impossible. Prefer that over detecting it — the
opposite conclusion from ADR-0092's host guards, where prevention was *not*
available and only a gate could close the hole. The question is always which of
the two the situation actually permits.

**Alternatives rejected:**

- *Two files kept in sync by `check:agents-sync`.* Detects a problem that need
  not exist. A gate is the answer when duplication is unavoidable; here it is
  avoidable.
- *`ln -s AGENTS.md CLAUDE.md`.* Simplest, and it forecloses category 2 — there
  would be nowhere to put Claude-specific content without leaking it to the
  other agents.
- *Leave it and brief Codex per call.* What was already happening. It puts the
  repo's conventions into whatever the caller remembers to type, which is the
  same failure mode as conventions living in one agent's private memory.

## Consequences

- Codex and Antigravity now read the repo's conventions without anyone pasting
  them into a prompt. Antigravity's `--dir <repo-root>` mode in particular exists
  to read `AGENTS.md`, and until now found nothing there.
- Facts that lived only in an agent's private memory — the Angular Testing
  Library convention, `nx lint` over the raw binary, exit codes over pipes — are
  in the repo, where they are reviewable and outlive any one session.
- `tools/scripts/check-adr-refs.js`'s `EXTRA_SOURCES` gains `AGENTS.md`; the ADR
  convention text moved there, and an unscanned file is a gate that stopped
  looking at what it was written for.
- The docs site is unaffected. `docs/src/pages/claude-md.astro` ships its own
  `TEMPLATE` for participants to drop into *their* projects and never reads this
  repo's `CLAUDE.md`, so the workshop material does not change.
- MCP server configuration stays per-tool and is deliberately not unified.
  `.mcp.json` is Claude Code's; Codex has its own config. For the role Codex
  plays here — a second opinion on a diff — it needs neither Figma nor
  Storybook, and wiring them would be cost without use.
- New risk, stated plainly: a fact written into `AGENTS.md` now reaches agents
  whose behaviour is not observed in this session. A convention that is wrong
  there is wrong in three places at once.
