---
status: accepted
date: 2026-10-10
supersedes: 0166
sources:
  - ADR-0166 (the local-only mechanism this replaces, same day)
  - owner decision, 2026-10-10 (this session), after the trade-offs of ADR-0166 were laid out
  - docs/src/components/MaintainerNotes.astro, tools/scripts/check-docs-layout.mjs
---

# ADR-0168: Maintainer content ships collapsed

## Status

Accepted. Recorded at decision time. Supersedes ADR-0166.

## Context

ADR-0166 kept maintainer material on its page but rendered it only in local dev. Within hours of
rolling it across eleven pages, its costs showed:

- `check:docs-layout` (axe, overflow, font-size) tests the production build, so it stopped seeing
  the maintainer material.
- Links from visible text into hidden sections broke without any gate noticing. Four were found by
  hand on the same day (preflight → `/runbook`, readiness → `/figma#file-ready` twice, mcp →
  `/storybook#toolset-configuration`).
- Public readers (other trainers, people rebuilding the method) lost the evidence: audit results,
  gate tables, the per-step "why" notes.

The owner's goal was narrower than the mechanism: participants should pass over maintainer material,
not stumble through it.

## Decision

- `<MaintainerNotes>` (renamed from `MaintainerOnly`) renders a native `<details>`, closed by
  default, in dev and production. Its summary reads "For maintainers" or "For maintainers — <topic>".
  Where a block replaced a "For maintainers" heading, the heading's id moved onto the `<details>`.
- A small script opens every ancestor `<details>` of the element named by the URL hash, on load, on
  `hashchange`, and on a click on a link to the current hash, so deep links into collapsed sections
  work. Checked in Chromium against the built site: `/claude-design/#proof` and
  `/mcp/#for-maintainers` open and scroll; without a hash the blocks stay closed.
- `/runbook` is a normal deployed page again, left out of the participant navigation and reached
  from the maintainer blocks that link to it. The dev-only route integration is deleted.
- `check:docs-layout` opens every `<details>` in the page content before its checks, so the
  maintainer material is axe- and layout-checked again (negative-tested with a low-contrast link
  inside a block: exit 1; reverted: exit 0). The sidebar's own `<details>` groups stay as the
  shell renders them.

Rejected: keeping ADR-0166 and adding a gate for links into hidden sections. It would have fixed one
of the three costs and left the other two.

## Consequences

- Opening the blocks found a defect the local-only period had hidden: two SVG diagrams on
  `/a11y-workflow` set text below the 12 px floor; fixed.
- Maintainer text is back in search, the per-page `.md` output for llms, and the page DOM while
  closed. That is the intended trade: public, but out of the participant's way.
- The participant-facing entries moved out of `/runbook` under ADR-0166 (`/troubleshooting
#plugin-update`, `#stale-instances`) stay where they are; they belong on a participant page
  either way.
