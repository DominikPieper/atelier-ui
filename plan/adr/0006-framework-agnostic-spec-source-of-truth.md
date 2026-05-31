---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - "feat(spec) commit, sync-spec.mjs"
---

# ADR-0006: Framework-agnostic spec as source of truth

## Status

Accepted. Confidence: **reconstructed** (inferred from commits/code/session).

## Context

Three hand-written framework adapters need a single authoritative contract so prop names, variants, and types cannot diverge silently.

## Decision

libs/spec/src/index.ts defines the contract; mirrored byte-identically into each lib (@atelier-ui/spec stays internal). Why: one contract, compiler-enforced across all three frameworks.

## Consequences

- One contract drives all three adapters; divergence becomes a compile error.
- The spec package stays internal — not a published surface consumers depend on directly.
- The byte-identical mirror is enforced by sync (see ADR-0009), not by trust.
