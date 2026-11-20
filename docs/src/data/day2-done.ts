// The end-of-Day-2 "done" checklist — one copy: five outcomes, then one proof line.
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
  'The component is a component set in your duplicate of the Atelier file — with variants, properties and a dark-mode variant',
  '`npm run storybook` is running and shows the component, with one story per variant value',
  'It works by keyboard, and neither `figma_audit_component_accessibility` nor the Storybook a11y tab reports an open finding',
  'Dark mode switches correctly through the token override',
  'Every difference `figma_check_design_parity` reports between your Figma node and the component is sorted (code / Figma / kept on purpose / tool artefact) and none is left unexplained — a quiet parity report is not a clean component (see Day 2 Block 04)',
  'As proof: `/verify` in Claude Code runs through (the checks it lists, each with exit code 0)',
];
