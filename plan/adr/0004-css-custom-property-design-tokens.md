---
status: accepted
confidence: documented
date: reconstructed
sources:
  - "plan/big-picture.md §5"
---

# ADR-0004: CSS custom-property design tokens

## Status

Accepted. Confidence: **documented** (quoted from the repo).

## Context

Styling can be exposed via arbitrary class/style inputs and utility classes, which give an LLM unbounded and unverifiable styling choices. Theming and dark mode need a single, predictable layer.

## Decision

All visuals via --ui-* tokens; no arbitrary class/style inputs, no utility classes; theme by overriding tokens. Why: bounded styling decisions; theming/dark-mode flow through one layer.

## Consequences

- Styling decisions are bounded to a known token vocabulary.
- Theming and dark mode flow through one override layer rather than scattered overrides.
- Trade-off: one-off visual tweaks require a token (or a new token) rather than an inline class.
