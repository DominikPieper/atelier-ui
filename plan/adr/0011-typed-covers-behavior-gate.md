---
status: accepted
confidence: documented
date: reconstructed
supersedes: ADR-0009
sources:
  - "this session, tasks/lessons.md, commit ff36fe9"
---

# ADR-0011: Typed covers() behavior gate replaces @behavior comment marker

## Status

Accepted. Confidence: **documented** (quoted from the repo). Supersedes ADR-0009 (the comment marker from ADR-0009 / commit 06c1829).

## Context

The original behavior-coverage gate counted `@behavior` comment markers. A comment is untyped, easy to forget, and can drift into dead code without anyone noticing.

## Decision

comment markers → generated typed BEHAVIORS + covers('subject','id')(…) bindings; AST gate counts only invoked tests. Why: a comment proves a string exists (forgettable, untyped, drifts into dead code); a typed call is a compile error on typo and bound to the real test.

## Consequences

- A typo in a behavior id is now a compile error, not a silent miss.
- The gate counts only actually-invoked tests, so coverage can't be faked by a stray comment.
- Supersedes the comment-marker mechanism originally introduced under the drift-gate system (ADR-0009).
