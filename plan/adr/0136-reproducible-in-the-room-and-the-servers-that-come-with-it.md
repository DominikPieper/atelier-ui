---
status: accepted
date: 2026-09-13
sources:
  - libs/create-workspace/src/generators/preset/preset.ts (the pin, and the .mcp.json roster)
  - nx.json (the `libraries` release group that makes the pin knowable)
  - .mcp.json (this repo's own roster, the source the two added entries were copied from)
  - libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (the verdaccio registry the pin has to resolve against)
  - plan/adr/0110-pin-the-server-the-skills-hardcode.md (the same argument, made for an MCP server)
---

# ADR-0136: Reproducible in the room, and the servers that come with it

## Status

Accepted 2026-09-13.

## Context

Two questions about what a generated workspace is handed, both answered wrong until now.

**Which version of the components?** The preset wrote `deps['@atelier-ui/<fw>'] = 'latest'`.
In a workshop that is a room where two people scaffolded twenty minutes apart can be on
either side of a publish, holding different component code while following the same
instructions — and the person debugging it is the trainer, live.

**Which MCP servers?** The generated `.mcp.json` carried `nx-mcp`, the one hosted
`storybook-<framework>`, and optionally `figma-console`. This repo's own root `.mcp.json`
carries two more that are not repo-specific at all.

## Decision

**Pin the component package to the preset's own version.** All five packages — the three
adapters, the preset, the CLI — release in lockstep from nx.json's `libraries` group, so
the preset knows the right version without being told: it reads its own `package.json` at
generate time. The same relative path resolves in jest and inside the published tarball,
checked in both. The e2e's verdaccio publishes matching local tarballs, so the pin resolves
there too.

This is ADR-0110's argument applied one level out. There it was an MCP server whose tool
names a skill hardcodes; here it is the component code an instruction sheet describes.

The cost is stated rather than hidden: a workspace scaffolded today stays on today's
components until someone runs `npm install @atelier-ui/<fw>@latest`. The generated
`CLAUDE.md` and `README.md` say so, and say how. **Rejected: a caret range.** It splits the
difference in the worst way — still floating, but only within a window nobody can see, so
the divergence is harder to notice rather than less likely. **Rejected: keeping `latest`
and telling attendees to scaffold at the same time**, which is an instruction the room
cannot follow and the trainer cannot check.

**Add `uianatomy` unconditionally, and `angular-cli` when Angular is the chosen framework.**
`uianatomy` answers "what are this component's parts, axes, slots and states, and where do
the common libraries disagree" — the question a component workspace asks constantly and the
one that is easiest to answer by inventing something plausible. `angular-cli` is
framework-gated because a single-framework workshop should not carry a server for a
framework it does not use; this repo wires it unconditionally only because the monorepo
always has an Angular app.

## Consequences

The `.mcp.json` the docs show and the one the preset writes now agree again —
`docs/src/pages/workshop.astro` hand-maintains a copy of it and had drifted to
`figma-console-mcp@latest` while the preset pinned `1.40.0`. That duplication is unguarded
by any gate and will drift again; it is noted here so the next change to the roster knows
to sweep it.

A release of the component libraries no longer reaches already-scaffolded workspaces on its
own. For a workshop that is the point. For a team that keeps its workspace, it is one
`npm install` they now have to decide to run — which is the same trade every lockfile makes,
made visible in the one file people read.
