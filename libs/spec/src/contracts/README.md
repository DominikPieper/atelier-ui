# Contracts

A micro-contract (`types.ts`, ADR-0121 Decision 3) is the one hand-authored spec
artefact per component: which Figma master it is, and where Figma and code differ on
purpose (`figmaOnly`, `codeOnly`, `axisMap`, `probes`). Everything else — props,
defaults, unions, variant matrices, descriptions, token lists — is forbidden here; it
lives in the component's types/JSDoc, a story, or the master.

The planned check reads each `<name>.contract.ts` statically with
`tools/scripts/lib/ts-eval.js`'s `parseExportedVars`, so a contract must stay a plain
object literal (no imports of values, no computed members).

To add one: create `libs/spec/src/contracts/<kebab-selector-without-atl-prefix>.contract.ts`
(`AtlButton` → `button.contract.ts`), `import type { ComponentContract } from './types';`,
and `export const contract = { ... } satisfies ComponentContract;` — `satisfies`, not a
type annotation, so an extra key fails the build.
