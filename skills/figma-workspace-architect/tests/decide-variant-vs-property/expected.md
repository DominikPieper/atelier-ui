---
mode: Decide
references:
  - decision-heuristics.md
  - component-design.md
first-tool: (none)
out-of-scope: false
---

# Decide mode — Variant vs. Component Property for boolean state

The user is at a fork and explicitly asked for an architecture decision. No `figma_*` write tool runs. Discovery is optional; the recommendation can be given without reading the user's actual file.

## Required surface

1. **Recommendation in 1–2 sentences:** for a boolean state like `disabled` or `loading`, prefer a **Component Property of type Boolean**, not a Variant.
2. **Reasoning:** Variants multiply cardinality (3 × 3 × 2 disabled × 2 loading = 36 frames; quickly unmaintainable). A Boolean Component Property is one toggle without changing the underlying frame, and instances inherit the new state without losing their other Variant settings.
3. **Mention the trade-off:** the only reason to use a Variant for a boolean is when the visual change is large enough that auto-layout/property-binding cannot express it (e.g., a fundamentally different shape or different children). For Button states, that is not the case.
4. **Tie back to engineering parity:** the consuming code probably has `disabled: boolean` and `loading: boolean` as props, not as enum values. Variant Property names should mirror the engineering API.
5. **Reference `references/decision-heuristics.md`** for the full table of Variant vs. Property heuristics and `references/component-design.md` for the four mechanisms (Variant / Component Property / Instance Swap / Slot).

## Regressions to flag

- Agent recommends Variants for `disabled` / `loading` → **Critical** — wrong default and creates the cardinality explosion the heuristic is designed to prevent.
- Agent writes a treatise instead of a 1–2 sentence recommendation → **Warning** — Decide-mode users want to move on.
- Agent does not mention engineering-prop parity → **Suggestion** — losing the tie-back is a missed opportunity but not wrong.
- Agent calls a `figma_*` write tool → **Blocker** — Decide mode does not write to Figma.
