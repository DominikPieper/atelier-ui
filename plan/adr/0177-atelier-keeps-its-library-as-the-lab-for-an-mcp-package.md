---
status: accepted
date: 2026-10-21
supersedes: plan/adr/0165-the-workshop-teaches-on-the-conciso-design-system.md
sources:
  - owner decisions, 2026-10-21 (this session)
  - conciso-design-system docs/adr/0012-mcp-server-fuer-consumer.md (the package this one is modelled on)
  - conciso-design-system docs/agents/mcp-eval.md and packages/mcp/eval/ (the with/without eval)
  - plan/adr/0174-component-knowledge-is-a-generated-projection.md, plan/adr/0176-manifest-description-starts-with-purpose.md (knowledge Atelier already owns)
---

# ADR-0177: Atelier keeps its own library and becomes the lab for a design-system MCP package

## Status

Accepted. Recorded at decision time. Supersedes ADR-0165. Nothing is built yet; the plan is in
`tasks/todo.md` under "Atelier MCP package".

## Context

ADR-0165 moved the workshop onto the Conciso Design System (CDS) because Atelier's library had no
users besides the workshop, so work on it helped nobody else. The migration was paused on
2026-10-12 for the first cohort (end of November 2026), which runs on Atelier's library anyway.

Since then three things weigh differently:

- **Change speed.** Atelier's library is ours to change in an afternoon; the CDS has its own team,
  release chain and review. An experiment that needs to reshape components, metadata or docgen
  output to learn something is slow there and fast here.
- **The CDS shipped a consumer MCP package** (`@conciso/design-system-mcp`, CDS-ADR-0012): a stdio
  server over a Storybook manifest snapshot of the same commit, lockstep-versioned with the Angular
  lib, with hard rules in its `instructions` and a with/without-server eval run through
  `claude -p`. It encapsulates the API layer (`docs-list`/`docs-show`/`docs-show-story`) and
  nothing more.
- **Atelier already owns more agent-facing knowledge than that**, spread over several surfaces:
  `purpose` in the manifest (ADR-0176), the knowledge projection with behaviours, contract
  mismatches and token intent (ADR-0174), the contracts themselves, `--ui-*` tokens with lint
  rules. What none of it has is a measurement of which layer actually helps an agent.
- **Atelier's hosted MCP endpoints have the defect CDS-ADR-0012 rejected:** they answer with
  `main`, not with the version a consumer installed. And the owner reports that their Cloudflare
  throughput is a recurring problem.

## Decision

1. **Atelier keeps its own component library.** It is no longer a stand-in to be replaced, but the
   lab where design-system practices for AI agents are tried and measured. The workshop keeps
   teaching on it. ADR-0165's migration (P0b, P1.5–P6) is dropped.
2. **The CDS becomes a transfer target, not a substrate.** What the lab proves is written up as a
   best practice, framed design-system-neutral, and offered to the CDS. Each transfer into the CDS
   repo still needs the owner's go, and the CDS team decides.
3. **A new package `@atelier-ui/mcp`**, modelled on CDS-ADR-0012: stdio, a manifest snapshot built
   from the same commit, lockstep with the library packages, `instructions` with the hard rules.
   Angular first; the server core stays framework-neutral so React/Vue snapshots can follow once
   the pattern holds.
4. **Knowledge goes in layer by layer, each layer measured.** An eval in the CDS's with/without
   form, extended to an ablation: the same question set against the server with and without each
   layer (API, purpose, tokens and styling rules, contract mismatches, anatomy and a11y,
   composition and anti-patterns, `instructions`). A practice enters the catalog with its measured
   effect and its cost (tokens, snapshot size), not on plausibility. Eval runs count against the
   owner's subscription quota, not per-call API billing, so run count is not the constraint;
   run-to-run variance is, so each comparison repeats enough to beat noise.
5. **The package replaces the hosted Storybook MCP endpoints.** They are removed once the package
   covers what they answer and the scaffold and docs point at it. Not before the first cohort
   unless the R-040 rehearsal already runs on the package, because the participant setup is on the
   course's critical path.
6. **The contract tool stays in Atelier.** `@conciso/design-contracts` is renamed to
   `@atelier-ui/contracts` and loses the "move to the CDS" plan. It stays design-system-neutral
   (non-Atelier fixture, prefixes from config), because the method is taught for participants' own
   systems; the CDS can adopt it later as a transfer like any other practice.

### Why

- **Leverage now comes from transfer**, which answers ADR-0165's main argument: work in the lab
  reaches a system with real users through the catalog, at the lab's speed.
- **Measuring before building.** The CDS's eval already showed the method works; an ablation turns
  "how much can we encapsulate" from opinion into data.
- **One version-exact source** instead of a hosted endpoint that serves `main` and struggles with
  throughput.

### Rejected

- **Continue the CDS migration (ADR-0165).** Slower to experiment on, and its main benefit,
  leverage, is reachable through transfer.
- **Build the MCP package in the CDS directly.** Every experiment would go through another team's
  review; the CDS gets the proven result instead.
- **Keep the hosted endpoints next to the package.** Two surfaces to keep in sync, one of them
  version-inexact and throughput-limited.
- **Add all knowledge layers at once.** Cheaper to build, but then no layer's effect is known and
  nothing transferable is learned.

## Consequences

- `tasks/todo.md`: the ADR-0165 section is closed as superseded; a new "Atelier MCP package"
  section holds the steps. `tasks/reviews.md` rows that waited on the CDS migration need a triage.
- Removing the hosted endpoints touches the worker, ADR-0173 (endpoints stay public), the
  scaffold's `.mcp.json`, `AGENTS.md`'s hosted-surface table and the docs pages that cite the
  hosted URLs. That correction lands with the removal, not now.
- `@atelier-ui/{angular,react,vue}` are not deprecated.
- A best-practice catalog becomes a maintained artefact; without a fixed transfer step it is only
  a document, and Atelier and the CDS drift apart.
- **Weakest point:** the eval measures one question set with one model. A layer that wins there
  may only fit those questions; the catalog must say which questions a practice was proven on.
