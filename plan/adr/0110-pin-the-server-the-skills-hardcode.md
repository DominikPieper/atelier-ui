---
status: accepted
date: 2026-09-07
sources:
  - .mcp.json (figma-console entry, previously `figma-console-mcp@latest`)
  - skills/figma-workspace-architect/SKILL.md and references/ (~70 hardcoded `figma_*` tool names)
  - plan/research/design-skills-2026-09-07/01-figma-console-tool-inventory.md (99 tools, repo reference counts)
  - plan/research/design-skills-2026-09-07/05-figma-console-mcp-docs-and-skill-authoring.md (v1.40.0, 2026-08-16; seven `ds_*` tools added in that release)
  - plan/design-skills-blueprint.md § 4.1, § 5.7, § 8 decision 4
  - https://github.com/southleft/figma-console-mcp/blob/main/CHANGELOG.md
---

# ADR-0110: Pin the server the skills hardcode

## Status

Accepted.

## Context

`.mcp.json` started `figma-console-mcp` with `npx -y figma-console-mcp@latest`. The
`figma-workspace-architect` skill hardcodes about seventy `figma_*` tool names across its
SKILL.md and sixteen references — mode routing, tool map, payload recipes — and the
`design-to-code` skill decided in `plan/design-skills-blueprint.md` will add more. The
server is moving: its 1.40.0 release (2026-08-16) added seven `ds_*` tools and its
tool count is reported differently across its own docs pages (114 vs 121 local). A
rename or removal upstream would break a skill instruction silently — the skill text
would still read correctly, the call would fail, and nothing in `check:all` would notice,
because no gate can see a remote server's tool list.

The same session found that two Figma MCP servers are connected at once (figma-console
and the official Figma connector), which is why the blueprint also asks for
server-qualified tool names in skill text; that is a naming rule, not a version rule, and
does not remove the drift.

## Decision

Pin `figma-console-mcp` to an exact version in `.mcp.json` — `1.40.0` today — and treat a
bump as a deliberate change: read the CHANGELOG between the two versions, refresh
`references/tool-map.md` and any skill instruction that names a changed tool, and re-run
the skill fixtures (`nx run figma-workspace-architect:test`) in the same commit.

Alternatives considered:

- **Keep `@latest` and add a drift gate** that compares tool names in skills against the
  running server's `tools/list`. Rejected for now: it is online by nature and could not
  join `check:all` (the same reason `check:release-drift` stays out); it would still be
  useful as an advisory next to the pin and may follow.
- **Pin without recording why.** Rejected: the next person to see `@1.40.0` would bump it
  to `@latest` as a tidy-up, which is how the situation arose.

## Consequences

- Upstream fixes arrive only when someone bumps. The cost is bounded: the skills call a
  small, stable subset of the surface, and the CHANGELOG is readable.
- Bumping has a checklist (above) instead of being a one-character edit.
- Cloud/remote transports of the same server are not pinned by this — the repo uses the
  local `npx` transport only.
- The version string in `.mcp.json` is operational state; this ADR records the rule, not
  the number, so the number is read from the file, not from here.
