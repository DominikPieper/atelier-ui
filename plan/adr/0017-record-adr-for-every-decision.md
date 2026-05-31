---
status: accepted
date: 2026-05-31
sources:
  - "CLAUDE.md § Decision Records (ADR)"
  - "this session"
---

# ADR-0017: Record an ADR for every non-trivial decision

## Status

Accepted. Recorded at decision time — the first contemporaneous ADR (0001–0016 were reconstructed after the fact).

## Context

Decisions had been scattered across commit messages, the `plan/` docs, `tasks/rationale.md`, and session memory. We reconstructed the backlog as ADR-0001–0016, but the *why* behind future decisions would keep dispersing the same way — and that rationale is exactly what we want to reuse later for content (blog posts, talks, teaching).

## Decision

Every non-trivial decision is recorded as a MADR-format ADR under `plan/adr/`, written as part of finishing the decision-bearing task. The trigger and procedure live in `CLAUDE.md` (§ Decision Records (ADR)): record when an approach is chosen over alternatives, a convention is set, or the architecture / spec contract / tooling & gates / design-system / Figma→code workflow / build-release changes; skip trivial or mechanical work. Capture context, the decision, the **why** (and which alternatives were rejected), and consequences. New ADRs are recorded-at-the-time and carry no `confidence` field — that marker is reserved for the reconstructed 0001–0016.

## Consequences

- The why/wherefore of decisions stays traceable and becomes a ready source for content.
- Small per-decision overhead, offset by never having to reconstruct rationale after the fact.
- It is a best-effort convention (the agent follows CLAUDE.md), not a hard hook — a `Stop`-hook reminder is the fallback if decisions start getting recorded inconsistently.
- `plan/adr/` is the canonical decision log; deeper rationale stays in `plan/big-picture.md` / `tasks/rationale.md`, cross-linked from the index.
