// The end-of-Day-2 "done" checklist — one copy.
//
// Rendered in two places that must never disagree: the instructor curriculum
// (/schulung, "Success verification") and the participant page
// (/build-your-own, "Are you done?"). Strings use `code` and **bold**; both
// pages render them with `inlineMd`.
//
// tools/e2e/schulung-claims.e2e.mjs reads this file together with the pages, so
// every `npm run <script>` / `nx <target> <project>` named here is still
// checked against package.json and the scaffold generator.

export const DAY2_DONE: readonly string[] = [
  'The component is a component set in your own Figma draft (a duplicate of the Atelier file) — with variants, properties and a dark-mode variant',
  '`/verify` in Claude Code (or the five checks one by one: `check:format`, `check:stylelint`, `check:contracts`, `check:unit`, `check:stories`) — each with exit code 0. `check:contracts` is the one that really checks your own work: it joins the contract, the docgen and the Figma snapshot and reports `[COVERAGE]` when a variant value is rendered by no story',
  '`npm run storybook` is running and shows the component as a story (canvas + Docs tab)',
  'Test loop green: the `test-run` MCP call passes, or the equivalent `npm run check:stories` passes (every story in Chromium, play assertions, axe) — `npm run check:unit` covers only the jsdom half and is no substitute',
  '`figma_audit_component_accessibility` without critical findings **and** the Storybook a11y tab without axe-core findings',
  'Dark mode switches correctly through the token override',
  "`figma_check_design_parity` (needs the connected Desktop Bridge) on your own Figma node against the generated component: every finding in the report is triaged (code / Figma / contract) and none is left unexplained — the report proves something for exactly the sections that were passed (see Day 2 Block 04): `componentAPI`, `metadata`, `tokens` from `check:contracts --emit` plus `accessibility` from `figma_scan_code_accessibility`; fields that were not passed are not compared — a thinly filled `codeSpec` with just these four sections is the normal case, not a special case, as long as you can name which sections you passed: the report's `codeData` block echoes them, `summary.categories` lists only the categories with findings, and the parity score rises when a section is left out. Hand findings back to Claude and check again. Run it per node: the component set for `componentAPI` (a variant node carries no component properties), the variant you built for `visual`, `spacing` and `typography` (the set answers geometry with its default variant). This means the MCP call, not `npm run check:parity`: the repo gate checks the Atelier masters from `tools/figma/snapshot.json`, and your own component is not in there",
  '`npm run check:contracts` (framework, contract folder, story roots and snapshot come from `contracts.config.json`) exits 0, and `npm run check:stories` is green — every story renders in Chromium and passes axe',
];
