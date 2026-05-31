---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "tasks/rationale.md"
---

# ADR-0007: CDK where complex, manual where simple

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Interactive components need focus management, overlays, and keyboard navigation. Angular CDK supplies battle-tested primitives, but wrapping everything in CDK can add code where a few lines of native handling would do.

## Decision

Use Angular CDK for focus-trap (Dialog), overlays (Tooltip/Menu/Select), accordion coordination; keep manual ~20-40-line keyboard nav for Tabs + RadioGroup (native inputs). Why: abstraction only where it earns its keep; CDK-wrapping native radios would add code, not remove it.

## Consequences

- CDK is reserved for genuinely complex concerns (focus trap, overlays, coordination).
- Simple keyboard nav over native inputs stays small and readable.
- Trade-off: two implementation styles coexist, justified by net code reduction.
