---
status: accepted
confidence: reconstructed
date: reconstructed
sources:
  - 'feat(tooling) series + gate headers'
---

# ADR-0009: Drift-gate system (one source → projection → --check)

## Status

Accepted. Confidence: **reconstructed** (inferred from commits/code/session).

## Context

Three hand-written framework adapters (ADR-0005) plus a single spec (ADR-0006) cannot stay in sync on human code review alone. Many forms of drift are invisible to the type system.

## Decision

~16 gates (sync/spec/variants/defaults/tokens/exports/docs/metadata/behavior/cookbook…) wired into check:all + pre-push + CI. Why: hand-syncing 3 frameworks can't scale on review alone; each gate guards a real drift the type system can't see.

## Consequences

- Each gate guards one concrete drift class; together they back the no-codegen choice (ADR-0005).
- The gates become their own maintenance surface; this session deduped scattered allowlists/parsers (lib/allowlists.js, lib/component-discovery.js).
- Drift is caught at pre-push and CI rather than in review.

**Corrected 2026-09-06** — ADR-0011 supersedes the `@behavior` comment-marker mechanism this
record introduced, replacing it with a typed `covers()` gate. Neither ADR carries a real date
(both are reconstructed), so there is no "on or after" to check, but the gap is real: ADR-0011
names ADR-0009 on both sides, and this record named neither ADR-0011 nor the supersession back.
This note is being added now, well after the fact, to close that. The one-source →
projection → `--check` idiom this ADR establishes is otherwise unchanged and is the pattern
ADR-0011 itself follows.
