---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - 'feat(cookbook) / feat(docs) commits + .mcp.json'
---

# ADR-0013: AI-discovery surfaces (llms.txt + hosted Storybook MCP + manifests)

## Status

Accepted. Confidence: **reconstructed** (inferred from commits/code/session).

## Context

Agents need to consume the library's documentation and patterns programmatically, without scraping rendered HTML.

## Decision

generated llms.txt/llms-full.txt, hosted Storybook MCP per framework, /.well-known/cookbook-patterns.json. Why: agents consume the library without scraping HTML. Known limit: Storybook 10.4 component MCP is React-only → Angular/Vue read the spec.

## Consequences

- Agents read structured surfaces (llms.txt, MCP, well-known manifest) instead of HTML.
- Known limit: Storybook 10.4 component MCP is React-only; Angular/Vue fall back to reading the spec (ADR-0006).
- Cookbook patterns (ADR-0012) are exposed via /.well-known/cookbook-patterns.json.

**Corrected 2026-09-10.** "Storybook 10.4 component MCP is React-only → Angular/Vue read
the spec" describes the state before ADR-0083 (2026-08-29, the worker's React-manifest
substitution) and ADR-0097 (`plan/adr/0097-the-manifest-the-framework-can-emit-now.md`,
2026-09-05, native Angular and Vue `components.json` under Storybook 10.6). Since
ADR-0097 every hosted endpoint serves its own framework's docgen-derived manifest, and the
spec is not an agent-facing fallback for any framework. What an agent reads about props
comes from the adapters via docgen, and from `docs/public/llms-full.txt`, which
`gen-llms-txt.mjs` builds from `docs/src/data/components.ts` plus the metadata files —
not from `libs/spec/src/index.ts`. ADR-0097 named ADR-0083 as superseded but did not
correct this record; the 2026-09-10 spec-format review
(`tasks/spec-format-review-2026-09-10.md`) found the stale sentence, and this paragraph
closes it.
