---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/big-picture.md §4"
---

# ADR-0003: Composition over configuration

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Components can expose structure either through nested config-object inputs or through content projection / slots. An LLM's strength is HTML-like template composition, not assembling deeply nested config shapes.

## Decision

Content projection / named slots, never config-object inputs. Why: LLMs compose HTML-like templates far better than nested config shapes.

## Consequences

- Component structure is expressed in markup the LLM already writes fluently.
- Avoids opaque config objects whose valid shapes the type system can't fully signal at the call site.
- Trade-off: structure is more verbose in templates than a single config prop would be.
