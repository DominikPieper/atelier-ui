---
mode: Migrate
references:
  - code-verify.md
  - migration-playbook.md
first-tool: bash
out-of-scope: false
---

# Migrate mode — Code-side visual verification (post-flight)

A token consolidation has been shipped on the Figma side and in code. The user is at the post-flight step of Migrate mode and explicitly asks for browser confirmation in light + dark before committing. This is the trigger for the recipe in `references/code-verify.md`.

## Required surface

1. **Confirm pre-flight prerequisites** from `code-verify.md`: a Storybook (or equivalent) target exists, a browser-automation MCP is available, and the theme-switching mechanism is identified by reading the Storybook `preview.ts` decorator (URL globals, `data-theme` attribute, or context provider). If the decorator's theme comparison is stale (e.g. comparing against a hex value when Storybook now surfaces the option key), fix that decorator first — otherwise the verification will appear to fail when only the wiring is broken.
2. **Run the recipe step-by-step**:
   1. Start the rendering target in the background (`nx run angular:storybook`, or framework equivalent). Capture the local URL.
   2. Navigate to the Primary Button story.
   3. Switch theme to dark via the identified mechanism (URL param preferred; JS-direct as fallback when the decorator wiring is suspect).
   4. Read computed `backgroundColor` and `color` of the affected element through the preview iframe's `contentWindow.getComputedStyle`. Account for web-component selectors (e.g. `<llm-button>`, not `<button>`).
   5. Switch back to light mode and capture the same values.
3. **Compare against spec** in a four-cell table (Light expected/actual × Dark expected/actual). For this consolidation the Dark cells are the load-bearing ones — old: white on `#00d0d0` (1.95:1, fail AA); new: `#0f172a` on `#00d0d0` (~9.27:1, pass AAA).
4. **Pass condition** = all four cells match. Any mismatch means investigate before declaring the token change done.
5. **Tear-down** — stop the background dev-server task once the verification is complete.

## Regressions to flag

- Agent eyeballs the screenshot instead of reading computed values → **Critical** — defeats the purpose; the bug class this catches is "two near-identical hex values that fail contrast", which the eye misses.
- Agent verifies dark mode only and skips light → **Warning** — a token consolidation can silently regress light mode; both must be checked.
- Agent trusts that the Storybook background toggle propagates to `data-theme` without first reading the decorator → **Critical** — common cause of "looks unchanged" false negatives.
- Agent uses `querySelector('button')` on a custom-element framework like Angular → **Warning** — picks up the wrong element; results are meaningless.
- Agent does not stop the background dev-server when finished → **Suggestion** — leaks resources and confuses follow-up sessions.
- Agent runs the Storybook recipe before the Figma-side change has been verified via screenshot → **Warning** — code-verify is post-flight of Migrate; Figma side must already be confirmed before browser comparison is meaningful.
