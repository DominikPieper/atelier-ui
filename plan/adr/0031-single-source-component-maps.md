---
status: accepted
date: 2026-07-22
sources:
  - tasks/figma-audit-2026-07-22.md follow-ups / repo-health sweep 2026-07-21
---

# Single-source component maps in the metadata registry

## Status

Accepted.

## Context

Four hand-maintained tables encoded overlapping spec→component knowledge:
`COMPONENT_METADATA_REGISTRY` (libs/spec/src/metadata/index.ts),
`SPEC_TO_DOCS` (check-docs-sync.js), `UNION_TO_COMPONENT`
(lib/component-axes.js), and `SUBCOMPONENT_MAP` (check-cookbook-parity.mjs).
Adding a component meant updating up to four files in three formats; the
tables already disagreed in shape (registry maps `AtlRadioGroupSpec` to the
metadata module `radio`, docs use the slug `radio-group`), and nothing
checked them against each other.

## Decision

`libs/spec/src/metadata/index.ts` is the single source for every component
map. It now also exports `DOCS_PRIMARY_SPECS` (primary interface → docs
slug), `UNION_COMPONENT_EXCEPTIONS` (the two Toast axis unions that have no
spec interface), and `SUBCOMPONENT_PARENTS`. A new reader,
`tools/scripts/lib/component-map.js`, parses that file statically (the
existing ts-eval helper) and **derives** the union→component map instead of
maintaining it: an axis union `Atl<Base><Axis>` maps to the registry entry
for `Atl<Base>Spec`, exceptions only for spec-less masters. The three
consumer scripts read from the reader; their public shapes are unchanged.

Alternatives considered:
- **Derive the docs slugs and sub-component parents too** — rejected:
  neither is mechanically derivable (which interface is "primary" is a
  documentation decision; `AtlTab`'s parent being `AtlTabGroup` is domain
  knowledge). Declarative-but-central beats clever-but-wrong.
- **A JSON side-file instead of TS exports** — rejected: the registry file
  already is the documented "add a component here" location, is
  type-checked, and the ts-eval reader already existed for exactly this
  file shape.

## Consequences

- Adding a component touches one file for all map concerns (the registry
  header documents the steps). The derived union map was verified
  entry-for-entry identical (24/24) with the old hand-written table before
  the switch; all gates stayed green through the change.
- The derivation couples union naming to the `Atl<Base><Axis>` convention
  (Axis ∈ Variant|Size|Shape|Position|Orientation) — already enforced by
  check-variants' discovery regex, now also load-bearing for the mapping.
- check-cookbook-parity (ESM) reaches the CJS reader via `createRequire` —
  the same bridge pattern the repo uses elsewhere.
