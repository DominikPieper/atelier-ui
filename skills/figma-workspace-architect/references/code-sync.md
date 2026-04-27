# Code-sync — Figma Variables ↔ code tokens

A workspace where Figma is in sync with the codebase is rarer than it should be. Most setups drift the moment a designer renames a Variable or a developer hardcodes a hex value "just for now". This file covers the architectural choices that determine whether a system stays in lockstep — not the mechanics of any specific exporter.

> **Out of scope here:** end-to-end Style Dictionary tutorials, Token Studio configuration UI walkthroughs, or platform-specific code-gen (iOS XML, Android Compose, etc.). Pick the sync direction and approach in this file; defer the wiring to the exporter's own docs.

## Pick a direction first

Bidirectional sync is the trap. Two systems both trying to be authoritative produce constant conflicts and force a manual reconciliation step that nobody wants to own.

| Direction         | Choose when…                                                                                         | Cost                                                  |
|-------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **Figma → code**  | Design-led shop. Designers iterate in Figma; engineering consumes. Default for most product teams.   | Need an export pipeline. Engineers can't tweak tokens directly. |
| **Code → Figma**  | Engineering-led shop or token system originated in code (e.g. a tokens.json shipped with the lib).   | Designers can't iterate freely. Updates require a PR. |
| **Bidirectional** | Almost never the right answer. Two sources fight every change.                                       | Constant conflicts; reconciliation overhead.          |

Pick one and **enforce** it: the non-canonical side is read-only. If both sides need write access, you have a process problem disguised as a tooling problem.

## Approaches

Four common ways to keep the two in lockstep, ordered by complexity.

### 1. Manual sync — only at very small scale

If you have ~30 tokens across one mode and one designer + one engineer who talk daily, manual sync via PR review is fine. The moment you cross 100 tokens, modes, or contributors, retire it.

Anti-pattern: pretending you have manual sync when you actually have **no sync** — the value drifted six weeks ago and nobody noticed.

### 2. Style Dictionary — recommended default for Figma → code

Reasonable choice for greenfield. Workflow:

1. Source-of-truth JSON tokens are committed to the repo (e.g. `tokens.source.json`).
2. A Figma export plugin/script writes the JSON from Figma Variables.
3. Style Dictionary transforms the JSON into per-platform outputs (CSS custom properties, Sass, JS, iOS, Android).
4. CI fails if the JSON drifts from the Figma file (re-export and diff).

Fits Figma → code. Modes map to Style Dictionary's "themes" or to nested keys per mode.

Trade-off: Style Dictionary doesn't read Figma directly — you still need an exporter (the `figma-console-mcp` `figma_get_variables` is one option; Token Studio exports another). Style Dictionary handles the *transformation* layer, not the *extraction* layer.

### 3. Token Studio — most popular for design-led teams

Figma plugin that stores Variables as JSON in a Git repo. Designers edit in Figma; the plugin commits the JSON. CI runs Style Dictionary (or similar) on the committed JSON to produce code outputs.

Strengths:
- Designers stay in their tool.
- Git history is the audit log.
- Free Studio version covers most needs.

Trade-offs:
- The Figma plugin has its own model; you trade the native Figma Variables editor for the plugin's UI in some workflows.
- Aliases inside Figma may export differently than expected; verify after first sync.

### 4. Custom export via `figma-console-mcp`

When Style Dictionary and Token Studio are too heavyweight or impose constraints you don't want, write a small script that calls `figma_get_variables`, walks the resulting tree, and writes platform outputs directly.

Sketch:

```js
// figma-tokens-export.mjs
import fs from 'node:fs/promises';
const data = await getVariablesFromMcp();   // figma_get_variables
const cssLines = [];
for (const collection of data.meta.variableCollections) {
  for (const mode of collection.modes) {
    const selector = mode.name === 'Light' ? ':root' : `[data-theme="${mode.name.toLowerCase()}"]`;
    cssLines.push(`${selector} {`);
    for (const variable of Object.values(data.meta.variables)) {
      if (variable.variableCollectionId !== collection.id) continue;
      const value = resolveValue(variable.valuesByMode[mode.modeId], data);
      cssLines.push(`  --${cssNameFor(variable.name)}: ${formatValue(value, variable.resolvedType)};`);
    }
    cssLines.push('}');
  }
}
await fs.writeFile('tokens.css', cssLines.join('\n'));
```

Use this when:
- The token shape is unusual (e.g. multi-tier with aliases that flatten in Token Studio).
- You only target one platform (CSS) and the full Style Dictionary pipeline is overkill.
- You want CI to fail on drift and have full control over the diff.

Trade-off: you own the exporter forever. Plan for ~50 LOC to start, ~200 LOC after the first edge cases.

## Mode mapping — the most common bug

Most drift is silent because Modes are handled wrong. The mapping must be explicit.

| Figma Mode example | CSS pattern                                                                                              | JSON pattern                                                |
|--------------------|----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| `Light` / `Dark`   | `:root { … }` for Light; `[data-theme="dark"] { … }` and `@media (prefers-color-scheme: dark) { … }` for Dark | `{ "color": { "primary": { "light": "#…", "dark": "#…" } } }` |
| Density (`Comfortable` / `Compact`) | `[data-density="compact"] { … }`                                                          | Per-mode key, same shape as themes                          |
| Brand (`Brand A` / `Brand B`)       | Per-brand selector or per-app build                                                       | Per-brand key                                               |

Test: change a Variable's value in only one Mode in Figma; re-export; verify only one selector / key changed in code. If both changed, the exporter is collapsing modes.

## Annotations as a code-handoff layer

Variables carry the *static value* contract; **annotations** carry the *implementation-detail* contract — animation easings, focus-ring delivery mechanism, tap-target extensions, A11y notes. Treat them as a first-class part of code-sync, not as designer marginalia.

| Direction         | What to do with annotations                                                                                       |
|-------------------|-------------------------------------------------------------------------------------------------------------------|
| **Figma → code**  | Pull annotations via `figma_get_annotations` after each export. Surface them in the same place as token diffs (PR description, Style Dictionary metadata, story `parameters.design`). |
| **Code → Figma**  | When code-side specs change (e.g. animation tokens migrate to a new easing curve), write the new spec back into the relevant component's annotations via `figma_set_annotations`. The Figma file should never lag the code on implementation details a designer cares about. |

Annotation content that should round-trip:

- Focus-ring delivery (drop-shadow vs. stroke) — see `code-verify.md` for why this matters.
- Animation/easing tokens that are not Variables (because Figma can't bind effect-curves yet).
- Tap-target / safe-area extensions beyond the visible frame.
- A11y exceptions (e.g. "non-color cue delivered via inset shadow on fill" — common in danger buttons).

## Cross-file Variable resolution — linked libraries

A common architecture is **one Tokens file** (Primitive + Semantic Variables) consumed by **N Component files** as a linked library. The patterns below cover what to expect.

### What links cleanly

- **Variables**. Component files reference Tokens-library Variables by ID — values resolve at consume-time. Mode switches in the consuming file follow the local mode mapping.
- **Components**. Library components instantiate by `componentKey`; `figma_search_components` and `figma_get_library_components` find them across files.

### What does NOT auto-link

- **Mode names**. Library Swap matches Modes by **exact name**. If the Tokens file has `Light`/`Dark` and a consuming file has `light`/`dark`, the swap leaves bindings unresolved. Standardize casing across all files.
- **Variant Property values**. Same exact-name match rule. `Size: Small` in one file and `Size: small` in another won't merge cleanly.

### Cross-file discovery tools

| Tool                              | Use when…                                                                       |
|-----------------------------------|---------------------------------------------------------------------------------|
| `figma_get_library_components`    | List a linked library's published components — what's available to instantiate. |
| `figma_get_design_system_kit`     | Fetch tokens + components + styles from any file in one call. Useful when the agent needs to compare a Component file against the Tokens file. |
| `figma_search_components`         | Find a component by name across the file or a linked library.                   |

### Audit signal — local Variables that should consume

A Component file that defines its own `color/*` Variables (instead of consuming the Tokens-library Variables) is a Critical drift source. In a properly linked setup, the Component file's Variable list should contain only **component-tier** Variables (if any) plus inherited library references. Local Primitive or Semantic Variables in a Component file mean someone built the file before linking the library, or the link broke.

## Closing the sync — `figma_check_design_parity`

End every Sync run with a parity check. Schema:

```jsonc
// Input — codeSpec (one block per axis you want compared)
{
  "visual":          { /* fills, strokes, opacity, radius */ },
  "spacing":         { /* padding, gap, margins */ },
  "typography":      { /* font family, size, weight, line-height, letter-spacing */ },
  "tokens":          { /* expected Variable bindings */ },
  "componentAPI":    { /* prop names + values */ },
  "accessibility":   { /* roles, labels, contrast minimums */ },
  "metadata":        { /* description text, slash-name shape */ }
}
```

Output:

```jsonc
{
  "score": 0–100,
  "discrepancies": [ /* per-axis diffs, severity-tagged */ ],
  "actionItems":   [ /* concrete fix steps */ ]
}
```

Use `figma_scan_code_accessibility` (axe-core against rendered HTML, no Figma needed) to seed the `accessibility` axis before calling `figma_check_design_parity` — the `mapToCodeSpec` option produces input compatible with the parity tool.

Optional: when parity fails on a component the team needs to see in-Figma, drop a comment via `figma_post_comment` on the affected frame so the next designer who opens the file sees the drift even if they skim the chat output.

## Common drift sources

Add these to the Audit checklist's "Engineering-Sync Readiness" category — they are the failure modes to expect.

- **Variable scope mismatch.** A Variable with `ALL_SCOPES` (the default) shows up in property pickers it doesn't belong in. The export pipeline doesn't know the difference; designers will use the wrong token. Fix: set Scopes explicitly via `figma_execute` after creation. See `token-architecture.md`.
- **Renamed Variable not picked up.** Most exporters key by *name*, not ID. A rename = a delete + recreate from the exporter's view. Mitigation: enforce a `rename → run export → review diff` ritual.
- **Mode added in Figma, not propagated.** The exporter only knows about modes it has seen before. New mode = new branch in the output structure. Often forgotten.
- **Hardcoded fallbacks in CSS.** `color: var(--ui-color-primary, #007070);` — the fallback hex *was* the Figma value six months ago. Now the Figma value is `#0a8080` but the fallback is still `#007070` and silently wins when the Variable is undefined. Fix: drop fallbacks, or enforce a CI check that fallbacks match the resolved Variable value.
- **Aliases flattened in export.** Figma supports `--ui-color-primary → primitive/teal/600`. Some exporters resolve the alias and emit only the leaf value, losing the semantic layer. Fix: emit both or document the choice explicitly.
- **Manual edits to the generated file.** Someone tweaks `tokens.css` directly. Next export overwrites it. Fix: top-of-file banner saying `/* AUTO-GENERATED — do not edit. Source: Figma Variables. */` and a CI check that the file is committed unchanged after a fresh export.

## Project-level notes for this Atelier UI repo

The Atelier UI workspace currently maintains tokens in two places:

- **Figma:** `Atelier UI` file (key `QMnDD8uZQPldPrlCwZZ58T`) → `UI Tokens` Variable Collection with `Light` and `Dark` modes.
- **Code:** `libs/{angular,react,vue}/src/styles/tokens.css` (one CSS file per framework, currently kept in sync manually). `docs/src/styles/tokens.css` re-imports from the React copy.

State of sync at time of writing: manually maintained. Figma was bootstrapped from the original code-side tokens; ongoing changes happen on whichever side the contributor is in, with PR review as the reconciliation point. This works because the change rate is low (token additions are rare) — but it is the "very small scale" case from §1, and will need formalization the moment that changes.

When that day comes, the recommended path is approach **#4 (custom export via figma-console-mcp)** because:

- The token shape is straightforward (3-tier semantic, two modes, ~140 variables) — Style Dictionary's transformation layer is overkill.
- Three CSS files to write per export, all near-identical (the React copy is the master, Angular/Vue mirror it). A 50-LOC script handles this.
- A CI check that runs the export and fails on drift fits the existing `tools/scripts/check-*.js` family naturally.

Until then: any token change must update Figma + all three `tokens.css` files explicitly, and the PR description should call out which side was the source.
