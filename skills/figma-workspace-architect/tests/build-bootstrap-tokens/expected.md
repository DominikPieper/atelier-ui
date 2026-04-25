---
mode: Build
references:
  - tool-map.md
  - token-architecture.md
  - decision-heuristics.md
first-tool: figma_get_file_data
out-of-scope: false
---

# Build mode — bootstrap a token system

The agent should walk the Build loop: Discovery → Decide → Map tools → Execute → Validate → Document.

## Required surface

1. **Discovery first.** Call `figma_get_file_data` (or `figma_get_variables` for large files) before any write. The response must call out whether a Variable Collection already exists — if it does, the agent must not silently overlay a parallel one.
2. **Decisions surfaced before any write call:**
   - One Variable Collection or split (typically: one `UI Tokens` collection covering colour + spacing + radius + typography for a small site, vs split when the system grows past ~150 variables).
   - Naming convention for the primitive tier (`primitive/blue/600` vs `color/primitive/blue-600`). Recommend slash-grouped paths.
   - Number and names of Modes — at least `Light` and `Dark` from the user's request.
   - Per-tier scope policy (primitives broad-scoped, semantics tight-scoped).
3. **Tool selection.** Recommend `figma_setup_design_tokens` over a sequence of `figma_create_variable_collection` + `figma_batch_create_variables` calls. Reference the bootstrap-payload example from `tool-map.md`.
4. **Variable Scopes called out explicitly.** Default `ALL_SCOPES` is the single most common architectural mistake; semantic colour tokens must be scoped to fill / stroke / text only.
5. **Validation step.** `figma_take_screenshot` plus a re-read via `figma_get_variables` to confirm scopes were applied.
6. **Documentation step.** `figma_set_description` on the collection so designers can find it.

## Regressions to flag

- Agent jumps to `figma_setup_design_tokens` before discovery → **Critical**.
- Agent omits modes despite the user asking for Light/Dark → **Critical**.
- Agent does not mention Variable Scopes → **Critical** (most-common architectural drift source).
- Agent uses single-call `figma_create_variable` in a loop instead of `figma_batch_*` or `figma_setup_design_tokens` → **Warning** (works but slow / non-atomic).
- Agent commits to a primitive naming convention without checking what convention any sibling Figma files use → **Suggestion** (consistency across files matters more than the chosen convention).
