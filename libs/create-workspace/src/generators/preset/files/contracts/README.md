# Contracts

A micro-contract (`types.ts`, ADR-0121 Decision 3) is the one hand-authored spec
artefact per component: which Figma master it is, and where Figma and code differ on
purpose (`figmaOnly`, `codeOnly`, `axisMap`, `probes`). Everything else — props,
defaults, unions, variant matrices, descriptions, token lists — is forbidden here; it
lives in the component's types/JSDoc, a story, or the master.

The planned check reads each `<name>.contract.ts` statically with
`tools/scripts/lib/ts-eval.js`'s `parseExportedVars`, so a contract must stay a plain
object literal (no imports of values, no computed members).

Every component story meta whose component has a contract must import it and set
`contract` in its `parameters` (`docs-block.ts`'s `ContractBlock` reads
`parameters.contract` to render the "Contract" section on the docs page); a story file
that has a contract but doesn't wire it in is `[CONTRACT-IMPORT]` (error).

To add one: create `<kebab-selector-without-atl-prefix>.contract.ts` in the contracts
directory (`AtlButton` → `button.contract.ts`), `import type { ComponentContract } from
'./types';`, and `export const contract = { ... } satisfies ComponentContract;` —
`satisfies`, not a type annotation, so an extra key fails the build.

This file is shared verbatim between two locations: `libs/spec/src/contracts/README.md`
in this repo, and `<app>/src/contracts/README.md` in a scaffolded workspace
(`create-workspace`'s preset, kept byte-identical by `tools/scripts/sync-preflight.mjs`).
That is why it says "the contracts directory" above rather than naming a path — the
directory itself is `libs/spec/src/contracts/` here and `<app>/src/contracts/` there.
