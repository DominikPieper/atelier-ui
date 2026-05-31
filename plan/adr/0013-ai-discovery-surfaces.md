---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - "feat(cookbook) / feat(docs) commits + .mcp.json"
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
