---
status: accepted
date: 2026-07-21
sources:
  - user request ("Kürzel LLM vor Komponenten passt nicht mehr zum Projektnamen")
supersedes: null
---

# Rename component naming prefix from `Llm` to `Atl`

## Status

Accepted.

## Context

ADR-0001 established a maximally predictable, LLM-inferable API surface and,
as part of that, prefixed every component/tag/token/prop with `Llm`/`llm-`/
`LLM_` (`LlmButton`, `llm-button`, `LLM_DIALOG`, `llmTooltip`). The npm scope
is `@atelier-ui/*` and the project's own name is "Atelier" — the `Llm` prefix
reads as a reference to a specific vendor/technology term rather than the
project's own brand, and no longer fits now that the project has its own
established name.

This does not revisit ADR-0001's underlying decision (an API shape a model
can infer correctly from types alone) — only the literal token used as the
prefix.

## Decision

Rename the naming-convention prefix `Llm` → `Atl` (Atelier) across every
identifier kind, same casing rules as before:

| Identifier kind | Before | After |
|---|---|---|
| kebab-case tag/CSS class/CSS custom property | `llm-button`, `--llm-separator` | `atl-button`, `--atl-separator` |
| PascalCase class/component/type | `LlmButton`, `LlmButtonSpec` | `AtlButton`, `AtlButtonSpec` |
| mid-word PascalCase | `useLlmToast` | `useAtlToast` |
| camelCase prop | `llmTooltipPosition` | `atlTooltipPosition` |
| SCREAMING_SNAKE token | `LLM_DIALOG` | `ATL_DIALOG` |

Scope is deliberately bounded to naming-convention identifiers, not every
occurrence of the string "llm" in the repo:

- **In scope**: `libs/spec/src`, `libs/{angular,react,vue}/src`,
  `libs/create-workspace` generator templates, `tools/generators/`,
  `tools/scripts/`, `tools/figma/`, `docs/src/`, `skills/atelier-design/`,
  `README.md`, the live Figma file's master component names, the committed
  a11y-parity snapshot filenames.
- **Explicitly out of scope**: `plan/`, `tasks/`, `CHANGELOG.md` (historical
  records — this ADR and ADR-0001 document the naming decision at the time it
  was made; retroactively editing history would violate the same
  recorded-at-the-time principle this ADR itself follows), the
  `figma-workspace-architect` skill (generic, repo-agnostic example, not
  specific to this project), `docs/public/llms.txt`/`llms-full.txt`
  (generated output, regenerated rather than hand-edited), and every
  legitimate prose use of "LLM" as the AI-technology term (the `llms.txt`
  feature name, the `astro-llms-md` dependency, npm `keywords`/`description`
  fields describing LLM-inferability — unaffected by this rename since they
  describe the *value proposition*, not the identifier prefix).

## Consequences

- Breaking change to the public API of `@atelier-ui/angular`,
  `@atelier-ui/react`, and `@atelier-ui/vue` (every tag, class, injection
  token, and prop name changes). Covered under ADR-0023's pre-1.0 band —
  ships as a `feat!`/`BREAKING CHANGE` commit, no special version gate
  needed.
- Requires a paired rename of the Figma file's master component names
  (`<Section>/LlmX` → `<Section>/AtlX`) landed in the same window — ADR-0019's
  `check:figma` gate compares code selectors against the committed Figma
  snapshot by exact name and is BLOCKER-severity, so a rename on only one
  side fails required CI regardless of direction.
- Alternatives considered: keeping `Llm` (rejected — it's the reason this ADR
  exists); shipping temporary dual-export compatibility aliases during a
  gradual migration (rejected — `check:spec`'s copy-identity gate makes
  per-framework spec drift impossible anyway, and it adds exactly the kind of
  workaround surface CLAUDE.md's "no compatibility shims" rule disallows).
- `plan/`, `tasks/`, `CHANGELOG.md`, and the `figma-workspace-architect` skill
  are deliberately left with `Llm`/`llm-` references after this change — not
  an oversight, see Decision above.
