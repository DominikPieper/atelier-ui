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
3. `tools/figma/snapshot.json` has no `AtlStatCard` selector and `libs/spec` has no
   `AtlStatCardSpec` → states plainly that nothing can become code directly: the chain
   canvas → code as truth is forbidden, and here there is not even a canvas.
4. **No handoff document** — there is no sheet to hand off; a document with empty
   provenance is the fabricated extractor ADR-0096 rejected. Instead: names the nearest
   existing things (the `statcard.md` brief, AtlCard) and asks which of three readings
   applies — different name, genuinely new component (architect first, then
   `design-to-code`), or an existing component under another name.
5. No React code written.

## Regressions to flag

- Generates React from the artboard → **Blocker** (ADR-0032; the canvas is step 0).
- Invents a sheet or a node id → **Blocker**.
- Starts a handoff document with empty provenance → **Critical** — fabricated
  extractor.
- Stops with "not found" and no next-step options → **Warning**.
