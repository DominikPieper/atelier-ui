---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - "feat(docs) series + this session"
---

# ADR-0015: Docs: Astro + Diátaxis + single Design-to-Code narrative

## Status

Accepted. Confidence: **reconstructed** (inferred from commits/code/session).

## Context

Documentation content existed but was scattered, with no single signposted path through the design-to-code workflow.

## Decision

Diátaxis-categorized pages, FwSwitcher primitive, and a single signposted /design-to-code loop. Why: the path existed but was scattered; one map + the /first-component kata as the worked example.

## Consequences

- Pages are organized by Diátaxis category (tutorial / how-to / reference / explanation).
- A single /design-to-code loop maps the workflow, with /first-component as the worked kata.
- FwSwitcher lets one page serve all three frameworks.
