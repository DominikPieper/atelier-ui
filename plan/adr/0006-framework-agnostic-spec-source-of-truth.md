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

**Corrected 2026-09-10.** The Decision's "compiler-enforced across all three frameworks"
and the first Consequence's "divergence becomes a compile error" were never true for two of
the three adapters. ADR-0093 (`plan/adr/0093-the-contract-two-adapters-were-never-held-to.md`,
2026-09-05) measured it: no Angular class implements or extends an `Atl*Spec` — signal
inputs are class fields, so none can — and no Vue `defineProps` points at one; only React's
props interfaces extend the spec. The spec-format review of 2026-09-10
(`tasks/spec-format-review-2026-09-10.md`) counted it per component: React 26 of 29,
Angular 1 of 29 (an indexed-access pluck of one field), Vue 0 of 29; 27 of the file's
exported names are imported by no adapter at all, and eight `.vue` files re-declare the
axis union inline. What holds the three adapters to the same names is the gate chain —
`check:props` with its recorded exemptions, `check:variants`, `check:defaults`,
`check:figma` — not the compiler. The byte-identical mirror (`sync-spec.mjs`,
`check:spec`) is unchanged and correct. The decision to keep one contract file stands; the
mechanism this record claimed for it does not, and README, `plan/big-picture.md` and
`AGENTS.md` repeated the claim until the same day's correction.
