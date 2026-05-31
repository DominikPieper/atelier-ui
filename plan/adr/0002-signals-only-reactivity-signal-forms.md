---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/big-picture.md §2, §8"
---

# ADR-0002: Signals-only reactivity + Signal Forms

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Angular offers multiple reactivity and forms APIs (legacy decorators, ControlValueAccessor, template/reactive forms). Multiple valid patterns make an LLM's output inconsistent.

## Decision

Angular uses input()/output()/model() exclusively (no @Input/@Output); form controls implement FormValueControl/FormCheckboxControl, never legacy ControlValueAccessor; validation lives in the schema, not the control. Why: one mental model = one pattern the LLM reproduces reliably.

## Consequences

- A single reproducible pattern per concern; no decision-fork for the generator.
- Requires modern Angular (signals + Signal Forms); legacy interop is intentionally excluded.
- Validation is centralized in the schema, decoupled from control internals.
