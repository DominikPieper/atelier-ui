---
status: accepted
date: 2026-10-07
sources:
  - tools/scripts/gen-props-projection.mjs
  - docs/src/data/props.generated.json
  - plan/adr/0009-drift-gate-system.md
  - plan/adr/0121-the-stories-are-the-spec.md
  - plan/adr/0127-prettier-owns-the-file-the-generator-owns-its-block.md
  - plan/adr/0153-the-release-run-regenerates-llms-txt-not-a-human-afterwards.md
---

# ADR-0154: The docs props are a committed projection of the manifests, not a build-time read

## Status

Accepted.

## Context

The docs prop tables, `llms-full.txt` and `check:defaults` all need each framework's API rows,
which the three Storybook docgen manifests (`dist/storybook/<fw>/manifests/components.json`)
carry. The first version read the manifests directly at build time. That made `docs:build`,
`docs:serve`, `check:llms`, `gen:llms` and `check:defaults` depend on three Storybook builds,
and broke the two places that run `gen-llms-txt.mjs` with no `dist/`: the release workflow
(ADR-0153) and the pre-push hook.

## Decision

One source -> projection -> `--check` (ADR-0009). `tools/scripts/gen-props-projection.mjs` is the
only reader of the manifests for the docs. It writes `docs/src/data/props.generated.json`
(`{ slug: { framework: { props, parts } } }`, keys sorted, rows in declaration order) and fails
loudly on a missing or empty manifest, a missing component entry, or an entry with no props.
`check:props-projection` regenerates in memory and reports `[DRIFT]` per component/framework;
it sits in `check:all` right after `check:storybook-manifests`, which already built the
Storybooks. `gen:props-projection` builds them itself. The generator owns the file's bytes
(`.prettierignore`, ADR-0127).

The docs app, `gen-llms-txt.mjs` and `check-defaults.js` read the JSON, never the manifests.
`check-defaults` reads the projection too: the gate compares adapter source against rows, and
`check:props-projection` already pins those rows to the manifests, so reading the projection
loses nothing and keeps the gate offline and build-free.

## Consequences

- `docs:build`, `check:llms`, `gen:llms`, `check:defaults` and the release/pre-push llms
  regeneration need no `dist/`.
- A JSDoc or type change in any adapter requires `npm run gen:props-projection` and a commit of
  the JSON; forgetting is a red `check:props-projection`, not a silently stale docs page.
- The price is a ~135 KB committed generated file whose diffs appear next to API changes.
