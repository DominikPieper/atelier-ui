---
status: accepted
date: 2026-10-16
sources:
  - tools/scripts/gen-component-knowledge.mjs
  - docs/public/.well-known/components/index.json
  - tools/parity/behavior-coverage.mjs
  - tools/scripts/check-metadata.js
  - docs/src/data/component-metadata.ts
  - https://designsystemdocspec.org
---

# ADR-0174: Component knowledge is a generated projection in our own format, not DSDS and not a new source

## Status

Accepted. Recorded at decision time.

## Context

DSDS (Design System Documentation Schema, designsystemdocspec.org, 0.23.0, a single-maintainer
draft with no standards body behind it) proposes one structured document per component that
points at the formats owning each fact (DTCG for token values, a component manifest for the API,
CSF for stories, the test runner for whether a rule holds) and adds the "how, when, why" layer:
guidelines with a strength (`must` … `should-not`), an audience, and a link from a rule to the
test that proves it (`checkedBy` / `checks`).

A research pass (2026-10-16) found that of the formats design systems use to reach agents —
DTCG 2025.10, the Storybook components manifest, Custom Elements Manifest, Figma Code Connect /
Dev Mode MCP, llms.txt, MCP servers and skills — only DSDS links a usage rule to its proof, and
none records deliberate design ↔ code mismatches as a reviewable fact.

An inventory of this repo found that every fact already has an owner and most have a gate:
purpose and usage rules in `libs/spec/src/metadata/`, behaviours in `behaviors.json` bound to
tests by `covers()` and gated by `check:behavior`, mismatches in `libs/spec/src/contracts/`,
token intent in `tokens.manifest.ts`, the API in the three docgen manifests. Nothing joined them,
and the strongest fact — which test proves which behaviour — reached no agent-facing output at
all (zero occurrences in `llms-full.txt`). The inventory also found the component description
hand-written four times, two of them disagreeing.

A throwaway spike derived a schema-valid DSDS document for AtlButton (`validate --strict` and
`lint-docs` both exit 0), but only with glue: DSDS requires a description per trait value, which
we do not have, so the spike filled it with sentences that carry no information, and rule levels
had to be invented. The owner then asked for a similar projection in our own shape rather than
the exact schema.

## Decision

1. **A projection, never a source.** `tools/scripts/gen-component-knowledge.mjs` writes one JSON
   per docs component that has metadata to `docs/public/.well-known/components/<slug>.json`, plus
   an `index.json`. Every value is read from an owner file and every file lists its `sources`.
   Hand-written content in the output is not allowed; a prose field that resolves to nothing
   throws instead of projecting a hole.
2. **Our own small format (schema `version: "1"`)**: purpose, `rules[]` with `level`,
   `statement`, `source`, `verifiedBy` and `checks[]`, accessibility, related components, the
   Figma masters with every contract mismatch and its `reason`, API pointers (hosted Storybook
   MCP endpoints and docs ids, no prop tables), and the `--ui-*` tokens the stylesheet uses with
   intent and constraints (no values). The schema lives in the generator's header.
3. **Verification is claimed only where it is traced.** A behaviour rule is `verifiedBy: "test"`
   only when a live `covers()` binding exists, and its `checks` name the framework, the spec file
   and the test _title_. Usage rules from metadata are `verifiedBy: "none"`, stated plainly.
4. **Levels are a documented policy default:** behaviours are `must`, `whenToUse` is `should`,
   `antiPatterns` are `should-not`. No `audience` field — no owner file carries one.
5. **Gated for drift**: `check:knowledge` (in `check:all`) fails on a changed output and on an
   output file with no source.
6. **Prerequisites landed first** (commit 5b4b5b00): the docs description and `llms-full.txt`
   read `metadata.purpose`, and `check:metadata` requires every `relatedComponents` entry to
   name an exported spec interface.

Rejected:

- **DSDS YAML as the authored source.** It would contradict ADR-0121 — a component's spec is its
  file, its stories and its contract — and add a fifth hand-maintained copy of the description.
- **Emitting DSDS exactly.** It forces per-value prose we do not own, so the result is valid but
  partly empty, and it ties a gated output to a 0.x draft that "can still change". A DSDS export
  can be added later from this projection if a consumer appears.
- **Line numbers in `checks`.** The drift gate would fire on every unrelated edit to a spec file.
- **Extending `llms-full.txt` instead.** It is prose for whole-file reading; the projection is for
  per-component lookup and keeps rule, proof and source together as data.

## Consequences

- An agent gets one file per component with purpose, rules, how each rule is proven, and the
  deliberate Figma ↔ code mismatches with their reasons — the part no external format carries.
- Toast and code-block have no metadata and are listed under `missing` in `index.json` rather
  than filled from hand-written docs data.
- The site sits behind Basic Auth (ADR-0173), so the hosted `/.well-known/components/` files are
  readable only with the password; in a repo checkout they are plain files.
- Two shared helpers changed to make this possible: `ts-eval.js` folds string concatenation
  (contract reasons came back `null` before), and `behavior-coverage.mjs` exports its binding
  finder. The gate chain stayed green across both.
- Weakest point: the token list is every `--ui-*` the stylesheet references (35 for AtlButton),
  which is complete but noisy, and usage rules remain unverified prose — the projection makes
  that gap visible, it does not close it.
- Long-term home is `@conciso/design-contracts` in the CDS (ADR-0165, P6); the generator moves
  with it after the first cohort.
