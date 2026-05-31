---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "tasks/rationale.md"
---

# ADR-0012: Composition cookbook (6 canonical patterns)

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

LLMs reliably generate a single component but stumble when composing five to seven into a realistic page. The highest-value gap is at the page-assembly level, not the component level.

## Decision

Login / Settings / Confirm-dialog / Data-list / Notification-center (+1). Why: LLMs generate single components fine but fail at composing 5-7 into a realistic page; these are the highest-frequency AI-generated layouts.

## Consequences

- Provides worked, canonical multi-component layouts agents can pattern-match against.
- Targets the highest-frequency AI-generated page types rather than exhaustive coverage.
- Cookbook patterns are surfaced for discovery (see ADR-0013).
