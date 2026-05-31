---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/ai-readiness.md, commit d7f6235"
---

# ADR-0010: AI-readiness layer (metadata + token manifest + behavior manifest)

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Type signatures convey shape but not intent, constraints, or runtime behavior. Agents need the "when and why" the types can't carry.

## Decision

Beyond types — per-component .metadata.ts (purpose/whenToUse/antiPatterns/variantMatrix/a11y), tokens.manifest.ts (intent + constraints), behaviors.json (runtime behavior contract). Why: give agents the intent + constraints the type signature can't carry.

## Consequences

- Agents get purpose, when-to-use, anti-patterns, and a11y notes alongside the type surface.
- Token manifests express intent and constraints, not just values.
- behaviors.json gives a machine-readable runtime behavior contract (see ADR-0011).
