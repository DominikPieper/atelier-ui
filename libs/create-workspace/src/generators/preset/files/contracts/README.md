# Contracts

A micro-contract (`types.ts`, ADR-0121 Decision 3) is the one hand-authored spec
artefact per component: which Figma master it is, and where Figma and code differ on
purpose (`figmaOnly`, `codeOnly`, `axisMap`, `probes`). Everything else — props,
defaults, unions, variant matrices, descriptions, token lists — is forbidden here; it
lives in the component's types/JSDoc, a story, or the master.

Every divergence entry is one of two kinds, and the `reason` has to make clear which
(ADR-0145). **Settled**: the two sides differ permanently and correctly, because the
thing they differ about is not drawn — behaviour, element or form semantics, data, keys.
`headingLevel` "changes nothing drawn"; `multi` is "behaviour only"; `id` "is data, not
state". These need no owner and no follow-up, and a master that grew an axis for one
would be worse, not better. **Owed**: the difference _is_ drawn, so one side owes a
change — a CSS-backed paint axis with no Figma axis means Figma owes an axis; a Figma
axis with no CSS rule or render condition means either the code owes an implementation
or the master owes a deletion. An owed entry's `reason` names which side is expected to
change and points at the task item tracking it; being drawn makes an entry owed but does
not decide the answer, and deleting the axis from the master is often the honest one
(interaction states are CSS pseudo-classes here by convention, ADR-0114).

The check (`check-contracts`, from `@conciso/design-contracts`) reads each
`<name>.contract.ts` statically (it evaluates the literal and never runs the file), so a
contract must stay a plain object literal (no imports of values, no computed members).

Every component story meta whose component has a contract must import it and set
`contract` in its `parameters` (`docs-block.ts`'s `ContractBlock` reads
`parameters.contract` to render the "Contract" section on the docs page); a story file
that has a contract but doesn't wire it in is `[CONTRACT-IMPORT]` — its severity is the
`contractImportSeverity` setting in `contracts.config.json` (an error in the Atelier
monorepo, which ships the block; a warning in a scaffolded workspace until it does).

To add one: create `<kebab-selector-without-atl-prefix>.contract.ts` in the contracts
directory (`AtlButton` → `button.contract.ts`), `import type { ComponentContract } from
'./types';`, and `export const contract = { ... } satisfies ComponentContract;` —
`satisfies`, not a type annotation, so an extra key fails the build.

This file is shared verbatim between two locations: `libs/spec/src/contracts/README.md`
in this repo, and `<app>/src/contracts/README.md` in a scaffolded workspace
(`create-workspace`'s preset, kept byte-identical by `tools/scripts/sync-preflight.mjs`).
That is why it says "the contracts directory" above rather than naming a path — the
directory itself is `libs/spec/src/contracts/` here and `<app>/src/contracts/` there.
