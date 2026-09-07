---
status: accepted
date: 2026-09-07
sources:
  - skills/figma-workspace-architect/SKILL.md ("What this skill is NOT" — the only place the exclusion was recorded)
  - plan/adr/0019-figma-conformance-gate.md (name alignment as a Blocker in `check:figma`)
  - plan/adr/0024-design-parity-persistence-gate.md
  - plan/adr/0097-the-manifest-the-framework-can-emit-now.md (Storybook MCP manifests as the agent-facing contract)
  - plan/research/design-skills-2026-09-07/03-figma-architecture-web.md § 5 (Code Connect requires Organization/Enterprise seats; maintained targets)
  - plan/design-skills-blueprint.md § 4.3, § 8 decision 5
  - https://github.com/figma/code-connect
---

# ADR-0111: The contract is the name, not Code Connect

## Status

Accepted.

## Context

Figma's Code Connect maps a Figma component to its production implementation so Dev Mode
and the official Dev Mode MCP server show true-to-production snippets instead of
generated approximations. Current practice guides treat it, together with the official
MCP server, as *the* design-to-code contract. It requires Organization or Enterprise
seats, a mapping file per component (`Button.figma.ts` or the framework-agnostic config),
and the official Figma toolchain.

This repo standardised on figma-console-mcp instead — for write access through the
Desktop Bridge, variables on any plan, and the audit/parity tools — and the
`figma-workspace-architect` skill says so in one sentence under "What this skill is NOT":
Code Connect and the Dev-Mode MCP are out of scope by explicit user constraint, and the
bridge to code is naming alignment alone. A constraint that lives only inside a skill's
text disappears with the skill's next refactor, and the design-skills research
(2026-09-07) had to rediscover it.

The repo already has a contract that does the job Code Connect would do, gated offline:

- `COMPONENT_SET` names and variant property names/values equal the spec's selectors and
  string-literal unions — a Blocker in `check:figma` (ADR-0019).
- The agent-facing prop tables come from each framework's own Storybook manifest,
  drift-gated against the spec (ADR-0097).
- Visual parity is proven per component and its inputs hashed (ADR-0024, ADR-0104).

## Decision

Code Connect and the official Dev Mode MCP server stay out of this repo's toolchain. The
design-to-code contract is: **name alignment gated by `check:figma`, the spec as ground
truth, Storybook manifests as the agent's prop source, parity as the proof.** Skills
that need "which code does this Figma component map to" answer it from the spec and the
Storybook MCP, not from a Code Connect mapping.

Alternatives considered:

- **Adopt Code Connect alongside figma-console-mcp.** Rejected: it needs a plan tier the
  workshop cannot assume in every room, it adds a second mapping layer (`*.figma.ts`)
  that would itself need a drift gate against the spec, and its payoff — snippets inside
  Dev Mode — serves a designer reading Figma, not an agent reading the spec.
- **Switch to the official Dev Mode MCP server.** Rejected: read-mostly, no Desktop
  Bridge writes, variables gated by plan; the three-framework rig and the Figma build
  tooling depend on the write path.

## Consequences

- Designers in Dev Mode see Figma's generated snippets, not Atelier's real code. The
  compensation is the Storybook link on each master and the description naming the spec
  interface.
- Skills may state the exclusion by pointing here instead of restating it.
- Revisit trigger: an Organization plan for the workshop *and* a Code Connect config that
  could be generated from `libs/spec` (so it is a projection, not a second source) would
  reopen this. Until then, a request for Code Connect gets this ADR as the answer.
