---
mode: Intake
references:
  - dc-html-shape.md
  - governance.md
first-tool: list_projects
out-of-scope: false
---

# Intake — no master exists: the document routes to Figma first, not to code

## Required surface

1. Project confirmed by id; `list_files` — finds no `AtlStatCard.dc.html` in the redesign
   project (StatCard is a Day-2 brief composition, not a shipped component) **or** finds
   whatever the user meant and says so; does not invent a sheet.
2. If a sheet exists: reads it; if not: says so and asks which artboard.
3. `tools/figma/snapshot.json` has no `AtlStatCard` selector → states plainly that the
   artboard cannot become code directly: the chain canvas → code as truth is forbidden;
   the next step is a Figma master (architect `build-from-code-contract.md` once a spec
   exists, or a Figma build informed by the sheet), then `design-to-code`.
4. Handoff document started with what is known (composition of card + badge per the
   brief; provenance; claims), master status "missing", order "master first".
5. No React code written.

## Regressions to flag

- Generates React from the artboard → **Blocker** (ADR-0032; the canvas is step 0).
- Invents a sheet or a node id → **Blocker**.
- Skips the handoff document because there is "nothing to hand off yet" → **Warning** —
  the document is where the master-first order gets recorded.
