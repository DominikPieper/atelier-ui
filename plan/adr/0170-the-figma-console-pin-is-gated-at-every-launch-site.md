---
status: accepted
date: 2026-10-13
sources:
  - plan/adr/0110-pin-the-server-the-skills-hardcode.md
  - tools/scripts/check-docs-sync.js (checkMcpPinCitations)
  - tools/scripts/preflight.mjs (checkFigmaSetup)
  - libs/create-workspace/src/generators/preset/preset.ts (figma-console entry)
  - .mcp.json
  - .gemini/settings.json
  - tasks/reviews.md (R-111)
---

# ADR-0170: The figma-console pin is gated at every launch site

## Status

Accepted. Extends ADR-0110 (the pin itself); does not change the pinned number.

## Context

The course runs end of November 2026 on participants' own scaffolded workspaces. R-111
asked that a new upstream `figma-console-mcp` release must not change what they run.
ADR-0110 and the 2026-10-10 pin gate already did most of that: `.mcp.json`, the scaffold
(`preset.ts`) and every docs snippet say `@1.40.0`, and `check:docs` fails with
`[MCP-PIN]` on any citation that differs from the scaffold. The audit for R-111 found two
launch sites the gate could not see: the tracked `.gemini/settings.json` (still
`@latest`, read by the Gemini/Antigravity CLI) and the `@latest` fallback command inside
both `preflight.mjs` copies, which told a participant with an unpinned config to run the
very thing the pin removes.

Two things carry the version, and only one is controlled by npm. The package version
decides the server's tool surface and the Desktop Bridge files it copies into
`~/.figma-console-mcp/plugin/` (with a `.version` marker) on every start. Figma Desktop
only reads those files when the plugin is run, so an already-open panel keeps its old
build. Pinning the package therefore pins what gets seeded; matching the loaded plugin is
a manual step the preflight already checks (`.version` vs the pin) and `/troubleshooting`
explains (`plugin-update`).

## Decision

1. Keep `figma-console-mcp@1.40.0`. Upstream is at 1.40.9 (nine patch releases since
   2026-09-18) but the snapshot, the skill fixtures and every doc were verified against
   1.40.0; a bump needs the ADR-0110 checklist and a Bridge-connected run, which a
   pin-hygiene change should not smuggle in. Revisit after the cohort.
2. Widen `[MCP-PIN]` in `check:docs` from "docs + `.mcp.json`" to every file that
   launches or names the server with a version: `.gemini/settings.json` and both
   `preflight.mjs` copies join the list. `@latest` or any other version fails against the
   single source, `preset.ts`. One gate extended, no new one: it joins `preset.ts` to
   several files, which is gate territory under ADR-0126, not a single-file lint rule.
3. Preflight no longer names `@latest`. With no exact pin in `.mcp.json` it warns
   ("figma-console-mcp version pin") and tells the participant to set the version the
   trainer names.

Rejected: bumping to 1.40.9 now (unverifiable offline); a gate that asks the running
server for its version (online, cannot join `check:all`; the preflight `.version`
comparison already covers disk-vs-pin).

## Consequences

- Upstream fixes reach participants only when someone bumps; a bump is a one-line change
  in `preset.ts` plus every citation, and the gate names each stale one.
- A new launch site (another agent CLI config) is not found automatically: it must be
  added to `MCP_PIN_FILES` in `check-docs-sync.js`.
- The pin does not reach the plugin panel already open in Figma Desktop; that stays a
  runtime check (`npm run preflight`, `/troubleshooting#plugin-update`).
- Scaffolded workspaces get no gate (they have no `check:docs`); they get the preflight
  warning only.
