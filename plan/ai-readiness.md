# AI-Readiness Spec

A structured design system is the prerequisite for reliable AI tooling. Without it, agents hallucinate props, generate off-brand output, and burn tokens on context-loading instead of building. This spec defines what "AI-ready" means for Atelier across four layers: component metadata, token architecture, Storybook MCP, and Figma library.

> [!info] Sources
> Distilled from three Content Vault clips read together: the ARC protocol, the Storybook MCP / Component Manifest model, and the Cascade Effect framing of tokens-as-intent.

---

## 1. Component Metadata

### Rationale

An agent exploring the codebase without metadata reverse-engineers purpose, constraints, and relationships from raw source — expensive, inaccurate, and variable across runs. `.metadata.ts` files encode what a senior developer carries in their head. Combined with the existing `gen-llms-txt` Drift-Gate, they become the primary context layer for any agent working in `libs/spec`.

Benchmark from the ARC experiment: metadata-backed agents were 2.5× faster, 54% more accurate, and showed near-zero variance between runs.

### Location

Single source of truth at `libs/spec/src/metadata/<component>.metadata.ts`. **Not** duplicated per framework — there is one metadata file per spec interface group (e.g. `avatar.metadata.ts` covers Avatar + AvatarGroup). Framework stories import from here directly so the same string serves the type checker, the story description, and `llms-full.txt`.

### Required shape per component

```typescript
// libs/spec/src/metadata/types.ts
export interface ComponentMetadata {
  /** Spec interface name, e.g. 'LlmButtonSpec' */
  specName: string;
  /** One sentence: what this component does. Maps to story description.component. */
  purpose: string;
  /** When to reach for this component. */
  whenToUse: string[];
  /** When NOT to use and what to use instead. */
  antiPatterns: { pattern: string; useInstead: string }[];
  /** Other spec names this component composes or pairs with. */
  relatedComponents: string[];
  /** Supported variant combos — mirrors check-variants axis expectations. */
  variantMatrix: Record<string, string | number | boolean>[];
  /** ARIA role + keyboard summary for AI a11y checks. */
  accessibility: { role: string; keyboardBehavior: string };
}
```

### Drift-Gate

`check:metadata` — verifies that every component spec exported from `libs/spec/src/index.ts` has a co-located `.metadata.ts` with every required field populated, and that `variantMatrix` covers every union member tracked in `tools/scripts/lib/component-axes.js`.

---

## 2. Token Architecture

### Rationale

The Cascade Effect principle: CSS cascades values, but a well-structured design system cascades *intent*. Tokens that only encode a value (`--ui-color-primary: #3b82f6`) give agents no signal about purpose, constraints, or when overrides are valid. Tokens that encode intent enable agents to make correct decisions downstream without asking.

Atelier already uses `--ui-*` CSS tokens with intent-leaning names (`--ui-color-primary`, `--ui-color-surface-raised`, `--ui-color-text-muted`). **Decision: annotate, don't rename.** A separate manifest carries the agent-readable metadata; the CSS tokens stay where they are.

### Manifest shape

```typescript
// libs/spec/src/tokens.manifest.ts
export interface TokenAnnotation {
  /** Agent-readable purpose. What the token is for, not what it looks like. */
  intent: string;
  /** Constraints an agent must respect ("high contrast required"). */
  constraints: string[];
  /** Optional companion token in the dark theme. */
  darkMode?: string;
}
export const tokens: Record<string, TokenAnnotation> = {
  // populated for every --ui-* token declared in libs/{angular,react,vue}/src/styles/tokens.css
};
```

This feeds into `gen-llms-txt` as a token context block — agents get the constraint, not just the hex value.

### Drift-Gate

`check:css-tokens` is extended with a second pass: every `--ui-*` token declared in `tokens.css` must have a manifest entry with non-empty `intent` and non-empty `constraints`; every manifest entry must reference a declared token. The existing pass (no raw color literals in component CSS) is unchanged.

### Three-tier rename — deferred

The original sources propose `--ui-color-{intent}-{layer}-{state}` taxonomy. Deferred. Revisit after the annotation layer has been used in anger; a rename is a breaking change that should wait for evidence the existing names actually fall short for agents.

---

## 3. Storybook MCP

### Rationale

Without curated context, agents burn 50K–100K tokens per task loading raw source. Storybook MCP generates a **Component Manifest** — a machine-readable payload with APIs, prop types, validated usage examples, and tests. Agents consume this instead of the filesystem.

Atelier already has hosted Storybook MCP at `atelier.pieper.io/storybook-{angular,react,vue}/mcp`. This spec defines what must be true in the Stories for the manifest to be useful.

### Story requirements

For the Component Manifest to carry real context, each component story must:

1. **Explicit `argTypes`** — never inferred. Every prop in `libs/spec` must have a corresponding `argType` with `description`, `control` type, and `table.category`. (Already true repo-wide as of this writing — keep it true.)

2. **Component-level description** — `parameters.docs.description.component` is sourced from the metadata barrel: `import { metadata } from '../../../../spec/src/metadata/<component>.metadata'; parameters: { docs: { description: { component: metadata.purpose } } }`. This collapses the metadata and the story description into one source.

3. **State coverage** — stories must cover all entries in `variantMatrix` from the metadata file. Enforced by aligning `check-variants` with the metadata shape.

4. **Subcomponent docs** — for compound components, subcomponent APIs are included automatically (supported in `@storybook/mcp@0.7.0+`, already in `package.json`).

### Drift-Gate

`check:story-descriptions` — for every story file under `libs/{angular,react,vue}/src/lib/`, verifies that `parameters.docs.description.component` is set AND that the value is sourced from the metadata import (not a string literal).

### Angular and Vue emit their own manifests (ADR-0097)

As of Storybook 10.6, `@storybook/angular-vite` and `@storybook/vue3-vite` emit real, framework-native `components.json` for Angular and Vue via `experimentalDocgenServer` (backed by `angular-component-meta` / `vue-component-meta`) — the same manifest mechanism React's framework package already produced. The hosted MCP surface now serves each framework's own manifest; the worker's earlier React-manifest substitution (ADR-0083, in force from 2026-08-29 to 2026-09-05) is deleted, not shrunk (ADR-0097). `check:manifests` gates the artefact: it builds all three Storybooks and asserts each framework's `components.json` exists, is non-empty, and carries a resolvable `docgen` reference — closing the hole ADR-0083's context named but did not act on (nothing previously read a Storybook build's manifest output at all).

---

## 4. Figma Library Machine-Readiness

### Rationale

The Figma Console MCP reads directly from the Figma file, not from screenshots or specs. The quality of generated code is entirely determined by how machine-readable the library is. "MCP works best when there's a well-structured design system behind it. Without it, you're giving the assistant a map with no legend."

### Checklist per component

For each master `COMPONENT_SET` on the Components page of `QMnDD8uZQPldPrlCwZZ58T`:

- **Complete variant states** — every variant defined in `libs/spec` (and listed in the component's `variantMatrix`) exists as a Figma variant.
- **Component description annotated** — each component has a Figma description that matches `metadata.purpose`. Each variant has a description explaining when it applies.
- **Token-linked styles** — no hardcoded color, spacing, or typography values. All styles reference `--ui-*` tokens via Figma Variables.
- **Auto layout throughout** — all frames use Auto Layout, not absolute positioning. Required for AI tools to infer responsive intent.
- **Name alignment** — Figma component names match the API names in `libs/spec`. Mismatches break MCP-to-code mapping.

The full checklist lives at `plan/figma-component-checklist.md` and is reproduced as a required section of every PR that adds or renames a component.

### Enforcement

Automated via **`check:figma`** (ADR-0019) plus the PR-template checklist for the items the gate cannot cover (per-variant descriptions, Inventory page). The gate is offline: it reads a committed snapshot (`tools/figma/snapshot.json`), refreshed by `npm run figma:snapshot` over the figma-console Desktop Bridge. **`check:figma` runs inside `check:all`** (ADR-0034, 2026-08-26), promoted alongside `check:parity`. The promotion was recorded *with its stated precondition still unmet*: a snapshot-freshness policy (failing or warning past a max age, populating `figmaLastModified`) was never built, so a green `check:figma` proves the committed snapshot is internally consistent, not that it is still fresh against the live Figma file — see ADR-0019 for the original trade-off and ADR-0034 for the promotion record and its open freshness gap.

---

## Drift-Gate Summary

| Gate | Status | Checks |
|------|--------|--------|
| `check:metadata` | **shipped** | `.metadata.ts` exists for every spec interface; all fields populated; `variantMatrix` covers axis unions |
| `check:story-descriptions` | **shipped** | Every story sets `parameters.docs.description.component` and sources it from `metadata.purpose` |
| `check:css-tokens` | **shipped** | (existing) no raw literals + (added) every `--ui-*` token has manifest entry with `intent` + `constraints` |
| `check:llms` (via `gen-llms-txt --check`) | **shipped** | Generator now reads `metadata/` + `tokens.manifest.ts`; existing drift-check covers it |
| `check:figma` (via `figma-snapshot` + offline check) | **shipped** (ADR-0019; promoted into `check:all` by ADR-0034) | Per master: name alignment + variant-matrix (Blocker), token-link coverage + auto-layout (Critical), description congruence (Warning). Runs offline against a committed snapshot (now covering all 43 masters); snapshot-freshness policy still open. |

Existing gates unchanged: `check:sync`, `check:variants`, `check:exports`, `check:defaults`, `check:docs`, `check:behavior`, `check:spec`, `check:tokens`, `check:cookbook`, `check:cookbook-manifest`.

---

## Future work

- ~~**Automated Figma audit**~~ — shipped as `check:figma` (ADR-0019), covering all 43 masters (the snapshot grew past the original P0 core of 3, and past the 27-master count this section once cited, as new masters were promoted) and promoted into `check:all` (ADR-0034, 2026-08-26). Remaining follow-up: the snapshot-freshness policy ADR-0019 deferred and ADR-0034 promoted around is still unbuilt — nothing yet fails or warns when the committed snapshot has gone stale against the live Figma file.
- **`llms.json` sidecar** — a machine-readable JSON alongside `llms.txt` for agents that prefer structured input over Markdown.
- **Three-tier token rename** — `--ui-color-{intent}-{layer}-{state}` taxonomy. Revisit when the annotation layer has been used in anger.
