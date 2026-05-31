---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/big-picture.md (React rationale)"
---

# ADR-0005: Three frameworks, hand-written, no codegen

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

To be broadly useful to AI-assisted teams the library must cover the dominant frameworks. The options are generating adapters from one source or hand-writing each.

## Decision

Ship Angular + React + Vue from identical APIs, hand-written (not generated). Why: cover the dominant frameworks; identical prop/variant names let an LLM transfer knowledge across them.

## Consequences

- Each adapter stays idiomatic to its framework rather than mechanically generated.
- Manual sync burden, mitigated by the drift-gate system (ADR-0009) rather than codegen.
- Identical prop/variant names let an LLM carry knowledge from one framework to another.
