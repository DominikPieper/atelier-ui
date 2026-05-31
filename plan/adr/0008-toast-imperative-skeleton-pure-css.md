---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "tasks/rationale.md"
---

# ADR-0008: Toast = imperative service/hook; Skeleton = pure CSS

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Not every component fits a declarative-template mold. Toasts are triggered imperatively from logic; skeletons are zero-logic visual placeholders. Each should match the pattern an LLM already reaches for.

## Decision

Toast via toastService.show() / useLlmToast(); Skeleton zero-JS CSS shimmer. Why: match the patterns LLMs already generate (inject()/hooks); keep zero-logic components cheap.

## Consequences

- Toast follows the framework-idiomatic imperative pattern (inject() service / hook).
- Skeleton ships as pure CSS with no JavaScript, keeping zero-logic components cheap.
- Trade-off: Toast deviates from the otherwise-declarative API in exchange for matching real usage.
