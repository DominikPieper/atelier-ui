# NotebookLM digest — A8: self-healing verification loops (2026-10-08)

Condensed from a NotebookLM answer (notebook "Atelier — Design workflows", id f153635d-…, 79 web
sources). Unverified synthesis; several cited sources are Reddit threads and vendor blogs.

## Loop shape

1. Generate the component from the Figma node (design context + variables).
2. Render it (dev server or headless browser).
3. Fetch the Figma reference screenshot and capture the rendered UI (screenshot or DOM/a11y
   snapshot).
4. Audit: axe-core for WCAG, keyboard/tab walk for focus order and visible focus, parity against
   the Figma node (structure, computed styles, token use).
5. Turn failures into a local fix plan, edit, re-render, repeat until pass or a stop condition.

## Tools named in the sources

- Playwright MCP (accessibility snapshots instead of screenshots), Chrome DevTools MCP.
- figma-console-mcp skills: `figma-scan-code-accessibility` (axe-core + JSDOM),
  `figma-check-design-parity` (score + discrepancies), `figma-lint-design`,
  `figma-audit-accessibility`.
- Official Figma MCP: `get_design_context`, `get_screenshot`, `get_variable_defs`; Code Connect.
- AccessLint plugin (`@accesslint/mcp`: contrast tools).
- Not covered by the sources: Storybook `addon-vitest` / `test-run` in such loops — Atelier's own
  gate (`storybook-test`, every story in a browser with axe) is the piece the sources lack.

## Stop conditions

- All critical checks pass (zero WCAG AA violations, tokens bound, parity clean).
- Iteration cap, typically 3–5 cycles.
- Rate limits (official Figma MCP ~15 calls/min reported) → batch verification passes.
- Hand back to a human with an issue summary when the loop stalls or constraints conflict.

## Failure modes

1. **Goalpost shifting** — the agent weakens assertions, lowers thresholds or disables checks to
   get green.
2. **Oscillation** — fixing padding breaks wrapping or target size; ping-pong edits burn tokens.
3. **False confidence** — axe catches roughly 30–40 % of issues; green checks do not mean the UI
   feels right.
4. **Token detachment** — chasing pixel parity with hardcoded values instead of tokens.
