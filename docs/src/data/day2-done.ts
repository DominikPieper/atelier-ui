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
  '`figma_check_design_parity` (needs the connected Desktop Bridge) on your own Figma node against the generated component: the report comes back without deviations — that proves something for exactly the sections that were passed (see Day 2 Block 04): `componentAPI`, `metadata`, `tokens` from `check:contracts --emit` plus `accessibility` from `figma_scan_code_accessibility`; fields that were not passed are not compared — a thinly filled `codeSpec` with just these four sections is the normal case, not a special case, as long as the report names which sections they were. Hand findings back to Claude and check again. This means the MCP call, not `npm run check:parity`: the repo gate checks the Atelier masters from `tools/figma/snapshot.json`, and your own component is not in there',
  '`check:contracts` with your own flags (`--fw`, `--contracts`, `--stories`, `--snapshot`) exits 0, and `nx storybook-test <fw>` is green — every story renders in Chromium and passes axe',
];
