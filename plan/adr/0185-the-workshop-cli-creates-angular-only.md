---
status: accepted
date: 2026-11-19
sources:
  - owner, 2026-11-19 (this session): 'React und Vue ist momentan unwichtig … für das Create-Atelier-Skript die anderen beiden vielleicht erstmal abklemmen, sodass automatisch nur Angular erzeugt wird'
---

# ADR-0185: The workshop CLI creates Angular only

## Status

Accepted. Reversible by design.

## Context

Every cohort so far runs Angular, and the owner rates React and Vue as currently unimportant. The
`create-atelier-ui-workspace` CLI still asked for a framework and its e2e scaffolded all three, which
costs a prompt on every seat and CI time on paths nobody is taught.

## Decision

The CLI creates Angular workspaces only: no framework prompt, `--framework` defaults to `angular`,
`react` and `vue` are rejected with a message. One constant, `ENABLED_FRAMEWORKS`, carries the switch.
The CLI e2e defaults to Angular. The `create-workspace` preset generator, `libs/react`, `libs/vue`
and the cross-framework gates are untouched.

## Consequences

- Switching React or Vue back on is one line plus the e2e default.
- Docs pages that show the framework prompt (`workshop.astro`, `first-component.astro`,
  `install.astro`) are trainer and repo reference now (ADR-0184) and are not updated here.
- Rejected: deleting the React and Vue generator paths (not reversible, and the owner left the
  question open).
