---
mode: Build
references:
  - scaffold-payload.md
  - tool-map.md
  - token-architecture.md
first-tool: figma_setup_design_tokens
out-of-scope: false
---

# Build mode — Scaffold sub-mode

The user explicitly asked for a scaffold / starter and explicitly declined an iterative dialogue ("don't ask me a million questions"). The agent should enter the Scaffold sub-mode and run the three-call recipe from `references/scaffold-payload.md` directly, not the full Build loop.

## Required surface

1. **Skip Discovery.** This is the documented exception in Build mode where Discovery is not the first step. The user is creating a new file; there is nothing to discover. (Discovery would still apply for "add to my existing file"; this is a "scaffold a new file" case.)
2. **Three-call recipe in order:**
   - Call 1 — `figma_setup_design_tokens` with the canonical 13-Variable payload from `scaffold-payload.md`. Light + Dark modes; primitives + semantic aliases; scope-tightened semantics.
   - Call 2 — `figma_execute` to create Cover / Tokens / Components pages, seed the Cover with a title and "edit this skeleton" callout, and build the 6-frame ExampleButton variant grid (3 variants × 2 sizes) on the Components page.
   - Call 3 — `figma_arrange_component_set` to wrap the 6 variants as a proper Component Set, then `figma_set_description` to attach the placeholder documentation.
3. **Hand back the after-scaffold checklist** verbatim from `scaffold-payload.md`. The user must understand the output is a skeleton, not a finished system. The checklist points at: replace the primary colour, add real spacing stops, replace ExampleButton, add Modes if needed beyond Light/Dark, set the Cover with real title.
4. **Validate.** `figma_take_screenshot` of the Components page bounding box, switch the Mode to Dark and re-screenshot to verify the alias chain works (the example button should change color in Dark mode because its fill aliases through to a primitive that has both mode values).
5. **Set Variable Scopes correctly** — the recipe ships them tightened by default (semantics scoped to FRAME_FILL/STROKE_COLOR only, etc.); the agent must use the recipe's scopes, not loosen them to ALL_SCOPES.

## Regressions to flag

- Agent runs full Build-loop Discovery first → **Critical** — the user explicitly declined the iterative dialogue and Discovery on a new empty file is dead-weight.
- Agent invents its own token list / color palette instead of using the canonical scaffold payload → **Warning** — defeats the "consistent starter" purpose; users get unpredictable starter files. (Acceptable to swap the placeholder primary colour if the user mentioned a brand color in passing; not acceptable to redesign the whole Variable shape.)
- Agent skips the after-scaffold checklist → **Critical** — without it, the user thinks the placeholder is the final system.
- Agent omits modes / runs only Light → **Critical** — the user said "light + dark" explicitly.
- Agent uses a sequence of `figma_create_variable` instead of `figma_setup_design_tokens` → **Warning** — works but slow and non-atomic; recipe explicitly recommends the bulk call.
- Agent skips `figma_arrange_component_set` and leaves the variants as a flat group → **Critical** — the file looks fine in chat but the asset panel won't surface the set.
- Agent claims to ship a "full design system" rather than a placeholder skeleton → **Warning** — overstatement; recipe is clear that this is structural decision-set materialized, not finished design.
