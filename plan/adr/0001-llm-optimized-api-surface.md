---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/big-picture.md §1, §3"
---

# ADR-0001: LLM-optimized API surface

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

The library's primary consumer is an LLM generating UI code. Forces: an agent must produce correct usage from type signatures alone, with no documentation lookup at generation time.

## Decision

Maximally predictable — identical prop names across components (variant/size/disabled), string-literal unions (never enums/numbers), defaults so bare usage works. Why: an LLM must infer correct usage from types alone, no docs lookup at generation time.

## Consequences

- The type is the documentation; nothing else is required to call a component correctly.
- Drift gates enforce prop-name and union uniformity across the surface.
- Trade-off: less per-component flexibility in naming/typing in exchange for cross-component predictability.
